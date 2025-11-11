import {
  ASTNode,
  Equation,
  Expression,
  SourceLocation,
  SymbolPrimitive,
} from "../globals/generics.js";
import { Visitor } from "../visitor.js";

export class EntryPoint extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public expressions: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEntryPoint?.(this);
  }
  public toJSON() {
    return {
      type: "EntryPoint",
      identifier: this.identifier.toJSON(),
      expressions: this.expressions.map((expr) => expr.toJSON()),
    };
  }
}

export class Procedure extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public equations: Equation[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitProcedure?.(this);
  }
  public toJSON() {
    return {
      type: "Procedure",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((eq) => eq.toJSON()),
    };
  }
}

export class Enumeration extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public contents: SymbolPrimitive[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEnumeration?.(this);
  }
  public toJSON() {
    return {
      type: "Enumeration",
      identifier: this.identifier.toJSON(),
      expressions: this.contents.map((c) => c.toJSON()),
    };
  }
}

export class While extends ASTNode {
  constructor(
    public condition: Expression,
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWhile?.(this);
  }
  public toJSON() {
    return {
      type: "While",
      condition: this.condition.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
export class Repeat extends ASTNode {
  constructor(
    public count: Expression,
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRepeat?.(this);
  }
  public toJSON() {
    return {
      type: "Repeat",
      count: this.count.toJSON(),
      body: this.body.toJSON(),
    };
  }
}

export class ForLoop extends ASTNode {
  constructor(
    public initialization: Expression,
    public condition: Expression,
    public update: Expression,
    public body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitForLoop?.(this);
  }
  public toJSON() {
    return {
      type: "ForLoop",
      initialization: this.initialization.toJSON(),
      condition: this.condition.toJSON(),
      update: this.update.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
