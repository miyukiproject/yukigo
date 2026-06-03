import {
  EquationRuntime,
  PrimitiveValue,
  UnguardedBody,
  Sequence,
  Return,
  Function,
  RuntimeFunction,
  isRuntimeFunction,
} from "yukigo-ast";
import { Bindings } from "../../index.js";
import { PatternMatcher } from "../PatternMatcher.js";
import { Evaluator } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { EnvBuilderVisitor } from "../EnvBuilder.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { InterpreterVisitor } from "../Visitor.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
} from "../kernel/commands.js";

class NonExhaustivePatterns extends InterpreterError {
  constructor(funcName: string) {
    super("PatternMatch", `Non-exhaustive patterns in '${funcName}'`);
  }
}

type EvaluatorFactory = (ctx: RuntimeContext) => Evaluator;

export class FunctionRuntime {
  constructor(private context: RuntimeContext) {}

  public apply(
    func: RuntimeFunction,
    args: PrimitiveValue[],
  ): ExecutionCommand {
    const funcName = func.identifier;
    const equations = func.equations;
    const oldEnv = this.context.env;

    const tryNextEquation = (eqIndex: number): ExecutionCommand => {
      if (eqIndex >= equations.length) {
        this.context.setEnv(oldEnv);
        throw new NonExhaustivePatterns(funcName ?? "<anonymous>");
      }

      const eq = equations[eqIndex];
      if (eq.patterns.length !== args.length)
        return tryNextEquation(eqIndex + 1);

      const bindings: Bindings = [];

      return new BindCommand(this.patternsMatch(eq, args, bindings), (isMatch) => {
        if (!isMatch) return tryNextEquation(eqIndex + 1);

        const localEnv = new Map<string, PrimitiveValue>(bindings);
        if (func.closure) this.context.setEnv(func.closure);
        this.context.pushEnv(localEnv);

        const evaluatorFactory: EvaluatorFactory = (ctx) =>
          new InterpreterVisitor(ctx);

        const body = eq.body;

        // Restore env after body execution
        const nextWithEnvRestore = (res: PrimitiveValue) => {
           this.context.setEnv(oldEnv);
           return new StepCommand(res);
        }

        // UnguardedBody
        if (body instanceof UnguardedBody)
          return new BindCommand(
            this.evaluateSequence(body.sequence, this.context, evaluatorFactory),
            nextWithEnvRestore
          );

        // GuardedBody
        if (Array.isArray(body) && body.length > 0) {
          const prototypeBody = body[0].body;
          if (prototypeBody instanceof Sequence)
            this.preloadDefinitions(prototypeBody, evaluatorFactory);
        }

        const tryNextGuard = (guardIndex: number): ExecutionCommand => {
          if (guardIndex >= body.length) {
            this.context.setEnv(oldEnv);
            return tryNextEquation(eqIndex + 1);
          }

          const evaluator = evaluatorFactory(this.context);
          const guard = body[guardIndex];
          return new BindCommand(evaluator.evaluate(guard.condition), (cond) => {
            if (cond !== true) return tryNextGuard(guardIndex + 1);

            if (!(guard.body instanceof Sequence))
              return new BindCommand(evaluator.evaluate(guard.body), nextWithEnvRestore);

            return new BindCommand(
              this.evaluateSequence(guard.body, this.context, evaluatorFactory),
              nextWithEnvRestore
            );
          });
        };

        return tryNextGuard(0);
      });
    };

    return tryNextEquation(0);
  }

  public applyArguments(
    func: RuntimeFunction,
    args: (PrimitiveValue | (() => PrimitiveValue))[],
  ): ExecutionCommand {
    if (args.length < func.arity) {
      return new StepCommand({
        ...func,
        pendingArgs: args,
      });
    }

    const argsToConsume = args.slice(0, func.arity);
    const remainingArgs = args.slice(func.arity);

    const evaluatedArgs = argsToConsume.map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );

    return new BindCommand(this.apply(func, evaluatedArgs), (result) => {
      if (remainingArgs.length > 0) {
        if (isRuntimeFunction(result)) {
          const nextArgs = result.pendingArgs
            ? [...result.pendingArgs, ...remainingArgs]
            : remainingArgs;

          return this.applyArguments(result, nextArgs);
        } else {
          return new FailCommand(
            new Error(`[Application] Too many arguments provided. Result was '${result}' (not a function), but had ${remainingArgs.length} args left.`),
          );
        }
      }
      return new StepCommand(result);
    });
  }

  private preloadDefinitions(
    seq: Sequence,
    evaluatorFactory: EvaluatorFactory,
  ): void {
    const ctx = new RuntimeContext();
    new EnvBuilderVisitor(ctx).build(seq.statements);
    const evaluator = evaluatorFactory(ctx);

    for (const stmt of seq.statements) {
      if (stmt instanceof Function || stmt instanceof Return) continue;
      // We ignore the result of preload
      evaluator.evaluate(stmt); 
    }
  }

  private patternsMatch(
    eq: EquationRuntime,
    args: PrimitiveValue[],
    bindings: Bindings,
  ): ExecutionCommand {
    const matchNext = (index: number): ExecutionCommand => {
      if (index >= args.length) return new StepCommand(true);

      const matcher = new PatternMatcher(args[index], bindings, this.context);

      return new BindCommand(eq.patterns[index].accept(matcher), (isMatch) => {
        if (!isMatch) return new StepCommand(false);
        return matchNext(index + 1);
      });
    };

    return matchNext(0);
  }

  private evaluateSequence(
    seq: Sequence,
    ctx: RuntimeContext,
    evaluatorFactory: EvaluatorFactory,
  ): ExecutionCommand {
    new EnvBuilderVisitor(ctx).build(seq.statements);
    const evaluator = evaluatorFactory(ctx);

    const evaluateNext = (
      index: number,
      lastResult: PrimitiveValue,
    ): ExecutionCommand => {
      if (index >= seq.statements.length) return new StepCommand(lastResult);

      const stmt = seq.statements[index];
      if (stmt instanceof Function)
        return evaluateNext(index + 1, lastResult);

      if (stmt instanceof Return) {
        if (!stmt.body)
          throw new Error("[FunctionRuntime]: Return \`body\` was undefined");
        return evaluator.evaluate(stmt.body);
      } else {
        return new BindCommand(evaluator.evaluate(stmt), (result) => {
          return evaluateNext(index + 1, result);
        });
      }
    };

    return evaluateNext(0, undefined);
  }
}
