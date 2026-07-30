import {
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  AssignOperation,
  BinaryOperation,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
  ComparisonOperation,
  ListBinaryOperation,
  ListUnaryOperation,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  OperationVisitor,
  StringOperation,
  SymbolPrimitive,
  UnaryOperation,
  UnifyOperation,
} from "yukigo-ast";
import {
  BindCommand,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
  RaiseCommand,
  StepCommand,
} from "../kernel/commands.js";
import { Constructor, EvaluatorBase } from "./BaseEvaluator.js";
import {
  ArithmeticBinaryTable,
  ArithmeticUnaryTable,
  BinaryTable,
  BitwiseBinaryTable,
  BitwiseUnaryTable,
  ComparisonOperationTable,
  ListBinaryTable,
  ListUnaryTable,
  LogicalBinaryTable,
  LogicalUnaryTable,
  StringOperationTable,
  UnaryTable,
} from "../Operations.js";
import { InterpreterError } from "../../errors.js";
import { YuSequence } from "../../primitives/capabilities.js";
import {
  LazyList,
  RuntimeObject,
  YuBoolean,
  YuNumber,
  YuValue,
} from "../../primitives/index.js";
import { YukigoKernel } from "../kernel/index.js";
import { EqualityComparer } from "../EqualityComparer.js";
import { boolean, Environment, error, isTrue, raise } from "../../utils.js";
import { LogicEngine } from "../logic/LogicEngine.js";
import { RuntimeContext } from "../RuntimeContext.js";

const getLogicEngine = (
  evaluator: EvaluatorBase,
  ctx: RuntimeContext,
): LogicEngine => new LogicEngine(evaluator, ctx);

const processBinary = <T extends YuValue>(
  evaluator: EvaluatorBase,
  node: BinaryOperation,
  table: BinaryTable<T>,
  typeGuard: (a: YuValue, b: YuValue) => boolean,
  contextName: string,
): ExecutionCommand => {
  return new BindCommand(evaluator.evaluate(node.left), (rawLeft) => {
    return new BindCommand(evaluator.context.forceValue(rawLeft), (left) => {
      return new BindCommand(evaluator.evaluate(node.right), (rawRight) => {
        return new BindCommand(
          evaluator.context.forceValue(rawRight),
          (right) => {
            if (!typeGuard(left, right)) {
              return new FailCommand(
                new InterpreterError(
                  contextName,
                  `Type mismatch: ${left.getType()}, ${right.getType()}`,
                ),
              );
            }

            const fn = table[node.operator];
            if (!fn) {
              return new FailCommand(
                new InterpreterError(
                  contextName,
                  `Unknown op: ${node.operator}`,
                ),
              );
            }

            try {
              return fn(left as T, right as T);
            } catch (e) {
              return new FailCommand(e as Error);
            }
          },
        );
      });
    });
  });
};

const processUnary = <T extends YuValue>(
  evaluator: EvaluatorBase,
  node: UnaryOperation,
  table: UnaryTable<T>,
  typeGuard: (a: YuValue) => boolean,
  contextName: string,
): ExecutionCommand => {
  return new BindCommand(evaluator.evaluate(node.operand), (rawOperand) => {
    return new BindCommand(
      evaluator.context.forceValue(rawOperand),
      (operand) => {
        if (!typeGuard(operand))
          return new FailCommand(
            new InterpreterError(
              contextName,
              `Type mismatch: ${operand.getType()}`,
            ),
          );

        const fn = table[node.operator];
        if (!fn)
          return new FailCommand(
            new InterpreterError(contextName, `Unknown op: ${node.operator}`),
          );

        try {
          return fn(operand as T);
        } catch (e) {
          return new FailCommand(e as Error);
        }
      },
    );
  });
};

