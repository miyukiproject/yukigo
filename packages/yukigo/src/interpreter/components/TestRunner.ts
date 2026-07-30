import {
  Assert,
  ASTNode,
  Equality,
  Failure,
  Test,
  TestGroup,
  Truth,
  Visitor,
  Sequence,
  Exist,
  LogicConstraint,
} from "yukigo-ast";
import { LogicEngine } from "./logic/LogicEngine.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
} from "./kernel/commands.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { YukigoKernel } from "./kernel/index.js";
import { EqualityComparer } from "./EqualityComparer.js";
import { YuValue } from "../primitives/YuValue.js";
import { YuBoolean } from "../primitives/scalars/YuBoolean.js";
import { YuNil } from "../primitives/scalars/YuNil.js";
import { YuString } from "../primitives/sequences/YuString.js";
import { isTrue } from "../utils.js";
import { LogicResult } from "../primitives/entities/LogicResult.js";
import { RuntimeFunction } from "../primitives/entities/RuntimeFunction.js";
import { Evaluator } from "./evaluators/BaseEvaluator.js";

export class FailedAssert extends Error {
  constructor(
    public actual?: YuValue,
    public expected?: YuValue,
    message?: string,
  ) {
    super(message || `Assertion failed: expected ${expected}, got ${actual}`);
    this.name = "FailedAssert";
  }
}

class AssertionVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private interpreter: Evaluator,
    private negated: boolean,
  ) {}

  visitFailure(node: Failure): ExecutionCommand {
    let threw = false;
    let actualError: YuString | undefined;

    try {
      new YukigoKernel(this.interpreter).run(
        this.interpreter.evaluate(node.func),
      );
    } catch (error) {
      threw = true;
      actualError = new YuString((error as Error).message);
    }

    if (!node.message) {
      if (this.negated === threw) {
        return new FailCommand(
          new FailedAssert(
            actualError,
            undefined,
            threw
              ? `Expected code NOT to fail, but it failed with "${actualError?.value}"`
              : `Expected code to fail, but it succeeded`,
          ),
        );
      }
      return new StepCommand(YuNil.getInstance());
    }

    return new BindCommand(
      this.interpreter.evaluate(node.message),
      (expectedError) => {
        const isAnyException =
          expectedError instanceof RuntimeFunction ||
          (expectedError && String(expectedError).includes("anyException"));

        const expMsg =
          isAnyException || expectedError instanceof YuNil || !expectedError
            ? undefined
            : expectedError instanceof YuString
              ? expectedError.value
              : expectedError.toString();

        const passed =
          threw &&
          (expMsg === undefined || actualError?.value?.includes(expMsg));

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
                `Expected error message to contain "${expMsg}", but got "${actualError?.value}"`,
              ),
            );
          }
        }
        return new StepCommand(YuNil.getInstance());
      },
    );
  }

  visitEquality(node: Equality): ExecutionCommand {
    return new BindCommand(this.interpreter.evaluate(node.value), (value) => {
      return new BindCommand(
        this.interpreter.evaluate(node.expected),
        (expected) => {
          return new BindCommand(
            EqualityComparer.compare(
              value,
              expected,
              this.interpreter.getContext(),
            ),
            (passed) => {
              const isPassed = isTrue(passed);
              if (this.negated === isPassed) {
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
              return new StepCommand(YuNil.getInstance());
            },
          );
        },
      );
    });
  }

  visitTruth(node: Truth): ExecutionCommand {
    return new BindCommand(this.interpreter.evaluate(node.body), (value) => {
      const isTruthy =
        isTrue(value) || (value instanceof LogicResult && value.success);
      if (this.negated === isTruthy) {
        return new FailCommand(
          new FailedAssert(
            value,
            new YuBoolean(!this.negated),
            this.negated
              ? `Expected value to be falsy, but got ${JSON.stringify(value)}`
              : `Expected value to be truthy, but got ${JSON.stringify(value)}`,
          ),
        );
      }
      return new StepCommand(YuNil.getInstance());
    });
  }
  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new UnexpectedNode(node.constructor.name, "AssertionVisitor"),
    );
  }
}

export class TestRunner implements Visitor<ExecutionCommand> {
  constructor(
    public interpreter: Evaluator,
    private lazyRuntime: LazyRuntime,
  ) {}

  public run(node: TestGroup | Test | Assert): ExecutionCommand {
    return node.accept(this);
  }

  visitTestGroup(node: TestGroup): ExecutionCommand {
    return this.interpreter.evaluate(node.group);
  }
  visitTest(node: Test): ExecutionCommand {
    if (node.body.is(Sequence)) {
      const hasLogicGoal = node.body.statements.some(
        (stmt) => stmt.is(Exist) || stmt.is(LogicConstraint) || stmt.is(Assert),
      );
      if (hasLogicGoal) {
        const engine = new LogicEngine(
          this.interpreter,
          this.interpreter.getContext(),
        );
        const scope = new Map();
        return engine.solveConjunction(node.body.statements, new Map(), scope);
      }
    }
    return this.interpreter.evaluate(node.body);
  }
  visitAssert(node: Assert): ExecutionCommand {
    const negatedCmd = node.negated
      ? this.interpreter.evaluate(node.negated)
      : new StepCommand(new YuBoolean(false));

    return new BindCommand(negatedCmd, (negatedVal) => {
      const isNegated = isTrue(negatedVal);
      const visitor = new AssertionVisitor(this.interpreter, isNegated);
      return node.body.accept(visitor);
    });
  }
  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new UnexpectedNode(node.constructor.name, "TestRunner"),
    );
  }
}
