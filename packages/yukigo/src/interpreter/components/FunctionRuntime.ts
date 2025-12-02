import {
  EquationRuntime,
  PrimitiveValue,
  UnguardedBody,
  Sequence,
  Return,
  Expression,
} from "@yukigo/ast";
import { Bindings, EnvStack } from "../index.js";
import { PatternMatcher } from "./PatternMatcher.js";
import { ExpressionEvaluator } from "../utils.js";
import { InterpreterError } from "../errors.js";

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
      const newStack: EnvStack = [localEnv, ...currentEnv];

      const scopeEvaluator = evaluatorFactory(newStack);

      // UnguardedBody
      if (eq.body instanceof UnguardedBody)
        return this.evaluateSequence(eq.body.sequence, scopeEvaluator);

      // GuardedBody
      for (const guard of eq.body) {
        const cond = scopeEvaluator.evaluate(guard.condition);
        if (cond === true) return scopeEvaluator.evaluate(guard.body);
      }
    }
    throw new NonExhaustivePatterns(funcName);
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
    evaluator: ExpressionEvaluator
  ): PrimitiveValue {
    let result: PrimitiveValue = undefined;

    for (const stmt of seq.statements) {
      if (stmt instanceof Return) {
        return evaluator.evaluate(stmt.body);
      } else {
        result = evaluator.evaluate(stmt);
      }
    }
    return result;
  }
}
