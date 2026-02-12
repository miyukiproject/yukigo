import {
  Assert,
  Equality,
  Failure,
  PrimitiveValue,
  Test,
  TestGroup,
  TraverseVisitor,
  Truth,
  isLazyList,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";
import { idContinuation, trampoline } from "../trampoline.js";
import { LazyRuntime } from "./LazyRuntime.js";

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    // Realize lazy lists for comparison
    const valA = isLazyList(a) ? LazyRuntime.realizeList(a) : a;
    const valB = isLazyList(b) ? LazyRuntime.realizeList(b) : b;

    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false;
      return valA.every((item, index) => isEqual(item, valB[index]));
    }

    if (Array.isArray(valA) !== Array.isArray(valB)) return false;

    const keys = Object.keys(valA);
    if (keys.length !== Object.keys(valB).length) return false;
    return keys.every((key) => isEqual(valA[key], valB[key]));
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
      trampoline(node.func.accept(this.interpreter)(idContinuation));
    } catch (error) {
      threw = true;
      actualError = (error as Error).message;
    }

    const expectedError = trampoline(node.message.accept(this.interpreter)(idContinuation));
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
    const value = trampoline(node.value.accept(this.interpreter)(idContinuation));
    const expected = trampoline(node.expected.accept(this.interpreter)(idContinuation));
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
    const value = trampoline(node.body.accept(this.interpreter)(idContinuation));
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
    trampoline(this.interpreter.evaluate(node.group, idContinuation));
  }
  visitTest(node: Test): void {
    trampoline(this.interpreter.evaluate(node.body, idContinuation));
  }
  visitAssert(node: Assert): void {
    const isNegated = Boolean(trampoline(node.negated.accept(this.interpreter)(idContinuation)));
    const visitor = new AssertionVisitor(this.interpreter, isNegated);
    node.body.accept(visitor);
  }
}
