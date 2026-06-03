import {
  Assert,
  ASTNode,
  Equality,
  Failure,
  PrimitiveValue,
  Test,
  TestGroup,
  Truth,
  Visitor,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
} from "./kernel/commands.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { UnexpectedNode } from "../errors.js";
import { YukigoKernel } from "./kernel/index.js";

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

class AssertionVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private interpreter: InterpreterVisitor,
    private negated: boolean,
    private lazyRuntime: LazyRuntime,
  ) {}

  visitFailure(node: Failure): ExecutionCommand {
    let threw = false;
    let actualError: string | undefined;

    try {
      new YukigoKernel(this.interpreter).run(this.interpreter.evaluate(node.func));
    } catch (error) {
      threw = true;
      actualError = (error as Error).message;
    }

    return new BindCommand(this.interpreter.evaluate(node.message), (expectedError) => {
      const passed =
        threw &&
        (expectedError === undefined ||
          actualError?.includes(expectedError as string));

      if (this.negated === passed) {
        if (!threw) {
          return new FailCommand(
            new FailedAssert(
              undefined,
              expectedError,
              "Expected code to fail, but it succeeded",
            ),
          );
        } else {
          return new FailCommand(
            new FailedAssert(
              actualError,
              expectedError,
              `Expected error message to contain "${expectedError}", but got "${actualError}"`,
            ),
          );
        }
      }
      return new StepCommand(undefined);
    });
  }

  visitEquality(node: Equality): ExecutionCommand {
    return new BindCommand(this.interpreter.evaluate(node.value), (value) => {
      return new BindCommand(this.interpreter.evaluate(node.expected), (expected) => {
        return new BindCommand(this.lazyRuntime.deepEqual(value, expected), (passed) => {
          if (this.negated === passed) {
            return new FailCommand(
              new FailedAssert(
                value,
                expected,
                this.negated
                  ? `Expected ${JSON.stringify(value)} NOT to be equal to ${JSON.stringify(expected)}`
                  : `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(value)}`,
              ),
            );
          }
          return new StepCommand(undefined);
        });
      });
    });
  }

  visitTruth(node: Truth): ExecutionCommand {
    return new BindCommand(this.interpreter.evaluate(node.body), (value) => {
      const isTruthy = Boolean(value);
      if (this.negated === isTruthy) {
        return new FailCommand(
          new FailedAssert(
            value,
            !this.negated,
            this.negated
              ? `Expected value to be falsy, but got ${JSON.stringify(value)}`
              : `Expected value to be truthy, but got ${JSON.stringify(value)}`,
          ),
        );
      }
      return new StepCommand(undefined);
    });
  }
  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(new UnexpectedNode(node.constructor.name, "AssertionVisitor"));
  }
}

export class TestRunner implements Visitor<ExecutionCommand> {
  constructor(
    public interpreter: InterpreterVisitor,
    private lazyRuntime: LazyRuntime,
  ) {}

  public run(node: TestGroup | Test | Assert): ExecutionCommand {
    return node.accept(this);
  }

  visitTestGroup(node: TestGroup): ExecutionCommand {
    return this.interpreter.evaluate(node.group);
  }
  visitTest(node: Test): ExecutionCommand {
    return this.interpreter.evaluate(node.body);
  }
  visitAssert(node: Assert): ExecutionCommand {
    return new BindCommand(this.interpreter.evaluate(node.negated), (negatedVal) => {
      const isNegated = Boolean(negatedVal);
      const visitor = new AssertionVisitor(
        this.interpreter,
        isNegated,
        this.lazyRuntime,
      );
      return node.body.accept(visitor);
    });
  }
  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(new UnexpectedNode(node.constructor.name, "TestRunner"));
  }
}
