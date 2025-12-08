import { Visitor } from "../visitor.js";
import {
  ASTNode,
  Expression,
  SourceLocation,
  SymbolPrimitive,
} from "./generics.js";

export type Type =
  | SimpleType
  | TypeVar
  | ListType
  | TypeApplication
  | TupleType
  | ParameterizedType
  | ConstrainedType;

/**
 * Represents a basic named type (e.g., Int, Bool).
 * @category Types
 */
export class SimpleType extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];
  /** @hidden */
  public value: string;

  constructor(value: string, constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
    this.value = value;
    this.constraints = constraints;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSimpleType?.(this);
  }
  toString() {
    return this.value;
  }
  toJSON() {
    return {
      type: "SimpleType",
      value: this.value,
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
/**
 * Represents a type variable (e.g., 'a), used in polymorphic types.
 * @category Types
 */
export class TypeVar extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];
  /** @hidden */
  public value: string;

  constructor(value: string, constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
    this.value = value;
    this.constraints = constraints;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeVar?.(this);
  }
  toString(): string {
    return this.value;
  }
  toJSON() {
    return {
      type: "TypeVar",
      value: this.value,
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
/**
 * Represents the application of a type constructor to arguments (e.g., List Int).
 * @category Types
 */
export class TypeApplication extends ASTNode {
  /** @hidden */
  public argument: Type;
  /** @hidden */
  public functionType: Type;

  constructor(functionType: Type, argument: Type, loc?: SourceLocation) {
    super(loc);
    this.functionType = functionType;
    this.argument = argument;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeApplication?.(this);
  }
  toString(): string {
    const func = this.functionType.toString();
    let arg = this.argument.toString();
    if (
      this.argument instanceof TypeApplication ||
      this.argument instanceof ParameterizedType
    ) {
      arg = `(${arg})`;
    }
    return `${func} ${arg}`;
  }
  toJSON() {
    return {
      type: "TypeApplication",
      function: this.functionType.toJSON(),
      argument: this.argument.toJSON(),
    };
  }
}
/**
 * Represents a list type (e.g., [Int]).
 * @category Types
 */
export class ListType extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];
  /** @hidden */
  public values: Type;

  constructor(values: Type, constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
    this.values = values;
    this.constraints = constraints;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListType?.(this);
  }
  toString() {
    return `[${this.values.toString()}]`;
  }
  toJSON() {
    return {
      type: "ListType",
      values: this.values.toJSON(),
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
/**
 * Represents a tuple type (e.g., (Int, Bool)).
 * @category Types
 */
export class TupleType extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];
  /** @hidden */
  public values: Type[];

  constructor(values: Type[], constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
    this.values = values;
    this.constraints = constraints;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTupleType?.(this);
  }
  toString() {
    return `(${this.values.map((t) => t.toString()).join(", ")})`;
  }
  toJSON() {
    return {
      type: "TupleType",
      values: this.values.map((val) => val.toJSON()),
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}

/**
 * Represents a type constraint or class constraint (e.g., Eq a).
 *
 * @example
 * (Eq a) => a -> a -> Bool
 * @category Types
 */
export class Constraint extends ASTNode {
  /** @hidden */
  public parameters: Type[];
  /** @hidden */
  public name: string;

  constructor(name: string, parameters: Type[], loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.parameters = parameters;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConstraint?.(this);
  }
  toJSON() {
    return {
      type: "Constraint",
      name: this.name,
      parameters: this.parameters.map((p) => p.toJSON()),
    };
  }
}

/**
 * Represents a type that accepts type parameters.
 * @category Types
 */
export class ParameterizedType extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];
  /** @hidden */
  public returnType: Type;
  /** @hidden */
  public inputs: Type[];

  constructor(
    inputs: Type[],
    returnType: Type,
    constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.inputs = inputs;
    this.returnType = returnType;
    this.constraints = constraints;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitParameterizedType?.(this);
  }
  toString() {
    const inputs = this.inputs.map((t) => {
      const str = t.toString();
      return t instanceof ParameterizedType ? `(${str})` : str;
    });
    const ret = this.returnType.toString();
    const signature = [...inputs, ret].join(" -> ");

    if (this.constraints.length > 0) {
      const constraints = this.constraints
        .map((c) => {
          const params = c.parameters.map((p) => p.toString()).join(" ");
          return params ? `${c.name} ${params}` : c.name;
        })
        .join(", ");
      const context =
        this.constraints.length > 1 ? `(${constraints})` : constraints;
      return `${context} => ${signature}`;
    }
    return signature;
  }
  toJSON() {
    return {
      type: "ParameterizedType",
      inputs: this.inputs.map((p) => p.toJSON()),
      return: this.returnType.toJSON(),
      constraints: this.constraints.map((p) => p.toJSON()),
    };
  }
}
/**
 * Represents a type qualified by a context of constraints.
 * @category Types
 */
export class ConstrainedType extends ASTNode {
  /** @hidden */
  public constraints: Constraint[];

  constructor(constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
    this.constraints = constraints;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConstrainedType?.(this);
  }
  toJSON() {
    return {
      type: "ConstrainedType",
      constraints: this.constraints.map((p) => p.toJSON()),
    };
  }
}

/**
 * Represents a type alias definition, giving a new name to an existing type.
 *
 * @example
 * type String = [Char]
 * @category Types
 */
export class TypeAlias extends ASTNode {
  /** @hidden */
  public value: Type;
  /** @hidden */
  public variables: string[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    variables: string[],
    value: Type,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.variables = variables;
    this.value = value;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeAlias?.(this);
  }
  toJSON() {
    return {
      type: "TypeAlias",
      identifier: this.identifier.toJSON(),
      variables: this.variables,
      value: this.value.toJSON(),
    };
  }
}

/**
 * Represents an explicit type signature declaration for a function or variable.
 *
 * @example
 * add :: Int -> Int -> Int
 * @category Types
 */
export class TypeSignature extends ASTNode {
  /** @hidden */
  public body: Type;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(identifier: SymbolPrimitive, body: Type, loc?: SourceLocation) {
    super(loc);
    this.identifier = identifier;
    this.body = body;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeSignature?.(this);
  }
  toJSON() {
    return {
      type: "TypeSignature",
      identifier: this.identifier.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
/**
 * Represents an explicit type casting or annotation expression.
 * @category Types
 */
export class TypeCast extends ASTNode {
  /** @hidden */
  public body: Type;
  /** @hidden */
  public expression: Expression;

  constructor(expression: Expression, body: Type, loc?: SourceLocation) {
    super(loc);
    this.expression = expression;
    this.body = body;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeCast?.(this);
  }
  toJSON() {
    return {
      type: "TypeCast",
      expression: this.expression.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
