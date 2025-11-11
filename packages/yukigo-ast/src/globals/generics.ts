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
  While,
} from "../paradigms/imperative.js";
import { Clause, Exist, Findall, Forall, Not, RuntimeClause } from "../paradigms/logic.js";
import {
  Attribute,
  Class,
  Implement,
  Include,
  Interface,
  Method,
  New,
  Object,
  Self,
  Send,
} from "../paradigms/object.js";
import { Visitor } from "../visitor.js";
import { Operation } from "./operators.js";
import { Pattern } from "./patterns.js";
import { LazyList, RuntimeFunction } from "./runtime.js";
import { Type, TypeAlias, TypeCast, TypeSignature } from "./types.js";

export type Modify<T, R> = Omit<T, keyof R> & R;

// Universal primitive value types

/**
 * Base class for all AST nodes
 */
export abstract class ASTNode {
  public loc?: SourceLocation;
  constructor(loc?: SourceLocation) {
    this.loc = loc;
  }
  abstract accept<R>(visitor: Visitor<R>): R;
  abstract toJSON(): object;
}

/**
 * Generic number primitive
 */
export class NumberPrimitive extends ASTNode {
  constructor(public value: number, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNumberPrimitive?.(this);
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
 */
export class BooleanPrimitive extends ASTNode {
  constructor(public value: boolean, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBooleanPrimitive?.(this);
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
 */
export class ListPrimitive extends ASTNode {
  constructor(public elements: Expression[], loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListPrimitive?.(this);
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
 */
export class CharPrimitive extends ASTNode {
  constructor(public value: string, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCharPrimitive?.(this);
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
 */
export class StringPrimitive extends ASTNode {
  constructor(public value: string, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitStringPrimitive?.(this);
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
 */
export class NilPrimitive extends ASTNode {
  constructor(public value: undefined | null, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNilPrimitive?.(this);
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
 */
export class SymbolPrimitive extends ASTNode {
  constructor(public value: string, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSymbolPrimitive?.(this);
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

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimeClause
  | LazyList
  | null
  | void
  | PrimitiveValue[]
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
 */
export class TupleExpression extends ASTNode {
  constructor(public elements: Expression[], loc?: SourceLocation) {
    super(loc);
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
 */
export class FieldExpression extends ASTNode {
  constructor(
    public name: SymbolPrimitive,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class DataExpression extends ASTNode {
  constructor(
    public name: SymbolPrimitive,
    public contents: FieldExpression[],
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class ConsExpression extends ASTNode {
  constructor(
    public head: Expression,
    public tail: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class LetInExpression extends ASTNode {
  constructor(
    public declarations: Sequence,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class ListComprehension extends ASTNode {
  constructor(
    public projection: Expression,
    public generators: (Generator | Expression)[],
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class Generator extends ASTNode {
  constructor(
    public variable: SymbolPrimitive,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class RangeExpression extends ASTNode {
  constructor(
    public start: Expression,
    public end?: Expression, // undefined for infinite ranges like [0..]
    public step?: Expression, // for [start, second .. end] syntax
    loc?: SourceLocation
  ) {
    super(loc);
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
  | Include
  | Implement
  | Send
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
 */
export class If extends ASTNode {
  constructor(
    public condition: Expression,
    public then: Expression,
    public elseExpr: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class Return extends ASTNode {
  constructor(public body: Expression, loc?: SourceLocation) {
    super(loc);
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
 */
export class Field extends ASTNode {
  constructor(
    public name: SymbolPrimitive | undefined,
    public value: Type,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class Constructor extends ASTNode {
  constructor(
    public name: SymbolPrimitive,
    public fields: Field[],
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class Record extends ASTNode {
  constructor(
    public name: SymbolPrimitive,
    public contents: Constructor[],
    public deriving?: SymbolPrimitive[],
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class UnguardedBody extends ASTNode {
  constructor(public sequence: Sequence, loc?: SourceLocation) {
    super(loc);
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

/**
 * Represents the body of an Equation that does have guards.
 * For example, Haskell's guards
 * @example
 * f x
 *    | x > 2 = x * 2
 *    | otherwise = x / 2
 */
export class GuardedBody extends ASTNode {
  constructor(
    public condition: Expression,
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
 */
export class Equation extends ASTNode {
  constructor(
    public patterns: Pattern[],
    public body: UnguardedBody | GuardedBody[],
    public returnExpr?: Return,
    loc?: SourceLocation,
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEquation?.(this);
  }
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
 *
 */
export class Function extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public equations: Equation[],
    loc?: SourceLocation
  ) {
    super(loc);
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

export class Case extends ASTNode {
  constructor(
    public condition: Pattern,
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class Switch extends ASTNode {
  constructor(
    public value: Expression,
    public cases: Case[],
    public defaultExpr?: Expression,
    loc?: SourceLocation,
  ) {
    super(loc);
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

export class Catch extends ASTNode {
  constructor(
    public patterns: Pattern[],
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class Try extends ASTNode {
  constructor(
    public body: Expression,
    public catchExpr: Catch[],
    public finallyExpr: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class Raise extends ASTNode {
  constructor(public body: Expression, loc?: SourceLocation) {
    super(loc);
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

export class Print extends ASTNode {
  constructor(public expression: Expression, loc?: SourceLocation) {
    super(loc);
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

export class For extends ASTNode {
  constructor(
    public body: Expression,
    public statements: Statement[],
    loc?: SourceLocation
  ) {
    super(loc);
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
export class Break extends ASTNode {
  constructor(public body: Expression, loc?: SourceLocation) {
    super(loc);
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
export class Continue extends ASTNode {
  constructor(public body: Expression, loc?: SourceLocation) {
    super(loc);
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

export class Variable extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public expression: Expression,
    public variableType?: Type,
    loc?: SourceLocation,
  ) {
    super(loc);
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

export class Assignment extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class Sequence extends ASTNode {
  constructor(public statements: Statement[], loc?: SourceLocation) {
    super(loc);
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
  | Attribute
  | Interface
  | Switch
  | Try
  | Return
  | Print
  | Raise
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

export interface PrimitiveMethod {
  type: "PrimitiveMethod";
  operator: Operator;
  equations: Equation[];
} */
