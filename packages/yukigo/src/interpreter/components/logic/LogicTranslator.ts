import {
  Expression,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  SymbolPrimitive,
  Variable,
  VariablePattern,
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
import { Evaluator } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "../kernel/commands.js";

export class LogicTranslator {
  constructor(
    private evaluator: Evaluator,
    private ctx: RuntimeContext,
  ) {}

  public patternToPrimitive(pat: Pattern, substs?: Substitution): PrimitiveValue | undefined {
    if (pat instanceof LiteralPattern) {
      const primitive = pat.name;
      return primitive.value;
    }
    if (pat instanceof VariablePattern) {
      if (substs && substs.has(pat.name.value)) {
          return this.patternToPrimitive(instantiate(pat, substs), substs);
      }
      return pat.name.value;
    }
    if (pat instanceof ListPattern) {
      return pat.elements.map((el) => this.patternToPrimitive(el, substs));
    }
    if (pat instanceof ConsPattern) {
      const head = this.patternToPrimitive(pat.left, substs);
      const tail = this.patternToPrimitive(pat.right, substs);
      if (Array.isArray(tail)) {
        return [head, ...tail];
      }
      return [head, tail];
    }
    // For complex terms like FunctorPattern, we return its string representation
    return pat.toString();
  }

  public expressionToPattern(
    expr: Expression,
    k: (p: Pattern) => ExecutionCommand,
  ): ExecutionCommand {
    if (isPattern(expr)) return k(expr);

    if (expr instanceof ListPrimitive) {
      const results: Pattern[] = [];
      const next = (index: number): ExecutionCommand => {
        if (index >= expr.value.length) return k(new ListPattern(results));
        return this.expressionToPattern(expr.value[index], (p) => {
          results.push(p);
          return next(index + 1);
        });
      };
      return next(0);
    }

    if (expr instanceof ConsExpression) {
      return this.expressionToPattern(expr.head, (headPat) => {
        return this.expressionToPattern(expr.tail, (tailPat) => {
          return k(new ConsPattern(headPat, tailPat));
        });
      });
    }

    if (expr instanceof Variable || expr instanceof SymbolPrimitive) {
      const name =
        expr instanceof Variable ? expr.identifier.value : expr.value;
      if (this.ctx.isDefined(name)) {
        return new BindCommand(this.evaluator.evaluate(expr), (val) => {
          return k(this.primitiveToPattern(val));
        });
      }
      return k(
        new VariablePattern(expr instanceof Variable ? expr.identifier : expr),
      );
    }
    return new BindCommand(this.evaluator.evaluate(expr), (val) => {
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

  public instantiateExpressionAsPattern(
    expr: Expression,
    substs: Substitution,
    k: (p: Pattern) => ExecutionCommand,
  ): ExecutionCommand {
    return this.expressionToPattern(expr, (patternBase) => {
      return k(instantiate(patternBase, substs));
    });
  }
}
