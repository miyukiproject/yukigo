import { Visitor } from "../visitor/index.js";
import { ASTNode, SourceLocation } from "./generics.js";
import { ListPrimitive, Primitive, SymbolPrimitive } from "./primitives.js";
import { Type } from "./types.js";

type NamedPatternKind = "VariablePattern" | "LiteralPattern";
type ArgsPatternKind =
  | "ApplicationPattern"
  | "FunctorPattern"
  | "ConstructorPattern";
type ListBasedPatternKind = "TuplePattern" | "ListPattern" | "UnionPattern";
type BinaryPatternKind = "AsPattern" | "ConsPattern";

type YukigoPattern =
  | NamedPatternKind
  | ArgsPatternKind
  | ListBasedPatternKind
  | BinaryPatternKind
  | "WildcardPattern"
  | "TypePattern";

abstract class BasePattern extends ASTNode {
  constructor(loc?: SourceLocation) {
    super(loc);
  }
  protected abstract get jsonType(): YukigoPattern;
}

abstract class NamedPattern<
  T extends Primitive | SymbolPrimitive
> extends BasePattern {
  public name: T;
  constructor(name: T, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  protected abstract get jsonType(): NamedPatternKind;
  public toJSON() {
    return {
      type: this.jsonType,
      name: this.name.toJSON(),
    };
  }
}
abstract class ArgsPattern extends BasePattern {
  /** @hidden */
  public identifier: SymbolPrimitive;
  /** @hidden */
  public args: Pattern[];
  constructor(
    identifier: SymbolPrimitive,
    args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.args = args;
  }
  protected abstract get jsonType(): ArgsPatternKind;
  public toJSON() {
    return {
      type: this.jsonType,
      identifier: this.identifier.toJSON(),
      args: this.args.map((arg) => arg.toJSON()),
    };
  }
}
abstract class ListBasedPattern extends BasePattern {
  /** @hidden */
  public elements: Pattern[];
  constructor(elements: Pattern[], loc?: SourceLocation) {
    super(loc);
    this.elements = elements;
  }
  protected abstract get jsonType(): ListBasedPatternKind;
  public toJSON() {
    return {
      type: this.jsonType,
      elements: this.elements.map((arg) => arg.toJSON()),
    };
  }
}
abstract class BinaryPattern extends BasePattern {
  /** @hidden */
  public left: Pattern;
  /** @hidden */
  public right: Pattern;
  constructor(left: Pattern, right: Pattern, loc?: SourceLocation) {
    super(loc);
    this.left = left;
    this.right = right;
  }
  protected abstract get jsonType(): BinaryPatternKind;
  public toJSON() {
    return {
      type: this.jsonType,
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}

/**
 * Represents a pattern that matches any value and binds it to a variable.
 *
 * @example
 * map (\x -> x + 1)
 * @category Patterns
 */
export class VariablePattern extends NamedPattern<SymbolPrimitive> {
  protected get jsonType(): NamedPatternKind {
    return "VariablePattern";
  }
  constructor(name: SymbolPrimitive, loc?: SourceLocation) {
    super(name, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariablePattern?.(this);
  }
}

type LiteralPrimitive = Exclude<Primitive, ListPrimitive>;
/**
 * Represents a pattern that matches an exact literal value.
 * @category Patterns
 */
export class LiteralPattern extends NamedPattern<LiteralPrimitive> {
  protected get jsonType(): NamedPatternKind {
    return "LiteralPattern";
  }
  constructor(name: LiteralPrimitive, loc?: SourceLocation) {
    super(name, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralPattern?.(this);
  }
}
/**
 * Represents a pattern matching a function application or constructor with arguments.
 * @category Patterns
 */
export class ApplicationPattern extends ArgsPattern {
  protected get jsonType(): ArgsPatternKind {
    return "ApplicationPattern";
  }
  constructor(symbol: SymbolPrimitive, args: Pattern[], loc?: SourceLocation) {
    super(symbol, args, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitApplicationPattern?.(this);
  }
}

/**
 * Represents a pattern matching a tuple structure.
 * @category Patterns
 */
export class TuplePattern extends ListBasedPattern {
  protected get jsonType(): ListBasedPatternKind {
    return "TuplePattern";
  }
  constructor(elements: Pattern[], loc?: SourceLocation) {
    super(elements, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTuplePattern?.(this);
  }
}

/**
 * Represents a pattern matching a list structure.
 *
 * @example
 * sum (x:xs) = x + sum xs
 * @category Patterns
 */
export class ListPattern extends ListBasedPattern {
  protected get jsonType(): ListBasedPatternKind {
    return "ListPattern";
  }
  constructor(elements: Pattern[], loc?: SourceLocation) {
    super(elements, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListPattern?.(this);
  }
}

/**
 * Represents a pattern matching a functor or compound term.
 * @category Patterns
 */
export class FunctorPattern extends ArgsPattern {
  protected get jsonType(): ArgsPatternKind {
    return "FunctorPattern";
  }
  constructor(symbol: SymbolPrimitive, args: Pattern[], loc?: SourceLocation) {
    super(symbol, args, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFunctorPattern?.(this);
  }
}

/**
 * Represents an alias pattern (e.g., x@pat), binding the whole value to a name while matching inner patterns.
 *
 * @example
 * f p@(x, y) = ...
 * @category Patterns
 */
export class AsPattern extends BinaryPattern {
  protected get jsonType(): BinaryPatternKind {
    return "AsPattern";
  }
  constructor(
    left: VariablePattern | WildcardPattern,
    right: Pattern,
    loc?: SourceLocation
  ) {
    super(left, right, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAsPattern?.(this);
  }
}

/**
 * Represents a wildcard pattern (_), which matches anything and discards the value.
 *
 * @example
 * const _ x = x
 * @category Patterns
 */
export class WildcardPattern extends BasePattern {
  protected get jsonType(): YukigoPattern {
    return "WildcardPattern";
  }
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
export class UnionPattern extends ListBasedPattern {
  protected get jsonType(): ListBasedPatternKind {
    return "UnionPattern";
  }
  constructor(patterns: Pattern[], loc?: SourceLocation) {
    super(patterns, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnionPattern?.(this);
  }
}

/**
 * Represents a pattern matching a specific data constructor.
 *
 * @example
 * safeDiv (Just x) y = x / y
 * @category Patterns
 */
export class ConstructorPattern extends ArgsPattern {
  protected get jsonType(): ArgsPatternKind {
    return "ConstructorPattern";
  }
  constructor(symbol: SymbolPrimitive, args: Pattern[], loc?: SourceLocation) {
    super(symbol, args, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConstructorPattern?.(this);
  }
}

/**
 * Represents a pattern matching the head and tail of a list (x:xs).
 * @category Patterns
 */
export class ConsPattern extends BinaryPattern {
  protected get jsonType(): BinaryPatternKind {
    return "ConsPattern";
  }
  constructor(left: Pattern, right: Pattern, loc?: SourceLocation) {
    super(left, right, loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConsPattern?.(this);
  }
}

/**
 * Represents a pattern matching a value by its type.
 * @category Patterns
 */
export class TypePattern extends BasePattern {
  protected get jsonType(): YukigoPattern {
    return "TypePattern";
  }
  /** @hidden */
  public targetType: Type;
  /** @hidden */
  public innerPattern?: Pattern;

  constructor(targetType: Type, innerPattern?: Pattern, loc?: SourceLocation) {
    super(loc);
    this.targetType = targetType;
    this.innerPattern = innerPattern;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypePattern?.(this);
  }
  public toJSON() {
    return {
      type: "TypePattern",
      targetType: this.targetType.toJSON(),
      innerPattern: this.innerPattern?.toJSON(),
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
  | ConsPattern
  | TypePattern;

export function isPattern(node: ASTNode): node is Pattern {
  return node instanceof BasePattern;
}
