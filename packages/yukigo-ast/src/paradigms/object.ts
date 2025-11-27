import {
  ASTNode,
  Equation,
  Expression,
  SourceLocation,
  SymbolPrimitive,
} from "../globals/generics.js";
import { Visitor } from "../visitor.js";

export class Method extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public equations: Equation[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitMethod?.(this);
  }
  public toJSON() {
    return {
      type: "Method",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((eq) => eq.toJSON()),
    };
  }
}

export class Attribute extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAttribute?.(this);
  }
  public toJSON() {
    return {
      type: "Attribute",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

export class Object extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitObject?.(this);
  }
  public toJSON() {
    return {
      type: "Object",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

export class Class extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public extendsSymbol: SymbolPrimitive | undefined,
    public implementsNode: Implement | undefined,
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitClass?.(this);
  }
  public toJSON() {
    return {
      type: "Class",
      identifier: this.identifier.toJSON(),
      extends: this.extendsSymbol.toJSON(),
      implements: this.implementsNode.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

export class Interface extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public extendsSymbol: SymbolPrimitive[],
    public expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInterface?.(this);
  }
  public toJSON() {
    return {
      type: "Interface",
      identifier: this.identifier.toJSON(),
      extends: this.extendsSymbol.map((symbol) => symbol.toJSON()),
      expression: this.expression.toJSON(),
    };
  }
}

export class Send extends ASTNode {
  constructor(
    public receiver: Expression,
    public selector: Expression,
    public args: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSend?.(this);
  }
  public toJSON() {
    return {
      type: "Send",
      receiver: this.receiver.toJSON(),
      selector: this.selector.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

export class New extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public args: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNew?.(this);
  }
  public toJSON() {
    return {
      type: "New",
      identifier: this.identifier.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

export class Implement extends ASTNode {
  constructor(public identifier: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitImplement?.(this);
  }
  public toJSON() {
    return {
      type: "Implement",
      identifier: this.identifier.toJSON(),
    };
  }
}

export class Include extends ASTNode {
  constructor(public identifier: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInclude?.(this);
  }
  public toJSON() {
    return {
      type: "Include",
      identifier: this.identifier.toJSON(),
    };
  }
}
export class Self extends ASTNode {
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSelf?.(this);
  }
  public toJSON() {
    return {
      type: "Self",
    };
  }
}
