import { Visitor } from "../visitor.js";
import {
  ASTNode,
  Primitive,
  SourceLocation,
  SymbolPrimitive,
} from "./generics.js";

/**
 * Represents a pattern that matches any value and binds it to a variable.
 *
 * @example
 * map (\x -> x + 1)
 * @category Patterns
 */
export class VariablePattern extends ASTNode {
    /** @hidden */
    public name: SymbolPrimitive;

  constructor(name: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
      this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariablePattern?.(this);
  }
  public toJSON() {
    return {
      type: "VariablePattern",
      name: this.name.toJSON(),
    };
  }
}

/**
 * Represents a pattern that matches an exact literal value.
 * @category Patterns
 */
export class LiteralPattern extends ASTNode {
    /** @hidden */
    public name: Primitive;

  constructor(name: Primitive, loc?: SourceLocation) {
    super(loc);
      this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralPattern?.(this);
  }
  public toJSON() {
    return {
      type: "LiteralPattern",
      name: this.name.toJSON(),
    };
  }
}
/**
 * Represents a pattern matching a function application or constructor with arguments.
 * @category Patterns
 */
export class ApplicationPattern extends ASTNode {
    /** @hidden */
    public args: Pattern[];
    /** @hidden */
    public symbol: SymbolPrimitive;

  constructor(
    symbol: SymbolPrimitive,
    args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
      this.symbol = symbol;
      this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitApplicationPattern?.(this);
  }
  public toJSON() {
    return {
      type: "ApplicationPattern",
      symbol: this.symbol.toJSON(),
      args: this.args.map((arg) => arg.toJSON()),
    };
  }
}

/**
 * Represents a pattern matching a tuple structure.
 * @category Patterns
 */
export class TuplePattern extends ASTNode {
    /** @hidden */
    public elements: Pattern[];

  constructor(elements: Pattern[], loc?: SourceLocation) {
    super(loc);
      this.elements = elements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTuplePattern?.(this);
  }
  public toJSON() {
    return {
      type: "TuplePattern",
      elements: this.elements.map((elem) => elem.toJSON()),
    };
  }
}

/**
 * Represents a pattern matching a list structure.
 *
 * @example
 * sum (x:xs) = x + sum xs
 * @category Patterns
 */
export class ListPattern extends ASTNode {
    /** @hidden */
    public elements: Pattern[];

  constructor(elements: Pattern[], loc?: SourceLocation) {
    super(loc);
      this.elements = elements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListPattern?.(this);
  }
  public toJSON() {
    return {
      type: "ListPattern",
      elements: this.elements.map((elem) => elem.toJSON()),
    };
  }
}

/**
 * Represents a pattern matching a functor or compound term.
 * @category Patterns
 */
export class FunctorPattern extends ASTNode {
    /** @hidden */
    public args: Pattern[];
    /** @hidden */
    public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
      this.identifier = identifier;
      this.args = args;
  }

  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFunctorPattern?.(this);
  }
  public toJSON() {
    return {
      type: "FunctorPattern",
      identifier: this.identifier.toJSON(),
      args: this.args.map((arg) => arg.toJSON()),
    };
  }
}

/**
 * Represents an alias pattern (e.g., x@pat), binding the whole value to a name while matching inner patterns.
 *
 * @example
 * f p@(x, y) = ...
 * @category Patterns
 */
export class AsPattern extends ASTNode {
    /** @hidden */
    public pattern: Pattern;
    /** @hidden */
    public alias: VariablePattern | WildcardPattern;

  constructor(
    alias: VariablePattern | WildcardPattern,
    pattern: Pattern,
    loc?: SourceLocation
  ) {
    super(loc);
      this.alias = alias;
      this.pattern = pattern;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAsPattern?.(this);
  }
  public toJSON() {
    return {
      type: "AsPattern",
      alias: this.alias.toJSON(),
      pattern: this.pattern.toJSON(),
    };
  }
}

/**
 * Represents a wildcard pattern (_), which matches anything and discards the value.
 *
 * @example
 * const _ x = x
 * @category Patterns
 */
export class WildcardPattern extends ASTNode {
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWildcardPattern?.(this);
  }
  public toJSON() {
    return {
      type: "WildcardPattern",
      name: "_",
    };
  }
}

/**
 * Represents a union of patterns, matching if any of the sub-patterns match.
 * @category Patterns
 */
export class UnionPattern extends ASTNode {
    /** @hidden */
    public patterns: Pattern[];

  constructor(patterns: Pattern[], loc?: SourceLocation) {
    super(loc);
      this.patterns = patterns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnionPattern?.(this);
  }
  public toJSON() {
    return {
      type: "UnionPattern",
      patterns: this.patterns.map((pattern) => pattern.toJSON()),
    };
  }
}

/**
 * Represents a pattern matching a specific data constructor.
 *
 * @example
 * safeDiv (Just x) y = x / y
 * @category Patterns
 */
export class ConstructorPattern extends ASTNode {
    /** @hidden */
    public patterns: Pattern[];
    /** @hidden */
    public constr: string;

  constructor(
    constr: string,
    patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
      this.constr = constr;
      this.patterns = patterns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConstructorPattern?.(this);
  }
  public toJSON() {
    return {
      type: "ConstructorPattern",
      constructor: this.constr,
      patterns: this.patterns.map((pattern) => pattern.toJSON()),
    };
  }
}

/**
 * Represents a pattern matching the head and tail of a list (x:xs).
 * @category Patterns
 */
export class ConsPattern extends ASTNode {
    /** @hidden */
    public tail: Pattern;
    /** @hidden */
    public head: Pattern;

  constructor(
    head: Pattern,
    tail: Pattern,
    loc?: SourceLocation
  ) {
    super(loc);
      this.head = head;
      this.tail = tail;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConsPattern?.(this);
  }
  public toJSON() {
    return {
      type: "ConsPattern",
      head: this.head.toJSON(),
      tail: this.tail.toJSON(),
    };
  }
}

export type Pattern =
  | VariablePattern
  | LiteralPattern
  | ApplicationPattern
  | TuplePattern
  | ListPattern
  | FunctorPattern
  | AsPattern
  | WildcardPattern
  | ConstructorPattern
  | UnionPattern
  | ConsPattern;
