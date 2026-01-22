import { Visitor } from "../visitor.js";
import { ASTNode, Expression, Sequence, SourceLocation } from "./generics.js";



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
  toJSON(): object {
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
  constructor(name: Expression, body: Sequence, loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTest(this);
  }
  toJSON(): object {
    return {
      type: "Test",
      name: this.name,
      body: this.body,
    };
  }
}
export class Assert extends ASTNode {
  public expected: Expression;
  public body: Expression;
  constructor(expected: Expression, body: Expression, loc?: SourceLocation) {
    super(loc);
    this.expected = expected;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssert(this);
  }
  toJSON(): object {
    return {
      type: "Assert",
      expected: this.expected,
      body: this.body,
    };
  }
}
