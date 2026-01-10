import {
  Application,
  CompositionExpression,
  Lambda,
  Yield,
} from "../paradigms/functional.js";
import {
  EntryPoint,
  Enumeration,
  ForLoop,
  Procedure,
  Repeat,
  Structure,
  While,
} from "../paradigms/imperative.js";
import {
  Call,
  Clause,
  Exist,
  Findall,
  Forall,
  Not,
  RuntimePredicate,
} from "../paradigms/logic.js";
import {
  Attribute,
  Class,
  Implement,
  Interface,
  Method,
  New,
  Object,
  Self,
  Send,
  Super,
} from "../paradigms/object.js";
import { Visitor } from "../visitor.js";
import { Operation } from "./operators.js";
import { Pattern } from "./patterns.js";
import {
  LazyList,
  RuntimeClass,
  RuntimeFunction,
  RuntimeObject,
} from "./runtime.js";
import { Type, TypeAlias, TypeCast, TypeSignature } from "./types.js";

export type Modify<T, R> = Omit<T, keyof R> & R;

// Universal primitive value types

type Metadata = Map<string, any>;
/**
 * @hidden
 */
export abstract class ASTNode {
  /** @hidden */
  public loc: SourceLocation;
  /** @hidden */
  public metadata: Metadata = new Map();

  constructor(loc?: SourceLocation, metadata?: Metadata) {
    this.loc = loc;
    this.metadata = metadata ?? new Map();
  }

  public setMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  public getMetadata<T>(key: string): T | undefined {
    return this.metadata.get(key);
  }

  public hasMetadata(key: string): boolean {
    return this.metadata.has(key);
  }

  /** @hidden */
  abstract accept<R>(visitor: Visitor<R>): R;
  /** @hidden */
  abstract toJSON(): object;
}

/**
 * Generic number primitive
 * @category Literals
 */
export class NumberPrimitive extends ASTNode {
  /** @hidden */
  public value: number;

  constructor(value: number, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNumberPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof NumberPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuNumber",
      value: this.value,
    };
  }
}

/**
 * Generic boolean primitive
 * @category Literals
 */
export class BooleanPrimitive extends ASTNode {
  /** @hidden */
  public value: boolean;

  constructor(value: boolean, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBooleanPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof BooleanPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuBoolean",
      value: this.value,
    };
  }
}

/**
 * Represent lists - generic uniform variable-size collection of elements. Lists typically map to arrays, lists or sequence-like structures.
 * @category Literals
 */
export class ListPrimitive extends ASTNode {
  /** @hidden */
  public elements: Expression[];

  constructor(elements: Expression[], loc?: SourceLocation) {
    super(loc);
    this.elements = elements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof ListPrimitive)) return false;
    return this.elements.every((elem, i) => elem === other.elements[i]);
  }
  public toJSON() {
    return {
      type: "YuList",
      value: this.elements,
    };
  }
}

/**
 * Generic char primitive
 * @category Literals
 */
export class CharPrimitive extends ASTNode {
  /** @hidden */
  public value: string;

  constructor(value: string, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCharPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof CharPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuChar",
      value: this.value,
    };
  }
}

/**
 * Generic string primitive
 * @category Literals
 */
export class StringPrimitive extends ASTNode {
  /** @hidden */
  public value: string;

  constructor(value: string, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitStringPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof StringPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuString",
      value: this.value,
    };
  }
}

/**
 * Generic null/undefined primitive
 * @category Literals
 */
export class NilPrimitive extends ASTNode {
  /** @hidden */
  public value: undefined | null;

  constructor(value: undefined | null, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNilPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof NilPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuNil",
      value: this.value,
    };
  }
}

/**
 * Generic symbol primitive
 * @category Literals
 */
export class SymbolPrimitive extends ASTNode {
  /** @hidden */
  public value: string;

  constructor(value: string, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSymbolPrimitive?.(this);
  }
  /**
   * Compares the primitive to other Primitive passed by argument
   * @param other Another Primitive to compare to.
   * @returns True if both primitive have the same value
   */
  public equals(other: Primitive): boolean {
    if (!(other instanceof SymbolPrimitive)) return false;
    return this.value === other.value;
  }
  public toJSON() {
    return {
      type: "YuSymbol",
      value: this.value,
    };
  }
}

export type YukigoPrimitive =
  | "YuNumber"
  | "YuString"
  | "YuChar"
  | "YuBoolean"
  | "YuTuple"
  | "YuList"
  | "YuNil"
  | "YuDict"
  | "YuObject"
  | "YuSymbol";

export type LogicResult = {
  success: boolean;
  solutions: Map<string, string>;
};

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | null
  | void
  | PrimitiveValue[]
  | RuntimeObject
  | RuntimeClass
  | undefined;

