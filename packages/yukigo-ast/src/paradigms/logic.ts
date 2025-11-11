import {
  ASTNode,
  Expression,
  Primitive,
  PrimitiveValue,
  SourceLocation,
  SymbolPrimitive,
} from "../globals/generics.js";
import { Pattern } from "../globals/patterns.js";
import { Visitor } from "../visitor.js";

export type Clause = Rule | Fact | Query | Primitive;

export class Rule extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public patterns: Pattern[],
    public expressions: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRule?.(this);
  }
  public toJSON() {
    return {
      type: "Rule",
      identifier: this.identifier.toJSON(),
      patterns: this.patterns.map((p) => p.toJSON()),
      expressions: this.expressions.map((expr) => expr.toJSON()),
    };
  }
}
export class Call extends ASTNode {
  constructor(
    public callee: SymbolPrimitive,
    public patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCall?.(this);
  }
  public toJSON() {
    return {
      type: "Call",
      callee: this.callee.toJSON(),
      patterns: this.patterns.map((p) => p.toJSON()),
    };
  }
}

export class Fact extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFact?.(this);
  }
  public toJSON() {
    return {
      type: "Fact",
      identifier: this.identifier.toJSON(),
      patterns: this.patterns.map((p) => p.toJSON()),
    };
  }
}

export class Query extends ASTNode {
  constructor(public expressions: Expression[], loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitQuery?.(this);
  }
  public toJSON() {
    return {
      type: "Query",
      expressions: this.expressions.map((expr) => expr.toJSON()),
    };
  }
}

export class Exist extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitExist?.(this);
  }
  public toJSON() {
    return {
      type: "Exist",
      identifier: this.identifier.toJSON(),
      patterns: this.patterns.map((p) => p.toJSON()),
    };
  }
}

export class Not extends ASTNode {
  constructor(public expressions: Expression[], loc?: SourceLocation) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNot?.(this);
  }
  public toJSON() {
    return {
      type: "Not",
      expressions: this.expressions.map((expr) => expr.toJSON()),
    };
  }
}
export class Findall extends ASTNode {
  constructor(
    public template: Expression,
    public goal: Expression,
    public bag: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFindall?.(this);
  }
  public toJSON() {
    return {
      type: "Findall",
      template: this.template.toJSON(),
      goal: this.goal.toJSON(),
      bag: this.bag.toJSON(),
    };
  }
}
export class Forall extends ASTNode {
  constructor(
    public condition: Expression,
    public action: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitForall?.(this);
  }
  public toJSON() {
    return {
      type: "Forall",
      condition: this.condition.toJSON(),
      action: this.action.toJSON(),
    };
  }
}

export class Goal extends ASTNode {
  constructor(
    public identifier: SymbolPrimitive,
    public args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGoal?.(this);
  }
  public toJSON() {
    return {
      type: "Goal",
      identifier: this.identifier.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

// Runtime Types

export interface RuntimeClause {
  kind: "Clause";
  identifier: string;
  equations: (Fact | Rule)[];
}
