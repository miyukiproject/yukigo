import { ASTNode, PrimitiveValue } from "yukigo-ast";
import { YukigoKernel } from "./index.js";

/**
 * A Continuation is a function that receives a value and decides what is the next Command to execute
 */
export type Continuation = (result: PrimitiveValue) => ExecutionCommand;

export interface ExecutionCommand {
  readonly name: string;
  execute(kernel: YukigoKernel): ExecutionCommand | void;
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
}

/**
 * Commands the Kernel to move to the next step with a produced value.
 * It triggers the popping of the continuation stack in the kernel.
 */
export class StepCommand implements ExecutionCommand {
  readonly name = "STEP";

  constructor(public readonly value: PrimitiveValue) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    return kernel.popAndExecute(this.value);
  }
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
}

/**
 * Commands the Kernel to halt execution due to an error or a logic failure.
 */
export class FailCommand implements ExecutionCommand {
  readonly name = "FAIL";

  constructor(
    public readonly error: Error,
    public readonly isLogicFailure: boolean = false,
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    if (this.isLogicFailure) {
      return kernel.handleBacktrack();
    }
    throw kernel.buildSemanticError(this.error);
  }
}
