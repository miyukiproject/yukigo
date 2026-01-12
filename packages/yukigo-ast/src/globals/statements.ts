import { ASTNode, SourceLocation } from "./generics.js";
import { Visitor } from "../visitor.js";
import { Expression } from "./expressions.js";
import { NilPrimitive, SymbolPrimitive } from "./primitives.js";
import { Type, TypeAlias, TypeSignature } from "./types.js";
import { Pattern } from "./patterns.js";
import { EntryPoint, Enumeration, ForLoop, Procedure, Repeat, Structure, While } from "../paradigms/imperative.js";
import { Call, Clause } from "../paradigms/logic.js";
import { Yield } from "../paradigms/functional.js";
import { Class, Method, Super, Attribute, Interface, Send, Object } from "../paradigms/object.js";

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
