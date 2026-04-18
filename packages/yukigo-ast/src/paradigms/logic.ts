import { Expression } from "../globals/expressions.js";
import { ASTNode, SerializeNode, SourceLocation } from "../globals/generics.js";
import { Pattern } from "../globals/patterns.js";
import { Primitive, SymbolPrimitive } from "../globals/primitives.js";
import { PrimitiveValue } from "../globals/runtime.js";
import { Equation } from "../globals/statements.js";
import { Visitor } from "../visitor/index.js";

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
    loc?: SourceLocation,
  ) {
    super(loc);
    this.identifier = identifier;
    this.equations = equations;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitRule);
  }
  public toJSON(): SerializeNode {
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
    loc?: SourceLocation,
  ) {
    super(loc);
    this.callee = callee;
    this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitCall);
  }
  public toJSON(): SerializeNode {
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
    loc?: SourceLocation,
  ) {
    super(loc);
    this.identifier = identifier;
    this.patterns = patterns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitFact);
  }
  public toJSON(): SerializeNode {
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
    return this.dispatchVisit(visitor, visitor.visitQuery);
  }
  public toJSON(): SerializeNode {
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
    loc?: SourceLocation,
  ) {
    super(loc);
    this.identifier = identifier;
    this.patterns = patterns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitExist);
  }
  public toJSON(): SerializeNode {
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
  public expression: Expression;

  constructor(expression: Expression, loc?: SourceLocation) {
    super(loc);
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitNot);
  }
  public toJSON(): SerializeNode {
    return {
      type: "Not",
      expression: this.expression.toJSON(),
    };
  }
}
/**
 * Represents a higher-order predicate finding all solutions (e.g., findall/3).
 * @category Logic
 */
export class Findall extends ASTNode {
  /** @hidden */
  public bag: Pattern;
  /** @hidden */
  public goal: Expression;
  /** @hidden */
  public template: Pattern;

  constructor(
    template: Pattern,
    goal: Expression,
    bag: Pattern,
    loc?: SourceLocation,
  ) {
    super(loc);
    this.template = template;
    this.goal = goal;
    this.bag = bag;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitFindall);
  }
  public toJSON(): SerializeNode {
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
    return this.dispatchVisit(visitor, visitor.visitForall);
  }
  public toJSON(): SerializeNode {
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
    loc?: SourceLocation,
  ) {
    super(loc);
    this.identifier = identifier;
    this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitGoal);
  }
  public toJSON(): SerializeNode {
    return {
      type: "Goal",
      identifier: this.identifier.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

/**
 * Represents a logical constraint or guard that must evaluate to true.
 * Unlike a Goal/Call, this delegates to the expression evaluator rather
 * than the predicate resolution engine.
 *
 * @example
 * baz(X) :- X > 4.  // "X > 4" is the Constraint
 * @category Logic
 */
export class LogicConstraint extends ASTNode {
  /** @hidden */
  public expression: Expression;

  constructor(expression: Expression, loc?: SourceLocation) {
    super(loc);
    this.expression = expression;
  }

  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitLogicConstraint);
  }

  public toJSON(): SerializeNode {
    return {
      type: "LogicConstraint",
      expression: this.expression.toJSON(),
    };
  }
}