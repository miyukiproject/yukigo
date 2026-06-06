import { Sequence, Return, Function, isUnguardedBody } from "yukigo-ast";
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
import {
  PrimitiveValue,
  PrimitiveThunk,
} from "../../../primitives/primitives.js";
import { EquationRuntime, isRuntimeFunction, RuntimeFunction } from "../../../primitives/RuntimeFunction.js";

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
        throw new NonExhaustivePatterns(func.name);
      }

      const eq = equations[eqIndex];
      if (eq.patterns.length !== args.length)
        return tryNextEquation(eqIndex + 1);

      const bindings: Bindings = [];

      return new BindCommand(
        this.patternsMatch(eq, args, bindings),
        (isMatch) => {
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
          };

          // UnguardedBody
          if (isUnguardedBody(body))
            return new BindCommand(
              this.evaluateSequence(
                body.sequence,
                this.context,
                evaluatorFactory,
              ),
              nextWithEnvRestore,
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
            return new BindCommand(
              evaluator.evaluate(guard.condition),
              (cond) => {
                if (cond !== true) return tryNextGuard(guardIndex + 1);

                if (!(guard.body instanceof Sequence))
                  return new BindCommand(
                    evaluator.evaluate(guard.body),
                    nextWithEnvRestore,
                  );

                return new BindCommand(
                  this.evaluateSequence(
                    guard.body,
                    this.context,
                    evaluatorFactory,
                  ),
                  nextWithEnvRestore,
                );
              },
            );
          };

          return tryNextGuard(0);
        },
      );
    };

    return tryNextEquation(0);
  }

  public applyArguments(
    func: RuntimeFunction,
    args?: (PrimitiveValue | PrimitiveThunk)[],
  ): ExecutionCommand {
    const targetFunc = args ? func.bind(...args) : func;
    const allArgs = targetFunc.pendingArgs ?? [];

    if (allArgs.length < targetFunc.arity) return new StepCommand(targetFunc);

    const argsToConsume = allArgs.slice(0, targetFunc.arity);
    const remainingArgs = allArgs.slice(targetFunc.arity);

    const evaluatedArgs = argsToConsume.map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );

    return new BindCommand(this.apply(targetFunc, evaluatedArgs), (result) => {
      if (remainingArgs.length == 0) return new StepCommand(result);
      if (!isRuntimeFunction(result))
        return new FailCommand(
          new Error(
            `[Application] Too many arguments provided. Result was '${result}' (not a function), but had ${remainingArgs.length} args left.`,
          ),
        );
      return this.applyArguments(result, remainingArgs);
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
      if (stmt.is(Function) || stmt.is(Return)) continue;
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
      if (stmt.is(Function)) return evaluateNext(index + 1, lastResult);

      if (!stmt.is(Return))
        return new BindCommand(evaluator.evaluate(stmt), (result) => {
          return evaluateNext(index + 1, result);
        });

      if (!stmt.body)
        throw new Error("[FunctionRuntime]: Return \`body\` was undefined");
      return evaluator.evaluate(stmt.body);
    };

    return evaluateNext(0, undefined);
  }
}
