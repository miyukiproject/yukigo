import {
  Assert,
  Assertion,
  Equality,
  Failure,
  PrimitiveValue,
  Test,
  TestGroup,
  TraverseVisitor,
  Truth,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";

export class FailedAssert extends Error {
  constructor(value: PrimitiveValue, expected: PrimitiveValue) {
    super();
  }
}

export class TestRunner extends TraverseVisitor {
  public interpreter: InterpreterVisitor;
  constructor(interpreter: InterpreterVisitor) {
    super();
    this.interpreter = interpreter;
  }

  /**
   * evaluate
   */
  public run(node: TestGroup | Test | Assert) {
    node.accept(this);
  }
  visitTestGroup(node: TestGroup): void {
    node.group.accept(this);
  }
  visitTest(node: Test): void {
    node.body.accept(this);
  }
  visitAssert(node: Assert): void {
    const assertion = this.runAssertion(node.body);
    const negated = node.negated.accept(this.interpreter);
    if (negated === assertion) throw new FailedAssert();
  }
  private runAssertion(node: Assertion): boolean {
    if (node instanceof Equality) {
      const value = node.value.accept(this.interpreter);
      const expected = node.expected.accept(this.interpreter);
      return value === expected;
    }
    if (node instanceof Truth) {
      return Boolean(node.body.accept(this.interpreter));
    }
    if (node instanceof Failure) {
      try {
        node.func.accept(this.interpreter);
        return false;
      } catch (error) {
        const expected = node.message.accept(this.interpreter);
        const actual = error.message;
        return actual === expected;
      }
    }
  }
}
