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
import {
  CPSThunk,
  idContinuation,
  trampoline,
  Continuation,
  Thunk,
} from "../trampoline.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";

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
    private lazyRuntime: LazyRuntime,
  ) {
    super();
  }

  visitFailure(node: Failure): CPSThunk<void> {
    return (k) => () => {
      let threw = false;
      let actualError: string | undefined;

      try {
        // We use trampoline here to execute the function under test.
        // While this is a nested trampoline, it's necessary to capture the error
        // and isolate the test execution from the test runner's CPS flow.
        trampoline(this.interpreter.evaluate(node.func, idContinuation));
      } catch (error) {
        threw = true;
        actualError = (error as Error).message;
      }

      return this.interpreter.evaluate(node.message, (expectedError) => {
        const passed =
          threw &&
          (expectedError === undefined ||
            actualError?.includes(expectedError as string));

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
              `Expected error message to contain "${expectedError}", but got "${actualError}"`,
            );
          }
        }
        return k(undefined);
      });
    };
  }

  visitEquality(node: Equality): CPSThunk<void> {
    return (k) =>
      this.interpreter.evaluate(node.value, (value) => {
        return () =>
          this.interpreter.evaluate(node.expected, (expected) => {
            return this.isEqual(value, expected, (passed) => {
              if (this.negated === passed) {
                throw new FailedAssert(
                  value,
                  expected,
                  this.negated
                    ? `Expected ${JSON.stringify(value)} NOT to be equal to ${JSON.stringify(expected)}`
                    : `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(value)}`,
                );
              }
              return k(undefined);
            });
          });
      });
  }

  visitTruth(node: Truth): CPSThunk<void> {
    return (k) =>
      this.interpreter.evaluate(node.body, (value) => {
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
        return k(undefined);
      });
  }
  private isEqual(a: any, b: any, k: Continuation<boolean>): Thunk<boolean> {
    if (a === b) return k(true);
    if (a && b && typeof a === "object" && typeof b === "object") {
      return this.lazyRuntime.realizeList(a, (valA) => {
        return () =>
          this.lazyRuntime.realizeList(b, (valB) => {
            if (Array.isArray(valA) && Array.isArray(valB)) {
              if (valA.length !== valB.length) return k(false);
              const checkNext = (index: number): Thunk<boolean> => {
                if (index >= valA.length) return k(true);
                return this.isEqual(valA[index], valB[index], (res) => {
                  if (!res) return k(false);
                  return () => checkNext(index + 1);
                });
              };
              return checkNext(0);
            }

            if (Array.isArray(valA) !== Array.isArray(valB)) return k(false);

            const keys = Object.keys(valA);
            if (keys.length !== Object.keys(valB).length) return k(false);
            const checkNextKey = (index: number): Thunk<boolean> => {
              if (index >= keys.length) return k(true);
              const key = keys[index];
              return this.isEqual(valA[key], valB[key], (res) => {
                if (!res) return k(false);
                return () => checkNextKey(index + 1);
              });
            };
            return checkNextKey(0);
          });
      });
    }
    return k(false);
  }
}

export class TestRunner extends TraverseVisitor {
  constructor(
    public interpreter: InterpreterVisitor,
    private lazyRuntime: LazyRuntime,
  ) {
    super();
  }

  public run(node: TestGroup | Test | Assert): CPSThunk<void> {
    return node.accept(this) as any;
  }

  visitTestGroup(node: TestGroup): CPSThunk<void> {
    return (k) => this.interpreter.evaluate(node.group, () => k(undefined));
  }
  visitTest(node: Test): CPSThunk<void> {
    return (k) => this.interpreter.evaluate(node.body, () => k(undefined));
  }
  visitAssert(node: Assert): CPSThunk<void> {
    return (k) =>
      this.interpreter.evaluate(node.negated, (negatedVal) => {
        const isNegated = Boolean(negatedVal);
        const visitor = new AssertionVisitor(
          this.interpreter,
          isNegated,
          this.lazyRuntime,
        );
        return (node.body.accept(visitor) as any)(k);
      });
  }
}