export function OperationEvaluator<TBase extends Constructor<EvaluatorBase>>(
  Base: TBase,
) {
  return class extends Base implements OperationVisitor<ExecutionCommand> {
    visitArithmeticUnaryOperation(
      node: ArithmeticUnaryOperation,
    ): ExecutionCommand {
      return processUnary(
        this,
        node,
        ArithmeticUnaryTable,
        (a) => !!a.asNumeric,
        "ArithmeticUnaryOperation",
      );
    }
    visitListUnaryOperation(node: ListUnaryOperation): ExecutionCommand {
      return new BindCommand(this.evaluate(node.operand), (rawOperand) => {
        return new BindCommand(
          this.context.forceValue(rawOperand),
          (operand) => {
            if (!operand.asSequence)
              return new FailCommand(
                new InterpreterError(
                  "ListUnaryOperation",
                  `Expected Sequence but got ${operand.getType()}`,
                ),
              );

            return new BindCommand(
              this.context.lazyRuntime.realizeList(operand),
              (arr) => {
                const seq = arr.asSequence;
                if (!seq)
                  return new RaiseCommand(
                    new InterpreterError(
                      `[${node.operator}]`,
                      `Expected ${arr} to be a YuSequence.`,
                    ),
                  );
                const fn = ListUnaryTable[node.operator];
                if (!fn)
                  return new FailCommand(
                    new InterpreterError(
                      "ListUnaryOperation",
                      `Unknown operator: ${node.operator}`,
                    ),
                  );
                return fn(seq);
              },
            );
          },
        );
      });
    }
    visitListBinaryOperation(node: ListBinaryOperation): ExecutionCommand {
      if (node.operator === "Concat") {
        const capturedCtx = this.context.clone();
        return new BindCommand(this.evaluate(node.left), (rawLeft) => {
          return new BindCommand(this.context.forceValue(rawLeft), (left) => {
            const seqL = left.asSequence as YuSequence;
            if (!seqL)
              return new RaiseCommand(
                new InterpreterError(
                  "ListBinaryOperation",
                  "Invalid left operand for lazy Concat",
                ),
              );

            if (this.context.config.lazyLoading) {
              const lazyRight = new LazyList(
                () => {
                  if (!capturedCtx.evaluatorFactory)
                    return new RaiseCommand(
                      new InterpreterError(
                        "ListBinaryOperation",
                        "EvaluatorFactory not initialized in RuntimeContext",
                      ),
                    );
                  const subEvaluator =
                    capturedCtx.evaluatorFactory(capturedCtx);
                  const subKernel = new YukigoKernel(subEvaluator);
                  const rawRight = subKernel.run(new EvalCommand(node.right));
                  const right = subKernel.run(capturedCtx.forceValue(rawRight));
                  const seqR = right.asSequence as YuSequence;
                  if (!seqR)
                    return new RaiseCommand(
                      new InterpreterError(
                        "ListBinaryOperation",
                        "Invalid right operand for lazy Concat",
                      ),
                    );
                  return seqR.step();
                },
                "LazyRight",
                capturedCtx,
              );
              return this.context.lazyRuntime.evaluateConcat(seqL, lazyRight);
            }

            return new BindCommand(this.evaluate(node.right), (rawRight) => {
              return new BindCommand(
                this.context.forceValue(rawRight),
                (right) => {
                  const seqR = right.asSequence as YuSequence;
                  if (!seqR)
                    return new RaiseCommand(
                      new InterpreterError(
                        "ListBinaryOperation",
                        "Invalid right operand for lazy Concat",
                      ),
                    );
                  return seqL.concat(seqR);
                },
              );
            });
          });
        });
      }

      return processBinary(
        this,
        node,
        ListBinaryTable,
        (a, b) => !!a.asSequence && !!b.asSequence,
        "ListBinaryOperation",
      );
    }
    visitComparisonOperation(node: ComparisonOperation): ExecutionCommand {
      return new BindCommand(this.evaluate(node.left), (rawLeft) => {
        return new BindCommand(this.context.forceValue(rawLeft), (left) => {
          return new BindCommand(this.evaluate(node.right), (rawRight) => {
            return new BindCommand(
              this.context.forceValue(rawRight),
              (right) => {
                if (node.operator === "Equal" || node.operator === "NotEqual") {
                  return new BindCommand(
                    EqualityComparer.compare(left, right, this.context),
                    (eq) => {
                      const isEq = isTrue(eq);
                      return new StepCommand(
                        new YuBoolean(node.operator === "Equal" ? isEq : !isEq),
                      );
                    },
                  );
                }

                if (left instanceof RuntimeObject) {
                  const objRuntime = this.context.objRuntime;
                  const chain = objRuntime.getResolutionChain(left);
                  const hasCompare =
                    !!objRuntime.findMethodInChain(chain, "compare/1") ||
                    !!objRuntime.findMethodInChain(chain, "compare");
                  if (hasCompare) {
                    return new BindCommand(
                      this.context.objRuntime.dispatch(left, "compare", [
                        right,
                      ]),
                      (compRes) => {
                        if (compRes instanceof YuNumber) {
                          const val = compRes.value;
                          let isTrue = false;
                          if (node.operator === "GreaterOrEqualThan")
                            isTrue = val >= 0;
                          else if (node.operator === "GreaterThan")
                            isTrue = val > 0;
                          else if (node.operator === "LessOrEqualThan")
                            isTrue = val <= 0;
                          else if (node.operator === "LessThan")
                            isTrue = val < 0;
                          return new StepCommand(new YuBoolean(isTrue));
                        }
                        return new RaiseCommand(
                          new InterpreterError(
                            "ComparisonOperation",
                            "compare method did not return a number",
                          ),
                        );
                      },
                    );
                  }
                }

                if (!ComparisonOperationTable[node.operator]) {
                  return new FailCommand(
                    new InterpreterError(
                      "ComparisonOperation",
                      `Unknown op: ${node.operator}`,
                    ),
                  );
                }
                try {
                  return ComparisonOperationTable[node.operator](
                    left as any,
                    right as any,
                  );
                } catch (error) {
                  return new FailCommand(
                    new InterpreterError(
                      "ComparisonOperation",
                      (error as Error).message,
                    ),
                  );
                }
              },
            );
          });
        });
      });
    }
    visitLogicalBinaryOperation(
      node: LogicalBinaryOperation,
    ): ExecutionCommand {
      return new BindCommand(this.evaluate(node.left), (left) => {
        const logicValue = left.asLogic;
        if (!logicValue)
          return new FailCommand(
            new InterpreterError(
              "LogicalBinaryOperation",
              `Expected left side to be boolean and got: ${left}`,
            ),
          );

        if (this.context.config.lazyLoading) {
          if (node.operator === "And") {
            const val = logicValue.toJSON();
            if (val === false) return boolean(false);
          }
          if (node.operator === "Or") {
            const val = logicValue.toJSON();
            if (val === true) return boolean(true);
          }
        }

        const fn = LogicalBinaryTable[node.operator];
        if (!fn)
          return new FailCommand(
            new InterpreterError(
              "LogicalBinaryOperation",
              `Unknown operator '${node.operator}'`,
            ),
          );

        return fn(logicValue, () => this.evaluate(node.right));
      });
    }
    visitLogicalUnaryOperation(node: LogicalUnaryOperation): ExecutionCommand {
      return processUnary(
        this,
        node,
        LogicalUnaryTable,
        (a) => !!a.asLogic,
        "LogicalUnaryOperation",
      );
    }
    visitBitwiseBinaryOperation(
      node: BitwiseBinaryOperation,
    ): ExecutionCommand {
      return processBinary(
        this,
        node,
        BitwiseBinaryTable,
        (a, b) => !!a.asNumeric && !!b.asNumeric,
        "BitwiseBinaryOperation",
      );
    }
    visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): ExecutionCommand {
      return processUnary(
        this,
        node,
        BitwiseUnaryTable,
        (a) => !!a.asNumeric,
        "BitwiseUnaryOperation",
      );
    }
    visitStringOperation(node: StringOperation): ExecutionCommand {
      return processBinary(
        this,
        node,
        StringOperationTable,
        (a, b) => !!a.asSummable && !!b.asSummable,
        "StringOperation",
      );
    }
    visitUnifyOperation(node: UnifyOperation): ExecutionCommand {
      return getLogicEngine(this, this.context).unifyExpr(
        node.left,
        node.right,
      );
    }
    visitAssignOperation(node: AssignOperation): ExecutionCommand {
      if (!this.context.config.mutability) {
        return raise(
          error(
            "AssignOperation",
            `Cannot perform assignment operation: mutability is disabled`,
          ),
        );
      }

      if (!(node.left instanceof SymbolPrimitive))
        return new FailCommand(
          new InterpreterError(
            "AssignOperation",
            "Left side must be a SymbolPrimitive",
          ),
        );
      const name = node.left.value;

      return new BindCommand(this.evaluate(node.right), (value) => {
        const onReplace = (scope: Environment) => {
          if (scope.has("self")) {
            const self = scope.get("self");
            if (self instanceof RuntimeObject && self.fields.has(name)) {
              self.fields.set(name, value);
            }
          }
        };

        if (!this.context.replace(name, value, onReplace)) {
          this.context.define(name, value);
        }

        return boolean(true);
      });
    }
    visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation) {
      return processBinary(
        this,
        node,
        ArithmeticBinaryTable,
        (a, b) => !!a.asNumeric && !!b.asNumeric,
        "ArithmeticBinaryOperation",
      );
    }
  };
}
