import {
  ASTNode,
  Expression,
  SourceLocation,
  SymbolPrimitive,
} from "../globals/generics.js";
import { Pattern } from "../globals/patterns.js";
import { Visitor } from "../visitor.js";

/**
 * Represents function composition (e.g., f . g).
 * @category Expressions
 */
export class CompositionExpression extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;

  constructor(
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCompositionExpression?.(this);
  }
  public toJSON() {
    return {
      type: "CompositionExpression",
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}

/**
 * Represents an anonymous function or lambda abstraction.
 *
 * @example
 * \x -> x + 1
 * @category Expressions
 */
export class Lambda extends ASTNode {
    /** @hidden */
    public body: Expression;
    /** @hidden */
    public parameters: Pattern[];

  constructor(
    parameters: Pattern[],
    body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.parameters = parameters;
      this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLambda?.(this);
  }
  public toJSON() {
    return {
      type: "Lambda",
      body: this.body.toJSON(),
      parameters: this.parameters.map((p) => p.toJSON()),
    };
  }
}
/**
 * Represents a yield statement, often used in generators or coroutines.
 * @category Statements
 */
export class Yield extends ASTNode {
    /** @hidden */
    public expression: Expression;

  constructor(expression: Expression, loc?: SourceLocation) {
    super(loc);
      this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitYield?.(this);
  }
  public toJSON() {
    return {
      type: "Yield",
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents the application of a function to an argument.
 *
 * @example
 * map (*2) [1..5]
 * @category Expressions
 */
export class Application extends ASTNode {
    /** @hidden */
    public parameter: Expression;
    /** @hidden */
    public functionExpr: Expression;

  constructor(
    functionExpr: Expression,
    parameter: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.functionExpr = functionExpr;
      this.parameter = parameter;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitApplication?.(this);
  }
  public toJSON() {
    return {
      type: "Application",
      function: this.functionExpr.toJSON(),
      parameter: this.parameter.toJSON(),
    };
  }
}
