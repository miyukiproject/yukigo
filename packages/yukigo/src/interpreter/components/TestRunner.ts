import {
  Assert,
  Equality,
  Failure,
  PrimitiveValue,
  Test,
  TestGroup,
  TraverseVisitor,
  Truth,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every((key) => isEqual(a[key], b[key]));
  }
  return false;
}

export class FailedAssert extends Error {
  constructor(
    public actual?: PrimitiveValue,
    public expected?: PrimitiveValue,
    message?: string,
  ) {
    super(message || `Assertion failed: expected ${expected}, got ${actual}`);
    this.name = "FailedAssert";
  }
}

class AssertionVisitor extends TraverseVisitor {
  constructor(
    private interpreter: InterpreterVisitor,
    private negated: boolean,
  ) {
    super();
  }

  visitFailure(node: Failure): void {
    let threw = false;
    let actualError: string | undefined;
    try {
      node.func.accept(this.interpreter);
    } catch (error) {
      threw = true;
      actualError = (error as Error).message;
    }

    const expectedError = node.message.accept(this.interpreter);
    const passed =
      threw && (expectedError === undefined || actualError === expectedError);

    if (this.negated === passed) {
      if (!threw) {
        throw new FailedAssert(
          undefined,
          expectedError,
          "Expected code to fail, but it succeeded",
        );
      } else {
        throw new FailedAssert(
          actualError,
          expectedError,
          `Expected error message "${expectedError}", but got "${actualError}"`,
        );
      }
    }
  }
  visitEquality(node: Equality): void {
    const value = node.value.accept(this.interpreter);
    const expected = node.expected.accept(this.interpreter);
    const passed = isEqual(value, expected);
    if (this.negated === passed) {
      throw new FailedAssert(
        value,
        expected,
        this.negated
          ? `Expected ${JSON.stringify(value)} NOT to be equal to ${JSON.stringify(expected)}`
          : `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(value)}`,
      );
    }
  }
  visitTruth(node: Truth): void {
    const value = node.body.accept(this.interpreter);
    const isTruthy = Boolean(value);
    if (this.negated === isTruthy) {
      throw new FailedAssert(
        value,
        !this.negated,
        this.negated
          ? `Expected value to be falsy, but got ${JSON.stringify(value)}`
          : `Expected value to be truthy, but got ${JSON.stringify(value)}`,
      );
    }
  }
}

export class TestRunner extends TraverseVisitor {
  public interpreter: InterpreterVisitor;
  constructor(interpreter: InterpreterVisitor) {
    super();
    this.interpreter = interpreter;
  }

  /**
   * Executes the provided test node.
   * @param node - The test node to run. Can be a TestGroup, Test, or Assert.
   */
  public run(node: TestGroup | Test | Assert) {
    node.accept(this);
  }

  visitTestGroup(node: TestGroup): void {
    this.interpreter.evaluate(node.group);
  }
  visitTest(node: Test): void {
    this.interpreter.evaluate(node.body);
  }
  visitAssert(node: Assert): void {
    const isNegated = Boolean(node.negated.accept(this.interpreter));
    const visitor = new AssertionVisitor(this.interpreter, isNegated);
    node.body.accept(visitor);
  }
}
