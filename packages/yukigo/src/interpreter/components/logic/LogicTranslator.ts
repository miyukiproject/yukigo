import {
  Expression,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  SymbolPrimitive,
  Variable,
  VariablePattern,
  EnvStack,
  isPattern,
  NumberPrimitive,
  StringPrimitive,
  BooleanPrimitive,
  ListPrimitive,
  ListPattern,
  ConsExpression,
  ConsPattern,
  FunctorPattern,
} from "yukigo-ast";
import { Substitution, instantiate } from "./LogicResolver.js";
import { ExpressionEvaluator } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import {
  idContinuation,
  trampoline,
  Continuation,
  Thunk,
} from "../../trampoline.js";
import { RuntimeContext } from "../RuntimeContext.js";

export class LogicTranslator {
  constructor(
    private evaluator: ExpressionEvaluator,
    private ctx: RuntimeContext,
  ) {}

  public patternToPrimitive(pat: Pattern): PrimitiveValue | undefined {
    if (pat instanceof LiteralPattern) {
      const primitive = pat.name;
      return primitive.value;
    }
    if (pat instanceof ListPattern) {
      return pat.elements.map((el) => this.patternToPrimitive(el));
    }
    if (pat instanceof ConsPattern) {
      const head = this.patternToPrimitive(pat.left);
      const tail = this.patternToPrimitive(pat.right);
      if (Array.isArray(tail)) {
        return [head, ...tail];
      }
      return [head, tail];
    }
    // Return the pattern itself for non-primitive logic terms (VariablePattern, FunctorPattern, etc.)
    return pat as any;
  }

  public expressionToPattern<R = Pattern>(
    expr: Expression,
    k: Continuation<Pattern, R>,
  ): Thunk<R> {
    if (isPattern(expr)) return k(expr);

    if (expr instanceof ListPrimitive) {
      const results: Pattern[] = [];
      const next = (index: number): Thunk<R> => {
        if (index >= expr.value.length) return k(new ListPattern(results));
        return this.expressionToPattern(expr.value[index], (p) => {
          results.push(p);
          return () => next(index + 1);
        });
      };
      return next(0);
    }

    if (expr instanceof ConsExpression) {
      return this.expressionToPattern(expr.head, (headPat) => {
        return () =>
          this.expressionToPattern(expr.tail, (tailPat) => {
            return k(new ConsPattern(headPat, tailPat));
          });
      });
    }

    if (expr instanceof Variable || expr instanceof SymbolPrimitive) {
      const name =
        expr instanceof Variable ? expr.identifier.value : expr.value;
      if (this.ctx.isDefined(name)) {
        return this.evaluator.evaluate(expr, (val) => {
          return k(this.primitiveToPattern(val));
        });
      }
      return k(
        new VariablePattern(expr instanceof Variable ? expr.identifier : expr),
      );
    }
    return this.evaluator.evaluate(expr, (val) => {
      return k(this.primitiveToPattern(val));
    });
  }

  public primitiveToPattern(val: PrimitiveValue): Pattern {
    if (isPattern(val as any)) {
      return val as any;
    }
    if (typeof val === "number") {
      return new LiteralPattern(new NumberPrimitive(val));
    }
    if (typeof val === "string") {
      return new LiteralPattern(new StringPrimitive(val));
    }
    if (typeof val === "boolean") {
      return new LiteralPattern(new BooleanPrimitive(val));
    }
    if (Array.isArray(val)) {
      return new ListPattern(val.map((v) => this.primitiveToPattern(v)));
    }
    if (
      val &&
      typeof val === "object" &&
      "type" in val &&
      val.type === "Object"
    ) {
      // Convert RuntimeObject to FunctorPattern for logic matching
      const args: Pattern[] = [];
      for (const [_, fieldVal] of (val as any).fields) {
        args.push(this.primitiveToPattern(fieldVal));
      }
      return new FunctorPattern(
        new SymbolPrimitive((val as any).className || (val as any).identifier),
        args,
      );
    }

    throw new InterpreterError(
      "primitiveToPattern",
      `Cannot convert value ${val} to Logic Pattern`,
    );
  }

  public instantiateExpressionAsPattern<R = Pattern>(
    expr: Expression,
    substs: Substitution,
    k: Continuation<Pattern, R>,
  ): Thunk<R> {
    return this.expressionToPattern(expr, (patternBase) => {
      return k(instantiate(patternBase, substs));
    });
  }
}
