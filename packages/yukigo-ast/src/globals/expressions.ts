import { CompositionExpression, Lambda, Application } from "../paradigms/functional.js";
import { Exist, Forall, Findall, Not } from "../paradigms/logic.js";
import { Self, New, Implement } from "../paradigms/object.js";
import { Visitor } from "../visitor/index.js";
import { ASTNode, SourceLocation } from "./generics.js";
import { Operation } from "./operators.js";
import { SymbolPrimitive, Primitive } from "./primitives.js";
import { Sequence, Print, For } from "./statements.js";
import { TypeCast } from "./types.js";

/**
 * Represent tuples - generic non-uniform fixed-size collection of elements
 *
 * @example
 * (1, "Hello", true)
 * @category Expressions
 */
export class TupleExpression extends ASTNode {
  /** @hidden */
  public elements: Expression[];

  constructor(elements: Expression[], loc?: SourceLocation) {
    super(loc);
    this.elements = elements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTupleExpr?.(this);
  }
  public toJSON() {
    return {
      type: "TupleExpression",
      elements: this.elements.map((expr) => expr.toJSON()),
    };
  }
}

/**
 * Fields of a data expression representations
 * @category Expressions
 */
export class FieldExpression extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(
    name: SymbolPrimitive,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFieldExpr?.(this);
  }
  public toJSON() {
    return {
      type: "FieldExpression",
      name: this.name.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Data expression, used to construct Records
 * @example
 * f = DataName { fieldName = 2 }
 * @category Expressions
 */
export class DataExpression extends ASTNode {
  /** @hidden */
  public contents: FieldExpression[];
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(
    name: SymbolPrimitive,
    contents: FieldExpression[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.contents = contents;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitDataExpr?.(this);
  }
  public toJSON() {
    return {
      type: "DataExpression",
      name: this.name.toJSON(),
      contents: this.contents.map((expr) => expr.toJSON()),
    };
  }
}

/**
 * Cons expression, represent a concatenation of a head and a tail
 * @example
 * f = x : xs
 * @category Expressions
 */
export class ConsExpression extends ASTNode {
  /** @hidden */
  public tail: Expression;
  /** @hidden */
  public head: Expression;

  constructor(head: Expression, tail: Expression, loc?: SourceLocation) {
    super(loc);
    this.head = head;
    this.tail = tail;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConsExpr?.(this);
  }
  public toJSON() {
    return {
      type: "ConsExpression",
      head: this.head.toJSON(),
      tail: this.tail.toJSON(),
    };
  }
}

/**
 * Represent let...in expressions normally used in Haskell
 * @example
 * f = let x = 2 in x * 4
 * @category Expressions
 */
export class LetInExpression extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public declarations: Sequence;

  constructor(
    declarations: Sequence,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.declarations = declarations;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLetInExpr?.(this);
  }
  public toJSON() {
    return {
      type: "LetInExpression",
      declarations: this.declarations.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Otherwise used as the default case in GuardBody
 * @example
 * f x
 *  | x == 2 = 16
 *  | otherwise = x * 8
 * @category Declarations
 */
export class Otherwise extends ASTNode {
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitOtherwise?.(this);
  }
  public toJSON() {
    return {
      type: "Otherwise",
    };
  }
}

/**
 * ListComprehension when the for expression is a yield.
 * Scala's for comprehensions, Erlang's and Haskell's list comprehensions
 * @example
 * m = [ f x | x <- [1, 2, 3, 4] ]
 * @category Expressions
 */
export class ListComprehension extends ASTNode {
  /** @hidden */
  public generators: (Generator | Expression)[];
  /** @hidden */
  public projection: Expression;

  constructor(
    projection: Expression,
    generators: (Generator | Expression)[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.projection = projection;
    this.generators = generators;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListComprehension?.(this);
  }
  public toJSON() {
    return {
      type: "ListComprehension",
      projection: this.projection.toJSON(),
      generators: this.generators.map((gen) => gen.toJSON()),
    };
  }
}

/**
 * Generator represents patterns like "Just m <- ms" or "x <- [1,2,3]"
 * @example
 * x <- [1, 2, 3, 4]
 * @category Declarations
 */
export class Generator extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public variable: SymbolPrimitive;

  constructor(
    variable: SymbolPrimitive,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.variable = variable;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGenerator?.(this);
  }
  public toJSON() {
    return {
      type: "Generator",
      variable: this.variable.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * RangeExpression represents when a list is given by comprehension in a defined range
 * @example
 * (1..10)
 * @example
 * (1, 2..10)
 * @example
 * (1..)
 * @category Expressions
 */
export class RangeExpression extends ASTNode {
  /** @hidden */
  public step?: Expression;
  /** @hidden */
  public end?: Expression;
  /** @hidden */
  public start: Expression;

  constructor(
    start: Expression,
    end?: Expression, // undefined for infinite ranges like [0..]
    step?: Expression, // for [start, second .. end] syntax
    loc?: SourceLocation
  ) {
    super(loc);
    this.start = start;
    this.end = end;
    this.step = step;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRangeExpression?.(this);
  }
  public toJSON() {
    return {
      type: "RangeExpression",
      start: this.start.toJSON(),
      end: this.end?.toJSON(),
      step: this.step?.toJSON(),
    };
  }
}

export class NamedArgument extends ASTNode {
  public identifier: SymbolPrimitive;
  public expression: Expression;
  constructor(
    identifier: SymbolPrimitive,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNamedArgument?.(this);
  }
  public toJSON() {
    return {
      type: "NamedArgument",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

export type Expression =
  | Primitive
  | Operation
  | TupleExpression
  | Print
  | Otherwise
  | ConsExpression
  | Self
  | Sequence
  | New
  | Implement
  | DataExpression
  | CompositionExpression
  | Lambda
  | For
  | Application
  | Exist
  | Forall
  | Findall
  | Not
  | TypeCast
  | ListComprehension
  | RangeExpression;