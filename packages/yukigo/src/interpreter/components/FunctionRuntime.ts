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
    evaluatorFactory: (env: EnvStack) => ExpressionEvaluator
  ): PrimitiveValue {
    for (const eq of equations) {
      if (eq.patterns.length !== args.length) continue;

      const bindings: Bindings = [];

      if (!FunctionRuntime.patternsMatch(eq, args, bindings)) continue;
      const localEnv = new Map<string, PrimitiveValue>(bindings);
      const newStack: EnvStack = pushEnv(currentEnv, localEnv);

      const scopeEvaluator = evaluatorFactory(newStack);
      // UnguardedBody
      if (eq.body instanceof UnguardedBody)
        return this.evaluateSequence(
          eq.body.sequence,
          scopeEvaluator,
          newStack
        );
      // GuardedBody
      if (Array.isArray(eq.body) && eq.body.length > 0) {
        const prototypeBody = eq.body[0].body;
        if (prototypeBody instanceof Sequence)
          this.preloadDefinitions(prototypeBody, scopeEvaluator, newStack);
      }

      for (const guard of eq.body) {
        const cond = scopeEvaluator.evaluate(guard.condition);
        if (cond === true) {
          if (guard.body instanceof Sequence)
            return this.evaluateSequence(guard.body, scopeEvaluator, newStack);
          return scopeEvaluator.evaluate(guard.body)
        }
      }
    }
    throw new NonExhaustivePatterns(funcName);
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
      evaluator.evaluate(stmt);
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
    env: EnvStack
  ): PrimitiveValue {
    let result: PrimitiveValue = undefined;
    const builder = new EnvBuilderVisitor(env);
    for (const stmt of seq.statements) {
      if (stmt instanceof Function) stmt.accept(builder);
    }

    for (const stmt of seq.statements) {
      if (stmt instanceof Function) continue;
      if (stmt instanceof Return) {
        return evaluator.evaluate(stmt.body);
      } else {
        result = evaluator.evaluate(stmt);
      }
    }

    return result;
  }
}
