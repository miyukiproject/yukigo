import {
  Expression,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  SymbolPrimitive,
  Variable,
  VariablePattern,
  EnvStack,
} from "yukigo-ast";
import { Substitution } from "./LogicResolver.js";
import { ExpressionEvaluator, isDefined } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { idContinuation, trampoline } from "../../trampoline.js";

export class LogicTranslator {
  constructor(
    private env: EnvStack,
    private evaluator: ExpressionEvaluator,
  ) {}

  public patternToPrimitive(pat: Pattern): PrimitiveValue | undefined {
    if (pat instanceof LiteralPattern) {
      const primitive = pat.name;
      return primitive.value;
    }
    return undefined;
  }

  public expressionToPattern(expr: Expression): Pattern {
    if (expr instanceof VariablePattern) return expr;

    if (expr instanceof Variable) {
      const name = expr.identifier.value;
      if (isDefined(this.env, name)) {
        const val = trampoline(this.evaluator.evaluate(expr, idContinuation));
        return this.primitiveToPattern(val);
      }
      return new VariablePattern(expr.identifier);
    }
    const val = trampoline(this.evaluator.evaluate(expr, idContinuation));
    return this.primitiveToPattern(val);
  }

  public primitiveToPattern(val: PrimitiveValue): Pattern {
    if (
      typeof val === "number" ||
      typeof val === "string" ||
      typeof val === "boolean"
    ) {
      return new LiteralPattern(new SymbolPrimitive(String(val)));
    }

    throw new InterpreterError(
      "primitiveToPattern",
      `Cannot convert value ${val} to Logic Pattern`,
    );
  }

  public instantiateExpressionAsPattern(
    expr: Expression,
    substs: Substitution,
  ): Pattern {
    const patternBase = this.expressionToPattern(expr);
    return this.substitutePattern(patternBase, substs);
  }

  public substitutePattern(
    pat: Pattern,
    substs: Substitution,
    visited: Set<string> = new Set(),
  ): Pattern {
    if (pat instanceof VariablePattern) {
      const name = pat.name.value;
      if (visited.has(name)) return pat;

      const val = substs.get(name);
      if (val) {
        const newVisited = new Set(visited);
        newVisited.add(name);
        return this.substitutePattern(val, substs, newVisited);
      }
    }
    return pat;
  }
}