export type Primitive =
  | NumberPrimitive
  | BooleanPrimitive
  | CharPrimitive
  | StringPrimitive
  | NilPrimitive
  | SymbolPrimitive
  | ListPrimitive;

/**
 * Source location information
 */
export class SourceLocation {
  constructor(public line: number, public column: number) {}
  public toJSON() {
    return {
      type: "SourceLocation",
      line: this.line,
      column: this.column,
    };
  }
}

// Expressions

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

//export type Expression = {
//  type: "Expression";
//  body: BodyExpression;
//};

// Statements

/**
 * Generic conditional If statements.
 * Nested `else if` need to be desugared into `else { if ... }`
 * @example
 * if (condition) { ... } else { ... }
 * @category Expressions
 */
export class If extends ASTNode {
  /** @hidden */
  public elseExpr: Expression;
  /** @hidden */
  public then: Expression;
  /** @hidden */
  public condition: Expression;

  constructor(
    condition: Expression,
    then: Expression,
    elseExpr: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.condition = condition;
    this.then = then;
    this.elseExpr = elseExpr;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitIf?.(this);
  }
  public toJSON() {
    return {
      type: "If",
      condition: this.condition.toJSON(),
      then: this.then.toJSON(),
      else: this.elseExpr.toJSON(),
    };
  }
}

/**
 * Generic return statement.
 * @example
 * // In Haskell
 * f x = x * 2
 * // The parser takes the body and uses it as a Return
 * @example
 * function f(x) {
 *    return x * 2 // The node holds this expression
 * }
 * @category Statements
 */
export class Return extends ASTNode {
  /** @hidden */
  public body?: Expression;

  constructor(body: Expression = new NilPrimitive(null), loc?: SourceLocation) {
    super(loc);
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitReturn?.(this);
  }
  public toJSON() {
    return {
      type: "Return",
      body: this.body.toJSON(),
    };
  }
}

/**
 * Generic field in a Record statement.
 * The name can be undefined to support positional-only Records
 * @example
 * ... { name :: String }
 * @category Declarations
 */
export class Field extends ASTNode {
  /** @hidden */
  public value: Type;
  /** @hidden */
  public name: SymbolPrimitive | undefined;

  constructor(
    name: SymbolPrimitive | undefined,
    value: Type,
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.value = value;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitField?.(this);
  }
  public toJSON() {
    return {
      type: "Field",
      name: this.name.toJSON(),
      value: this.value.toJSON(),
    };
  }
}

/**
 * Generic constructor node.
 * Holds an array of Field nodes.
 * @example
 * data Record = Constructor { field :: String }
 * @category Declarations
 */
export class Constructor extends ASTNode {
  /** @hidden */
  public fields: Field[];
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(name: SymbolPrimitive, fields: Field[], loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.fields = fields;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConstructor?.(this);
  }
  public toJSON() {
    return {
      type: "Constructor",
      name: this.name.toJSON(),
      fields: this.fields.map((f) => f.toJSON()),
    };
  }
}

/**
 * Generic Record statement node.
 * @example
 * data Record = Constructor { field :: String }
 * data PositionalRecord = Constructor String String
 * @category Declarations
 */
export class Record extends ASTNode {
  /** @hidden */
  public deriving?: SymbolPrimitive[];
  /** @hidden */
  public contents: Constructor[];
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(
    name: SymbolPrimitive,
    contents: Constructor[],
    deriving?: SymbolPrimitive[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.contents = contents;
    this.deriving = deriving;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRecord?.(this);
  }
  public toJSON() {
    return {
      type: "Record",
      name: this.name.toJSON(),
      contents: this.contents.map((constructor) => constructor.toJSON()),
      deriving: this.deriving?.map((d) => d.toJSON()),
    };
  }
}

/**
 * Represents the body of an Equation that does not have guards.
 * Most languages match the body of its equations to it.
 * @example
 * f x = x + 2
 * // The body is the `x + 2` part
 * @example
 * function f(x) {
 *    return x + 2;
 * }
 * @category Declarations
 */
export class UnguardedBody extends ASTNode {
  /** @hidden */
  public sequence: Sequence;

  constructor(sequence: Sequence, loc?: SourceLocation) {
    super(loc);
    this.sequence = sequence;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnguardedBody?.(this);
  }
  public toJSON() {
    return {
      type: "UnguardedBody",
      sequence: this.sequence.toJSON(),
    };
  }
}

export function isUnguardedBody(
  body: UnguardedBody | GuardedBody[]
): body is UnguardedBody {
  return !Array.isArray(body);
}

/**
 * Represents the body of an Equation that does have guards.
 * For example, Haskell's guards
 * @example
 * f x
 *    | x > 2 = x * 2
 *    | otherwise = x / 2
 * @category Declarations
 */
export class GuardedBody extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public condition: Expression;

