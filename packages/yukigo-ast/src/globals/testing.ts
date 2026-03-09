import { Visitor } from "../visitor/index.js";
import { Expression } from "./expressions.js";
import { ASTNode, SourceLocation } from "./generics.js";
import { Pattern } from "./patterns.js";
import { Sequence } from "./statements.js";

export class TestGroup extends ASTNode {
  public name: Expression;
  public group: Sequence;
  constructor(name: Expression, group: Sequence, loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.group = group;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTestGroup(this);
  }
  toJSON() {
    return {
      type: "TestGroup",
      name: this.name,
      group: this.group,
    };
  }
}
export class Test extends ASTNode {
  public name: Expression;
  public body: Sequence;
  public args: Pattern[];
  constructor(name: Expression, body: Sequence, args: Pattern[] = [], loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.body = body;
    this.args = args;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTest(this);
  }
  toJSON() {
    return {
      type: "Test",
      name: this.name,
      body: this.body,
      args: this.args,
    };
  }
}

export type Assertion = Truth | Equality | Failure;

export class Assert extends ASTNode {
  public negated: Expression;
  public body: Assertion;
  constructor(negated: Expression, body: Assertion, loc?: SourceLocation) {
    super(loc);
    this.negated = negated;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssert(this);
  }
  toJSON() {
    return {
      type: "Assert",
      negated: this.negated,
      body: this.body,
    };
  }
}

export class Truth extends ASTNode {
  public body: Expression;
  constructor(body: Expression, loc?: SourceLocation) {
    super(loc);
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTruth(this);
  }
  toJSON() {
    return {
      type: "Truth",
      body: this.body,
    };
  }
}
export class Equality extends ASTNode {
  public expected: Expression;
  public value: Expression;
  constructor(expected: Expression, value: Expression, loc?: SourceLocation) {
    super(loc);
    this.expected = expected;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEquality(this);
  }
  toJSON() {
    return {
      type: "Equality",
      expected: this.expected,
      value: this.value,
    };
  }
}

export class Failure extends ASTNode {
  public func: Expression;
  public message: Expression;
  constructor(func: Expression, message: Expression, loc?: SourceLocation) {
    super(loc);
    this.func = func;
    this.message = message;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFailure(this);
  }
  toJSON() {
    return {
      type: "Failure",
      func: this.func,
      message: this.message,
    };
  }
}
