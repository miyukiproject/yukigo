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

export class SimpleType extends ASTNode {
  constructor(
    public value: string,
    public constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSimpleType?.(this);
  }
  toJSON() {
    return {
      type: "SimpleType",
      value: this.value,
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
export class TypeVar extends ASTNode {
  constructor(
    public value: string,
    public constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeVar?.(this);
  }
  toJSON() {
    return {
      type: "TypeVar",
      value: this.value,
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
export class TypeApplication extends ASTNode {
  constructor(
    public functionType: Type,
    public argument: Type,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeApplication?.(this);
  }
  toJSON() {
    return {
      type: "TypeApplication",
      function: this.functionType.toJSON(),
      argument: this.argument.toJSON(),
    };
  }
}
export class ListType extends ASTNode {
  constructor(
    public values: Type,
    public constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListType?.(this);
  }
  toJSON() {
    return {
      type: "ListType",
      values: this.values.toJSON(),
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}
export class TupleType extends ASTNode {
  constructor(
    public values: Type[],
    public constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTupleType?.(this);
  }
  toJSON() {
    return {
      type: "TupleType",
      values: this.values.map((val) => val.toJSON()),
      constraints: this.constraints.map((c) => c.toJSON()),
    };
  }
}

export class Constraint extends ASTNode {
  constructor(
    public name: string,
    public parameters: Type[],
    loc?: SourceLocation
  ) {
    super(loc);
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

export class ParameterizedType extends ASTNode {
  constructor(
    public inputs: Type[],
    public returnType: Type,
    public constraints: Constraint[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitParameterizedType?.(this);
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
export class ConstrainedType extends ASTNode {
  constructor(public constraints: Constraint[], loc?: SourceLocation) {
    super(loc);
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

export class TypeAlias extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public variables: string[],
    public value: Type,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class TypeSignature extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public body: Type,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class TypeCast extends ASTNode {
  constructor(
    public expression: Expression,
    public body: Type,
    loc?: SourceLocation
  ) {
    super(loc);
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
