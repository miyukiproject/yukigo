import { Visitor } from "../visitor.js";
import {
  ASTNode,
  Primitive,
  SourceLocation,
  SymbolPrimitive,
} from "./generics.js";

export class VariablePattern extends ASTNode {
  constructor(public name: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
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

export class LiteralPattern extends ASTNode {
  constructor(public name: Primitive, loc?: SourceLocation) {
    super(loc);
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
export class ApplicationPattern extends ASTNode {
  constructor(
    public symbol: SymbolPrimitive,
    public args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
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

export class TuplePattern extends ASTNode {
  constructor(public elements: Pattern[], loc?: SourceLocation) {
    super(loc);
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

export class ListPattern extends ASTNode {
  constructor(public elements: Pattern[], loc?: SourceLocation) {
    super(loc);
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

export class FunctorPattern extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
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

export class AsPattern extends ASTNode {
  constructor(
    public alias: VariablePattern | WildcardPattern,
    public pattern: Pattern,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class UnionPattern extends ASTNode {
  constructor(public patterns: Pattern[], loc?: SourceLocation) {
    super(loc);
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

export class ConstructorPattern extends ASTNode {
  constructor(
    public constr: string,
    public patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
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

export class ConsPattern extends ASTNode {
  constructor(
    public head: Pattern,
    public tail: Pattern,
    loc?: SourceLocation
  ) {
    super(loc);
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