  constructor(condition: Expression, body: Expression, loc?: SourceLocation) {
    super(loc);
    this.condition = condition;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGuardedBody?.(this);
  }
  public toJSON() {
    return {
      type: "GuardedBody",
      condition: this.condition.toJSON(),
      body: this.body.toJSON(),
    };
  }
}

/**
 * Represents one Equation with its arguments and body. Allows for overloading and pattern matching.
 * You may define the return statement to access it more easily.
 *
 * @example
 * add 0 y = y
 * add x y = x + y
 * @category Declarations
 */
export class Equation extends ASTNode {
  /** @hidden */
  public patterns: Pattern[];
  /** @hidden */
  public body: UnguardedBody | GuardedBody[];
  /** @hidden */
  public returnExpr?: Return;
  constructor(
    patterns: Pattern[],
    body: UnguardedBody | GuardedBody[],
    returnExpr?: Return,
    loc?: SourceLocation
  ) {
    super(loc);
    this.patterns = patterns;
    this.body = body;
    this.returnExpr = returnExpr;
  }
  /** @hidden */
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEquation?.(this);
  }
  /** @hidden */
  public toJSON() {
    return {
      type: "Equation",
      patterns: this.patterns.map((pattern) => pattern.toJSON),
      body: Array.isArray(this.body)
        ? this.body.map((guard) => guard.toJSON())
        : this.body.toJSON(),
      return: this.returnExpr.toJSON(),
    };
  }
}

/**
 * Functional / Imperative programming function declaration.
 * It is is composed by an identifier and one or more equations
 * @example
 * int foo (int bar) {
 *    return bar;
 * }
 * @example
 * def foo(bar):
 *    return bar
 * @category Declarations
 */
export class Function extends ASTNode {
  /** @hidden */
  public equations: Equation[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    equations: Equation[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.equations = equations;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFunction?.(this);
  }
  public toJSON() {
    return {
      type: "Function",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((eq) => eq.toJSON()),
    };
  }
}

/**
 * Represents a case expression, selecting a branch based on pattern matching against a value.
 *
 * @example
 * case x of
 *   [] -> 0
 *   (x:xs) -> 1 + length xs
 * @category Expressions
 */
export class Case extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public condition: Expression;

