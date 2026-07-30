import { ASTNode, Pattern } from "yukigo-ast";
import { YukigoKernel } from "./index.js";
import { ErrorFrame, InterpreterError } from "../../errors.js";
import { LogicTranslator } from "../logic/LogicTranslator.js";
import { Scope } from "../logic/LogicEngine.js";
import { ListTerm } from "../logic/LogicTerm.js";
import {
  YuValue,
  Substitution,
  isLogicResult,
  LogicResult,
  LogicAnswer,
  LogicTerm,
} from "../../primitives/index.js";
import { InterpreterVisitor } from "../evaluators/index.js";

/**
 * A Continuation is a function that receives a value and decides what is the next Command to execute
 */
export type Continuation = (result: YuValue) => ExecutionCommand;

export type TraceEntry = { frame: ErrorFrame; key: string };

export interface ExecutionCommand {
  readonly name: string;
  execute(kernel: YukigoKernel): ExecutionCommand | void;
  createTraceEntry(): TraceEntry | void;
}

/**
 * Commands the Kernel to evaluate an AST node.
 */
export class EvalCommand implements ExecutionCommand {
  readonly name = "EVAL";

  constructor(public readonly node: ASTNode) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    return kernel.evaluator.evaluate(this.node);
  }
  createTraceEntry(): TraceEntry {
    const { constructor, loc } = this.node;
    const frame = {
      nodeType: constructor.name,
      loc,
    };
    const startLoc = loc ? `${loc.line}:${loc.column}:` : "";
    const key = `${startLoc}${constructor.name}`;
    return { key, frame };
  }
}

/**
 * Commands the Kernel to move to the next step with a produced value.
 * It triggers the popping of the continuation stack in the kernel.
 */
export class StepCommand implements ExecutionCommand {
  readonly name = "STEP";

  constructor(public readonly value: YuValue) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    return kernel.popAndExecute(this.value);
  }
  createTraceEntry() {}
}

/**
 * Commands the Kernel to bind a produced value to a continuation.
 * It pushes the continuation to the kernel's stack and proceeds with the command.
 */
export class BindCommand implements ExecutionCommand {
  readonly name = "BIND";

  constructor(
    public readonly command: ExecutionCommand,
    public readonly next: Continuation,
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    kernel.pushContinuation(this.next);
    return this.command;
  }
  createTraceEntry() {}
}

/**
 * Commands the Kernel to handle multiple branches of execution (non-determinism).
 * It will try the first one and save the others as choice points.
 */
export class ChoiceCommand implements ExecutionCommand {
  readonly name = "CHOICE";

  constructor(public readonly alternatives: ExecutionCommand[]) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    return kernel.handleChoice(this.alternatives);
  }
  createTraceEntry() {}
}

/**
 * Commands the Kernel to halt execution due to an error.
 */
export class FailCommand implements ExecutionCommand {
  readonly name = "FAIL";

  constructor(public readonly error: Error) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    throw kernel.buildSemanticError(this.error);
  }
  createTraceEntry() {}
}

// error handling commands

export class RaiseCommand implements ExecutionCommand {
  readonly name = "RAISE";

  constructor(public readonly exceptionObj: YuValue | InterpreterError) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    // Le decimos al kernel que inicie el proceso de desapilado para buscar un Catch
    return kernel.handleRaise(this.exceptionObj);
  }
  
  createTraceEntry() {}
}

/**
 * A CatchHandler is a function that receives the raised exception (YuValue) 
 * and decides what Command to execute next (usually the catch block body).
 */
export type CatchHandler = (exception: YuValue | InterpreterError) => ExecutionCommand;

export class CatchCommand implements ExecutionCommand {
  readonly name = "CATCH";

  constructor(
    public readonly handler: CatchHandler,
    public readonly innerCommand: ExecutionCommand // El cuerpo del try
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    // 1. Registramos este manejador de errores en el Kernel
    kernel.pushCatchHandler(this.handler);
    
    // 2. Ejecutamos el cuerpo del try envuelto en una limpieza
    // Si el innerCommand termina con éxito (sin errores), necesitamos sacar el handler de la pila
    return new BindCommand(this.innerCommand, (result) => {
      kernel.popCatchHandler(); // Removemos el handler porque no hubo error
      return new StepCommand(result);
    });
  }
  
  createTraceEntry() {}
}


// Specific commands for LogicRuntime

/**
 * Commands the Kernel to stop execution and backtrack due to logical failure.
 */
export class BacktrackCommand implements ExecutionCommand {
  readonly name = "BACKTRACK";

  constructor() {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    // the backtracking is delegated to the kernel because it manipulates the execution stack
    return kernel.handleBacktrack();
  }
  createTraceEntry() {}
}

export class NotCommand implements ExecutionCommand {
  readonly name = "NOT";

  constructor(
    public readonly innerGoalCmd: ExecutionCommand,
    public readonly currentSubsts: Substitution,
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    const isolatedContext = kernel.evaluator.getContext().clone();
    const isolatedEvaluator = new InterpreterVisitor(isolatedContext);
    const isolatedKernel = new YukigoKernel(isolatedEvaluator, "first");

    // Clone substs to avoid leaking bindings from the inner search
    const result = isolatedKernel.run(this.innerGoalCmd);
    if (isLogicResult(result) && result.allSuccessful())
      return new BacktrackCommand();

    return new StepCommand(
      new LogicResult([new LogicAnswer(true, new Map(this.currentSubsts))]),
    );
  }
  createTraceEntry() {}
}

export class FindallCommand implements ExecutionCommand {
  readonly name = "FINDALL";

  constructor(
    public readonly template: Pattern,
    public readonly bag: Pattern,
    public readonly innerGoalCmd: ExecutionCommand,
    public readonly currentSubsts: Substitution,
    public readonly scope: Scope,
    public readonly translator: LogicTranslator,
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    // we need to _find all_ (jaja lol) successful branches
    const isolatedContext = kernel.evaluator.getContext().clone();
    const isolatedEvaluator = new InterpreterVisitor(isolatedContext);
    const isolatedKernel = new YukigoKernel(isolatedEvaluator, "all");

    // run inner goal - it will return an array of LogicResult if successful
    const results = isolatedKernel.run(this.innerGoalCmd);
    const gathered: LogicTerm[] = [];

    if (Array.isArray(results)) {
      for (const res of results) {
        if (isLogicResult(res) && res.allSuccessful()) {
          // then we extract all solutions and instantiate the template
          res.getSuccessfulSolutions().forEach((solutionEnv) => {
            const templateTerm = this.translator.patternToTerm(
              this.template,
              this.scope,
            );
            gathered.push(templateTerm.instantiate(solutionEnv));
          });
        }
      }
    }

    // then we build a logic list
    const resultList = new ListTerm(gathered);
    const bagTerm = this.translator.patternToTerm(this.bag, this.scope);

    // then we try to unify the list with the bag
    const finalSubsts = new Map(this.currentSubsts);
    if (bagTerm.unify(resultList, finalSubsts))
      return new StepCommand(
        new LogicResult([new LogicAnswer(true, finalSubsts)]),
      );

    // finally if unification fails, findall fails
    return new BacktrackCommand();
  }
  createTraceEntry() {}
}
