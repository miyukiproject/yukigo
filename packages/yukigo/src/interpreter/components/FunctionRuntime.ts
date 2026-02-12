import {
  EquationRuntime,
  PrimitiveValue,
  UnguardedBody,
  Sequence,
  Return,
  EnvStack,
  Function,
} from "yukigo-ast";
import { Bindings } from "../index.js";
import { PatternMatcher } from "./PatternMatcher.js";
import { ExpressionEvaluator, pushEnv } from "../utils.js";
import { InterpreterError } from "../errors.js";
import { EnvBuilderVisitor } from "./EnvBuilder.js";
import { Continuation, Thunk } from "../trampoline.js";

class NonExhaustivePatterns extends InterpreterError {
  constructor(funcName: string) {
    super("PatternMatch", `Non-exhaustive patterns in '${funcName}'`);
  }
}

export class FunctionRuntime {
  static apply(
    funcName: string,
    equations: EquationRuntime[],
    args: PrimitiveValue[],
    currentEnv: EnvStack,
    evaluatorFactory: (env: EnvStack) => ExpressionEvaluator,
    k: Continuation<PrimitiveValue>
  ): Thunk<PrimitiveValue> {
    const tryNextEquation = (eqIndex: number): Thunk<PrimitiveValue> => {
      if (eqIndex >= equations.length) {
        throw new NonExhaustivePatterns(funcName);
      }

      const eq = equations[eqIndex];
      if (eq.patterns.length !== args.length) return () => tryNextEquation(eqIndex + 1);

      const bindings: Bindings = [];

      if (!FunctionRuntime.patternsMatch(eq, args, bindings))
        return () => tryNextEquation(eqIndex + 1);

      const localEnv = new Map<string, PrimitiveValue>(bindings);
      const newStack: EnvStack = pushEnv(currentEnv, localEnv);

      const scopeEvaluator = evaluatorFactory(newStack);

      // UnguardedBody
      if (eq.body instanceof UnguardedBody)
        return this.evaluateSequence(
          eq.body.sequence,
          scopeEvaluator,
          newStack,
          k
        );

      // GuardedBody
      return () => {
        if (Array.isArray(eq.body) && eq.body.length > 0) {
          const prototypeBody = eq.body[0].body;
          if (prototypeBody instanceof Sequence)
            this.preloadDefinitions(prototypeBody, scopeEvaluator, newStack);
        }

        const tryNextGuard = (guardIndex: number): Thunk<PrimitiveValue> => {
          if (guardIndex >= (eq.body as any[]).length) {
             return () => tryNextEquation(eqIndex + 1);
          }
          const guard = (eq.body as any[])[guardIndex];
          return scopeEvaluator.evaluate(guard.condition, (cond) => {
            if (cond === true) {
              if (guard.body instanceof Sequence)
                return this.evaluateSequence(guard.body, scopeEvaluator, newStack, k);
              return scopeEvaluator.evaluate(guard.body, k);
            }
            return () => tryNextGuard(guardIndex + 1);
          });
        };

        return tryNextGuard(0);
      };
    };

    return tryNextEquation(0);
  }

  private static preloadDefinitions(
    seq: Sequence,
    evaluator: ExpressionEvaluator,
    env: EnvStack
  ): void {
    const builder = new EnvBuilderVisitor(env);
    for (const stmt of seq.statements) {
      if (stmt instanceof Function) stmt.accept(builder);
    }
    for (const stmt of seq.statements) {
      if (stmt instanceof Function || stmt instanceof Return) continue;
      evaluator.evaluate(stmt, (val) => val);
    }
  }

  private static patternsMatch(
    eq: EquationRuntime,
    args: PrimitiveValue[],
    bindings: Bindings
  ): boolean {
    for (let i = 0; i < args.length; i++) {
      const matcher = new PatternMatcher(args[i], bindings);
      if (!eq.patterns[i].accept(matcher)) return false;
    }
    return true;
  }

  private static evaluateSequence(
    seq: Sequence,
    evaluator: ExpressionEvaluator,
    env: EnvStack,
    k: Continuation<PrimitiveValue>
  ): Thunk<PrimitiveValue> {
    const builder = new EnvBuilderVisitor(env);
    for (const stmt of seq.statements) {
      if (stmt instanceof Function) stmt.accept(builder);
    }

    const evaluateNext = (index: number, lastResult: PrimitiveValue): Thunk<PrimitiveValue> => {
      if (index >= seq.statements.length) return k(lastResult);

      const stmt = seq.statements[index];
      if (stmt instanceof Function) return () => evaluateNext(index + 1, lastResult);

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