  constructor(condition: Expression, body: Expression, loc?: SourceLocation) {
    super(loc);
    this.condition = condition;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCase?.(this);
  }
  public toJSON() {
    return {
      type: "Case",
      condition: this.condition.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
/**
 * Represents a switch statement, selecting execution paths based on value equality.
 * @category Expressions
 */
export class Switch extends ASTNode {
  /** @hidden */
  public defaultExpr?: Expression;
  /** @hidden */
  public cases: Case[];
  /** @hidden */
  public value: Expression;

  constructor(
    value: Expression,
    cases: Case[],
    defaultExpr?: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.value = value;
    this.cases = cases;
    this.defaultExpr = defaultExpr;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSwitch?.(this);
  }
  public toJSON() {
    return {
      type: "Switch",
      value: this.value.toJSON(),
      cases: this.cases.map((caseVal) => ({
        condition: caseVal.condition.toJSON(),
        body: caseVal.body.toJSON(),
      })),
      default: this.defaultExpr.toJSON(),
    };
  }
}

/**
 * Represents a catch block for handling exceptions thrown in a try block.
 * @category Statements
 */
export class Catch extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public patterns: Pattern[];

  constructor(patterns: Pattern[], body: Expression, loc?: SourceLocation) {
    super(loc);
    this.patterns = patterns;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCatch?.(this);
  }
  public toJSON() {
    return {
      type: "Catch",
      patterns: this.patterns.map((pat) => pat.toJSON()),
      body: this.body.toJSON(),
    };
  }
}
/**
 * Represents a try block, wrapping code that might throw exceptions.
 *
 * @example
 * try { ... } catch e : DomainException { ... }
 * @category Statements
 */
export class Try extends ASTNode {
  /** @hidden */
  public finallyExpr: Expression;
  /** @hidden */
  public catchExpr: Catch[];
  /** @hidden */
  public body: Expression;

  constructor(
    body: Expression,
    catchExpr: Catch[],
    finallyExpr: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.body = body;
    this.catchExpr = catchExpr;
    this.finallyExpr = finallyExpr;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTry?.(this);
  }
  public toJSON() {
    return {
      type: "Try",
      body: this.body.toJSON(),
      catch: this.catchExpr.map(({ patterns, body }) => ({
        condition: patterns.map((pattern) => pattern.toJSON()),
        body: body.toJSON(),
      })),
      finally: this.finallyExpr.toJSON(),
    };
  }
}

/**
 * Represents an explicit raising or throwing of an exception or error.
 * @category Statements
 */
export class Raise extends ASTNode {
  /** @hidden */
  public body: Expression;

  constructor(body: Expression, loc?: SourceLocation) {
    super(loc);
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRaise?.(this);
  }
  public toJSON() {
    return {
      type: "Raise",
      body: this.body.toJSON(),
    };
  }
}

/**
 * Represents a command to output data to the standard output.
 * @category Statements
 */
export class Print extends ASTNode {
  /** @hidden */
  public expression: Expression;

  constructor(expression: Expression, loc?: SourceLocation) {
    super(loc);
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPrint?.(this);
  }
  public toJSON() {
    return {
      type: "Print",
      expression: this.expression.toJSON(),
    };
  }
}
/**
 * Represents a command to read input from the user or standard input.
 * @category Statements
 */
export class Input extends ASTNode {
  /** @hidden */
  public variable: SymbolPrimitive;
  /** @hidden */
  public message: Expression;

  constructor(
    message: Expression,
    variable: SymbolPrimitive,
    loc?: SourceLocation
  ) {
    super(loc);
    this.message = message;
    this.variable = variable;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInput?.(this);
  }
  public toJSON() {
    return {
      type: "Input",
      message: this.message.toJSON(),
      variable: this.variable.toJSON(),
    };
  }
}

/**
 * Represents a for-loop control structure for iterating over a sequence or range.
 * @category Statements
 */
export class For extends ASTNode {
  /** @hidden */
  public statements: Statement[];
  /** @hidden */
  public body: Expression;

  constructor(body: Expression, statements: Statement[], loc?: SourceLocation) {
    super(loc);
    this.body = body;
    this.statements = statements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFor?.(this);
  }
  public toJSON() {
    return {
      type: "For",
      body: this.body.toJSON(),
      statements: this.statements.map((stmt) => stmt.toJSON()),
    };
  }
}
/**
 * Represents a control flow statement to exit the current loop immediately.
 * @category Statements
 */
export class Break extends ASTNode {
  /** @hidden */
  public body?: Expression;

  constructor(body: Expression = new NilPrimitive(null), loc?: SourceLocation) {
    super(loc);
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBreak?.(this);
  }
  public toJSON() {
    return {
      type: "Break",
      body: this.body.toJSON(),
    };
  }
}
/**
 * Represents a control flow statement to skip the rest of the current loop iteration.
 * @category Statements
 */
export class Continue extends ASTNode {
  /** @hidden */
  public body?: Expression;

  constructor(body: Expression = new NilPrimitive(null), loc?: SourceLocation) {
    super(loc);
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitContinue?.(this);
  }
  public toJSON() {
    return {
      type: "Continue",
      body: this.body.toJSON(),
    };
  }
}

/**
 * Represents a variable usage or reference in an expression.
 * @category Expressions
 */
export class Variable extends ASTNode {
  /** @hidden */
  public variableType?: Type;
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    expression: Expression,
    variableType?: Type,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.expression = expression;
    this.variableType = variableType;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariable?.(this);
  }
  public toJSON() {
    return {
      type: "Variable",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
      variableType: this.variableType.toJSON(),
    };
  }
}

/**
 * Represents an assignment operation, binding a value to a variable.
 *
 * @example
 * count = count + 1
 * @category Statements
 */
export class Assignment extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public identifier: SymbolPrimitive;

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
    return visitor.visitAssignment?.(this);
  }
  public toJSON() {
    return {
      type: "Assignment",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents a sequence of statements executed in order.
 * @category Statements
 */
export class Sequence extends ASTNode {
  /** @hidden */
  public statements: Statement[];

  constructor(statements: Statement[], loc?: SourceLocation) {
    super(loc);
    this.statements = statements;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSequence?.(this);
  }
  public toJSON() {
    return {
      type: "Sequence",
      statements: this.statements.map((stmt) => stmt.toJSON()),
    };
  }
}

export type Statement =
  | EntryPoint
  | Function
  | Clause
  | Procedure
  | TypeAlias
  | TypeSignature
  | Class
  | Object
  | Method
  | Super
  | Attribute
  | Interface
  | Switch
  | Send
  | Try
  | Return
  | Print
  | Input
  | Raise
  | Structure
  | Break
  | Continue
  | Call
  | Enumeration
  | Variable
  | Assignment
  | Yield
  | Record
  | If
  | Repeat
  | ForLoop
  | While;

export type AST = Statement[];

export interface YukigoParser {
  errors?: string[];
  parse: (code: string) => AST;
  parseExpression: (code: string) => Expression;
}

/* export interface Match {
  type: "Match";
  condition: Expression;
  body: Equation[];
}

export interface Arrow {
  type: "Arrow";
  expression1: Expression[];
  expression2: Expression[];
}
 */
