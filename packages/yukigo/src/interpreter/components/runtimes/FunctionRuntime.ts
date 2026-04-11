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
import { ExpressionEvaluator } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { EnvBuilderVisitor } from "../EnvBuilder.js";
import { Continuation, CPSThunk, Thunk, valueToCPS } from "../../trampoline.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { InterpreterVisitor } from "../Visitor.js";

class NonExhaustivePatterns extends InterpreterError {
  constructor(funcName: string) {
    super("PatternMatch", `Non-exhaustive patterns in '${funcName}'`);
  }
}

type EvaluatorFactory = (ctx: RuntimeContext) => ExpressionEvaluator;

export class FunctionRuntime {
  constructor(private context: RuntimeContext) {}

  public apply(
    func: RuntimeFunction,
    args: PrimitiveValue[],
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    const funcName = func.identifier;
    const equations = func.equations;
    const oldEnv = this.context.env;

    if (this.context.config.debug)
      console.log(
        `[FunctionRuntime] Applying function: ${funcName} with args:`,
        args,
      );

    const tryNextEquation = (eqIndex: number): Thunk<PrimitiveValue> => {
      if (eqIndex >= equations.length) {
        this.context.setEnv(oldEnv);
        throw new NonExhaustivePatterns(funcName);
      }

      const eq = equations[eqIndex];
      if (eq.patterns.length !== args.length)
        return () => tryNextEquation(eqIndex + 1);

      const bindings: Bindings = [];

      return this.patternsMatch(eq, args, bindings, (isMatch) => {
        if (!isMatch) return () => tryNextEquation(eqIndex + 1);

        if (this.context.config.debug)
          console.log(
            `[FunctionRuntime] Match successful for ${funcName} equation ${eqIndex}`,
          );

        const localEnv = new Map<string, PrimitiveValue>(bindings);
        if (func.closure) this.context.setEnv(func.closure);
        this.context.pushEnv(localEnv);

        const wrappedK = (res: PrimitiveValue) => {
          this.context.setEnv(oldEnv);
          return k(res);
        };

        const evaluatorFactory: EvaluatorFactory = (ctx) =>
          new InterpreterVisitor(ctx);

        const body = eq.body;

        // UnguardedBody
        if (body instanceof UnguardedBody)
          return this.evaluateSequence(
            body.sequence,
            this.context,
            evaluatorFactory,
            wrappedK,
          );

        // GuardedBody
        return () => {
          if (Array.isArray(body) && body.length > 0) {
            const prototypeBody = body[0].body;
            if (prototypeBody instanceof Sequence)
              this.preloadDefinitions(prototypeBody, evaluatorFactory);
          }

          const tryNextGuard = (guardIndex: number): Thunk<PrimitiveValue> => {
            if (guardIndex >= body.length) {
              this.context.setEnv(oldEnv);
              return () => tryNextEquation(eqIndex + 1);
            }

            const evaluator = evaluatorFactory(this.context);
            const guard = body[guardIndex];
            return evaluator.evaluate(guard.condition, (cond) => {
              if (cond !== true) return () => tryNextGuard(guardIndex + 1);

              if (!(guard.body instanceof Sequence))
                return evaluator.evaluate(guard.body, wrappedK);

              return this.evaluateSequence(
                guard.body,
                this.context,
                evaluatorFactory,
                wrappedK,
              );
            });
          };

          return tryNextGuard(0);
        };
      });
    };

    return tryNextEquation(0);
  }

  public applyArguments(
    func: RuntimeFunction,
    args: (PrimitiveValue | (() => PrimitiveValue))[],
  ): CPSThunk<PrimitiveValue> {
    if (args.length < func.arity) {
      return valueToCPS({
        ...func,
        pendingArgs: args,
      });
    }

    const argsToConsume = args.slice(0, func.arity);
    const remainingArgs = args.slice(func.arity);

    const evaluatedArgs = argsToConsume.map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );

    return (cont) => () =>
      this.apply(func, evaluatedArgs, (result) => {
        if (remainingArgs.length > 0) {
          if (isRuntimeFunction(result)) {
            const nextArgs = result.pendingArgs
              ? [...result.pendingArgs, ...remainingArgs]
              : remainingArgs;

            return this.applyArguments(result, nextArgs)(cont);
          } else {
            throw new InterpreterError(
              "Application",
              `Too many arguments provided. Result was '${result}' (not a function), but had ${remainingArgs.length} args left.`,
            );
          }
        }
        return cont(result);
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
      evaluator.evaluate(stmt, (val) => val);
    }
  }

  private patternsMatch(
    eq: EquationRuntime,
    args: PrimitiveValue[],
    bindings: Bindings,
    k: Continuation<boolean>,
  ): Thunk<boolean> {
    const matchNext = (index: number): Thunk<boolean> => {
      if (index >= args.length) return k(true);
      const matcher = new PatternMatcher(args[index], bindings, this.context);
      return eq.patterns[index].accept(matcher)((isMatch) => {
        if (!isMatch) return k(false);
        return () => matchNext(index + 1);
      });
    };
    return matchNext(0);
  }

  private evaluateSequence(
    seq: Sequence,
    ctx: RuntimeContext,
    evaluatorFactory: EvaluatorFactory,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    new EnvBuilderVisitor(ctx).build(seq.statements);
    const evaluator = evaluatorFactory(ctx);

    const evaluateNext = (
      index: number,
      lastResult: PrimitiveValue,
    ): Thunk<PrimitiveValue> => {
      if (index >= seq.statements.length) return k(lastResult);

      const stmt = seq.statements[index];
      if (stmt instanceof Function)
        return () => evaluateNext(index + 1, lastResult);

      if (stmt instanceof Return) {
        return evaluator.evaluate(stmt.body, k);
      } else {
        return evaluator.evaluate(stmt, (result) => {
          return () => evaluateNext(index + 1, result);
        });
      }
    };

    return evaluateNext(0, undefined);
  }
}
