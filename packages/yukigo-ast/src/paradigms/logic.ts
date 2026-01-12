import { Expression } from "../globals/expressions.js";
import { ASTNode, SourceLocation } from "../globals/generics.js";
import { Pattern } from "../globals/patterns.js";
import { Primitive, SymbolPrimitive } from "../globals/primitives.js";
import { Equation } from "../globals/statements.js";
import { Visitor } from "../visitor.js";

export type Clause = Rule | Fact | Query | Primitive;

/**
 * Represents a logic programming rule (Head :- Body).
 *
 * @example
 * grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
 * @category Logic
 */
export class Rule extends ASTNode {
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
    return visitor.visitRule?.(this);
  }
  public toJSON() {
    return {
      type: "Rule",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((expr) => expr.toJSON()),
    };
  }
}
/**
 * Represents a call to a predicate or goal.
 * @category Logic
 */
export class Call extends ASTNode {
  /** @hidden */
  public args: Expression[];
  /** @hidden */
  public callee: SymbolPrimitive;

  constructor(
    callee: SymbolPrimitive,
    args: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.callee = callee;
    this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCall?.(this);
  }
  public toJSON() {
    return {
      type: "Call",
      callee: this.callee.toJSON(),
      patterns: this.args.map((p) => p.toJSON()),
    };
  }
}

/**
 * Represents a fact, a rule with no body (always true).
 *
 * @example
 * human(socrates).
 * @category Logic
 */
export class Fact extends ASTNode {
  /** @hidden */
  public patterns: Pattern[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.patterns = patterns;
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

/**
 * Represents a query or goal to be proven.
 *
 * @example
 * ?- human(X).
 * @category Logic
 */
export class Query extends ASTNode {
  /** @hidden */
  public expressions: Expression[];

  constructor(expressions: Expression[], loc?: SourceLocation) {
    super(loc);
    this.expressions = expressions;
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

/**
 * Represents an existential quantification.
 * @category Logic
 */
export class Exist extends ASTNode {
  /** @hidden */
  public patterns: Pattern[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    patterns: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.patterns = patterns;
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

/**
 * Represents logical negation or failure-as-negation.
 * @category Logic
 */
export class Not extends ASTNode {
  /** @hidden */
  public expressions: Expression[];

  constructor(expressions: Expression[], loc?: SourceLocation) {
    super(loc);
    this.expressions = expressions;
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
/**
 * Represents a higher-order predicate finding all solutions (e.g., findall/3).
 * @category Logic
 */
export class Findall extends ASTNode {
  /** @hidden */
  public bag: Expression;
  /** @hidden */
  public goal: Expression;
  /** @hidden */
  public template: Expression;

  constructor(
    template: Expression,
    goal: Expression,
    bag: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.template = template;
    this.goal = goal;
    this.bag = bag;
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
/**
 * Represents a universal quantification or forall predicate.
 * @category Logic
 */
export class Forall extends ASTNode {
  /** @hidden */
  public action: Expression;
  /** @hidden */
  public condition: Expression;

  constructor(condition: Expression, action: Expression, loc?: SourceLocation) {
    super(loc);
    this.condition = condition;
    this.action = action;
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

/**
 * Represents a single goal within a logical rule or query.
 * @category Logic
 */
export class Goal extends ASTNode {
  /** @hidden */
  public args: Pattern[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    args: Pattern[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.args = args;
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
