import { YukigoKernel } from "./kernel/index.js";
import {
  NumberPrimitive,
  BooleanPrimitive,
  StringPrimitive,
  ListPrimitive,
  NilPrimitive,
  SymbolPrimitive,
  Variable,
  CharPrimitive,
  ArithmeticUnaryOperation,
  ArithmeticBinaryOperation,
  ListUnaryOperation,
  ListBinaryOperation,
  ComparisonOperation,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
  StringOperation,
  UnifyOperation,
  AssignOperation,
  Assignment,
  TupleExpression,
  FieldExpression,
  DataExpression,
  ConsExpression,
  LetInExpression,
  Call,
  Otherwise,
  CompositionExpression,
  VariablePattern,
  Expression,
  Application,
  Lambda,
  UnguardedBody,
  Sequence,
  Return,
  Exist,
  Not,
  Findall,
  Forall,
  Goal,
  Send,
  New,
  Self,
  ListComprehension,
  RangeExpression,
  Generator as YuGenerator,
  BinaryOperation,
  UnaryOperation,
  ASTNode,
  Raise,
  Query,
  TypeCast,
  Super,
  If,
  Assert,
  Test,
  TestGroup,
  Function as ASTFunction,
  LogicConstraint,
  Object as YuObject,
  NamedArgument,
  Try,
  Catch,
  Attribute,
  GuardedExpression,
} from "yukigo-ast";
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
} from "./Operations.js";
import {
  boolean,
  Environment,
  EnvStack,
  error,
  Evaluator,
  isTrue,
  raise,
} from "../utils.js";
import { LogicEngine } from "./logic/LogicEngine.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { EnvBuilderVisitor, OOPCollector } from "./EnvBuilder.js";
import { TestRunner } from "./TestRunner.js";
import { RuntimeContext } from "./RuntimeContext.js";
import {
  BacktrackCommand,
  BindCommand,
  CatchCommand,
  CatchHandler,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
  RaiseCommand,
  StepCommand,
} from "./kernel/commands.js";
import { EqualityComparer } from "./EqualityComparer.js";
import { YuSequence } from "../primitives/capabilities.js";
import { YuBoolean } from "../primitives/scalars/YuBoolean.js";
import { YuNil } from "../primitives/scalars/YuNil.js";
import { YuNumber } from "../primitives/scalars/YuNumber.js";
import { YuArray } from "../primitives/sequences/YuArray.js";
import { YuString } from "../primitives/sequences/YuString.js";
import { YuValue } from "../primitives/YuValue.js";
import { RuntimeClass } from "../primitives/entities/RuntimeClass.js";
import {
  EquationRuntime,
  RuntimeFunction,
} from "../primitives/entities/RuntimeFunction.js";
import {
  LazyList,
  LogicAnswer,
  LogicResult,
  RuntimeObject,
} from "../primitives/index.js";

export class InterpreterVisitor implements Evaluator {
  constructor(public context: RuntimeContext) {
    this.context.evaluatorFactory = (ctx) => new InterpreterVisitor(ctx);
  }

  getContext(): RuntimeContext {
    return this.context;
  }

  evaluate(node: ASTNode): ExecutionCommand {
    return node.accept(this);
  }

  visitSequence(node: Sequence): ExecutionCommand {
    if (node.statements.length === 0)
      return new StepCommand(YuNil.getInstance());

    const evaluateNext = (
      index: number,
      lastResult: YuValue,
    ): ExecutionCommand => {
      if (index >= node.statements.length) return new StepCommand(lastResult);

      const stmt = node.statements[index];
      return new BindCommand(this.evaluate(stmt), (result) => {
        if (stmt instanceof Return) return new StepCommand(result);
        return evaluateNext(index + 1, result);
      });
    };

    return evaluateNext(0, YuNil.getInstance());
  }

  visitFunction(node: ASTFunction): ExecutionCommand {
    return new StepCommand(YuNil.getInstance());
  }

  visitReturn(node: Return): ExecutionCommand {
    if (!node.body) return new StepCommand(YuNil.getInstance());
    return this.evaluate(node.body);
  }

  visitAssert(node: Assert): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitAssert(node);
  }

  visitTest(node: Test): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitTest(node);
  }

  visitTestGroup(node: TestGroup): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitTestGroup(node);
  }

  visitObject(node: YuObject): ExecutionCommand {
    const identifier = node.identifier.value;
    const collector = new OOPCollector(this.context);
    node.expression.accept(collector);

    const fields = collector.collectedFields;
    const methods = collector.collectedMethods;

    const extendsSymbol = (node as any).extendsSymbol?.value;
    if (extendsSymbol) {
      const classDef = this.context.lookup(extendsSymbol);
      if (classDef && classDef instanceof RuntimeClass) {
        const classFields = this.getClassFields(classDef);
        for (const [k, v] of classFields.entries()) {
          if (!fields.has(k)) {
            fields.set(k, v);
          }
        }
      }
    }

    const runtimeObject = new RuntimeObject(
      identifier,
      extendsSymbol || "",
      fields,
      methods,
    );

    const extendsArgs = (node as any).extendsArgs || [];
    const evaluateArgs = (index: number): ExecutionCommand => {
      if (index >= extendsArgs.length) {
        this.context.define(identifier, runtimeObject);
        return new StepCommand(runtimeObject);
      }
      const arg = extendsArgs[index];
      if (
        arg instanceof NamedArgument ||
        arg.constructor.name === "NamedArgument"
      ) {
        const fieldName = (arg as any).identifier.value;
        return new BindCommand(
          this.evaluate((arg as any).expression),
          (val) => {
            runtimeObject.setField(fieldName, val);
            return evaluateArgs(index + 1);
          },
        );
      }
      return evaluateArgs(index + 1);
    };

    const evaluateClassInitializers = (
      classDef: RuntimeClass,
      keys: string[],
      keyIndex: number,
    ): ExecutionCommand => {
      if (keyIndex >= keys.length) {
        return evaluateArgs(0);
      }
      const key = keys[keyIndex];
      if (collector.fieldInitializers.has(key)) {
        return evaluateClassInitializers(classDef, keys, keyIndex + 1);
      }
      const expr = classInitializers.get(key);
      return new BindCommand(this.evaluate(expr), (val) => {
        runtimeObject.setField(key, val);
        return evaluateClassInitializers(classDef, keys, keyIndex + 1);
      });
    };

    let classInitializers: Map<string, any> = new Map();
    let classInitializerKeys: string[] = [];
    if (extendsSymbol) {
      const classDef = this.context.lookup(extendsSymbol);
      if (classDef && classDef instanceof RuntimeClass) {
        classInitializers = this.getClassInitializers(classDef);
        classInitializerKeys = Array.from(classInitializers.keys());
        return evaluateClassInitializers(classDef, classInitializerKeys, 0);
      }
    }

    return evaluateArgs(0);
  }

  visitNumberPrimitive(node: NumberPrimitive): ExecutionCommand {
    return new StepCommand(new YuNumber(node.value));
  }

  visitBooleanPrimitive(node: BooleanPrimitive): ExecutionCommand {
    return boolean(node.value);
  }

  visitStringPrimitive(node: StringPrimitive): ExecutionCommand {
    return new StepCommand(new YuString(node.value));
  }

  visitListPrimitive(node: ListPrimitive): ExecutionCommand {
    if (node.value.length === 0) return new StepCommand(new YuArray([]));

    const results: YuValue[] = [];
    const evaluateNext = (index: number): ExecutionCommand => {
      if (index >= node.value.length)
        return new StepCommand(new YuArray(results));

      return new BindCommand(this.evaluate(node.value[index]), (val) => {
        results.push(val);
        return evaluateNext(index + 1);
      });
    };

    return evaluateNext(0);
  }

  visitNilPrimitive(node: NilPrimitive): ExecutionCommand {
    return new StepCommand(YuNil.getInstance());
  }

  visitCharPrimitive(node: CharPrimitive): ExecutionCommand {
    return new StepCommand(new YuString(node.value));
  }

  visitSymbolPrimitive(node: SymbolPrimitive): ExecutionCommand {
    try {
      const isLogic = !!this.context.logicState;
      const isVar = /^[A-Z_]/.test(node.value);
      if (isLogic && !isVar && !this.context.isDefined(node.value)) {
        return new StepCommand(new YuString(node.value));
      }
      const val = this.context.lookup(node.value);
      return new StepCommand(val);
    } catch (error) {
      return new FailCommand(
        new InterpreterError("Symbol Lookup", (error as Error).message),
      );
    }
  }

  visitVariable(node: Variable): ExecutionCommand {
    const name = node.identifier.value;
    return new BindCommand(this.evaluate(node.expression), (value) => {
      this.context.define(name, value);
      return boolean(true);
    });
  }

  visitAttribute(node: Attribute): ExecutionCommand {
    const name = node.identifier.value;
    return new BindCommand(this.evaluate(node.expression), (value) => {
      this.context.define(name, value);
      return boolean(true);
    });
  }

  visitAssignment(node: Assignment): ExecutionCommand {
    if (!this.context.config.mutability) {
      return new FailCommand(
        new InterpreterError(
          "Assignment",
          `Cannot reassign variable '${node.identifier.value}': mutability is disabled`,
        ),
      );
    }

    const name = node.identifier.value;
    return new BindCommand(this.evaluate(node.expression), (value) => {
      const onReplace = (scope: Environment) => {
        if (scope.has("self")) {
          const self = scope.get("self");
          if (self instanceof RuntimeObject && self.fields.has(name))
            self.fields.set(name, value);
        }
      };

      if (!this.context.replace(name, value, onReplace))
        return new FailCommand(
          new InterpreterError(
            "Assignment",
            `Cannot assign to undefined variable: ${name}`,
          ),
        );

      return new StepCommand(value);
    });
  }

  visitArithmeticUnaryOperation(
    node: ArithmeticUnaryOperation,
  ): ExecutionCommand {
    return this.processUnary(
      node,
      ArithmeticUnaryTable,
      (a) => !!a.asNumeric,
      "ArithmeticUnaryOperation",
    );
  }

  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation,
  ): ExecutionCommand {
    if (node.operator === "Plus") {
      return new BindCommand(this.evaluate(node.left), (rawLeft) => {
        return new BindCommand(this.context.forceValue(rawLeft), (left) => {
          return new BindCommand(this.evaluate(node.right), (rawRight) => {
            return new BindCommand(
              this.context.forceValue(rawRight),
              (right) => {
                if (left instanceof YuString || right instanceof YuString) {
                  return new StepCommand(
                    new YuString(left.toString() + right.toString()),
                  );
                }
                const areSameType = left.getType() === right.getType();
                if (left.asNumeric && right.asNumeric && areSameType) {
                  return ArithmeticBinaryTable.Plus(
                    left.asNumeric,
                    right.asNumeric,
                  );
                }
                return new FailCommand(
                  new InterpreterError(
                    "ArithmeticBinaryOperation",
                    `Type mismatch: ${left.getType()}, ${right.getType()}`,
                  ),
                );
              },
            );
          });
        });
      });
    }

    return this.processBinary(
      node,
      ArithmeticBinaryTable,
      (a, b) => !!a.asNumeric && !!b.asNumeric,
      "ArithmeticBinaryOperation",
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (rawOperand) => {
      return new BindCommand(this.context.forceValue(rawOperand), (operand) => {
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
      });
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
                const subEvaluator = capturedCtx.evaluatorFactory(capturedCtx);
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

    return this.processBinary(
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
          return new BindCommand(this.context.forceValue(rawRight), (right) => {
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
                  this.context.objRuntime.dispatch(left, "compare", [right]),
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
                      else if (node.operator === "LessThan") isTrue = val < 0;
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
          });
        });
      });
    });
  }

  visitLogicalBinaryOperation(node: LogicalBinaryOperation): ExecutionCommand {
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
    return this.processUnary(
      node,
      LogicalUnaryTable,
      (a) => !!a.asLogic,
      "LogicalUnaryOperation",
    );
  }

  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): ExecutionCommand {
    return this.processBinary(
      node,
      BitwiseBinaryTable,
      (a, b) => !!a.asNumeric && !!b.asNumeric,
      "BitwiseBinaryOperation",
    );
  }

  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): ExecutionCommand {
    return this.processUnary(
      node,
      BitwiseUnaryTable,
      (a) => !!a.asNumeric,
      "BitwiseUnaryOperation",
    );
  }

  visitStringOperation(node: StringOperation): ExecutionCommand {
    return this.processBinary(
      node,
      StringOperationTable,
      (a, b) => !!a.asSummable && !!b.asSummable,
      "StringOperation",
    );
  }

  visitUnifyOperation(node: UnifyOperation): ExecutionCommand {
    return this.getLogicEngine().unifyExpr(node.left, node.right);
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

  visitTupleExpr(node: TupleExpression): ExecutionCommand {
    const results: YuValue[] = [];
    const evaluateNext = (index: number): ExecutionCommand => {
      if (index >= node.elements.length)
        return new StepCommand(new YuArray(results));
      return new BindCommand(this.evaluate(node.elements[index]), (val) => {
        results.push(val);
        return evaluateNext(index + 1);
      });
    };
    return evaluateNext(0);
  }

  visitFieldExpression(node: FieldExpression): ExecutionCommand {
    return new BindCommand(this.evaluate(node.name), (obj) => {
      return new StepCommand(
        this.context.objRuntime.getField(obj, node.name.value),
      );
    });
  }

  visitDataExpr(node: DataExpression): ExecutionCommand {
    const fieldValues = new Map<string, YuValue>();

    const evaluateFields = (index: number): ExecutionCommand => {
      if (index >= node.contents.length) {
        const identifier = node.name.value;
        const classDef = new RuntimeClass(
          identifier,
          fieldValues,
          new Map(),
          [],
        );
        return new StepCommand(classDef.instantiate(identifier));
      }
      const field = node.contents[index];
      return new BindCommand(this.evaluate(field.expression), (value) => {
        fieldValues.set(field.name.value, value);
        return evaluateFields(index + 1);
      });
    };

    return evaluateFields(0);
  }

  visitConsExpr(node: ConsExpression): ExecutionCommand {
    return this.context.lazyRuntime.evaluateCons(node, this);
  }

  visitLetInExpr(node: LetInExpression): ExecutionCommand {
    const oldEnv = this.context.env;
    this.context.pushEnv();
    const envBuilder = new EnvBuilderVisitor(this.context);
    node.declarations.accept(envBuilder);
    return new BindCommand(this.evaluate(node.expression), (result) => {
      this.context.env = oldEnv;
      return new StepCommand(result);
    });
  }

  public visitGuardedExpression(expr: GuardedExpression): ExecutionCommand {
    const tryNextGuard = (guardIndex: number): ExecutionCommand => {
      if (guardIndex >= expr.guards.length) {
        return new RaiseCommand(
          new InterpreterError(
            "PatternMatch",
            "Non-exhaustive guards in equation: the pattern matched but no guard succeeded.",
          ),
        );
      }

      const guard = expr.guards[guardIndex];
      return new BindCommand(this.evaluate(guard.condition), (cond) => {
        if (!isTrue(cond)) return tryNextGuard(guardIndex + 1);
        return this.evaluate(guard.body);
      });
    };

    return tryNextGuard(0);
  }

  visitTry(node: Try): ExecutionCommand {
    const tryStartEnv = this.context.env;

    // Comando que evaluará el cuerpo del Try (ej: block.apply())
    const bodyCommand = new EvalCommand(node.body);

    // Este handler es el que el Kernel llamará cuando reciba el RaiseCommand
    const catchHandler: CatchHandler = (errorObj) => {
      this.context.env = tryStartEnv; // Restauramos entorno

      // 1. Reificamos la excepción para Wollok
      let exceptionObj: YuValue | undefined;

      if (errorObj instanceof InterpreterError) {
        const mappedErrors = this.context.dispatchHook(
          "onInterpreterError",
          errorObj,
          this.context,
        );
        exceptionObj = mappedErrors.find(
          (res: any) => res !== undefined && res !== null,
        ) as YuValue;
      }

      if (!exceptionObj) {
        if (errorObj instanceof InterpreterError) {
          exceptionObj = new YuString(errorObj.message);
        } else {
          exceptionObj = errorObj as YuValue;
        }
      }

      // 2. Buscamos si el Try tiene bloques catch
      const catches = node.catchExpr;

      if (catches.length > 0) {
        const catchBlock = catches[0];
        const pattern = catchBlock.patterns[0] as any;
        const paramName =
          pattern.name?.value ?? pattern.identifier?.value ?? String(pattern);

        // Inyectamos la variable 'e' (excepción) en el scope
        this.context.pushEnv();
        this.context.define(paramName, exceptionObj);

        // Retornamos la evaluación del catchBlock
        return new BindCommand(new EvalCommand(catchBlock.body), (catchRes) => {
          this.context.env = tryStartEnv;

          // Si había bloque finally, podrías evaluarlo acá antes del StepCommand
          if (node.finallyExpr) {
            return new BindCommand(
              new EvalCommand(node.finallyExpr),
              () => new StepCommand(catchRes),
            );
          }
          return new StepCommand(catchRes);
        });
      }

      // Si no había bloque catch (solo finally), relanzamos al Kernel superior
      if (node.finallyExpr) {
        return new BindCommand(
          new EvalCommand(node.finallyExpr),
          () => new RaiseCommand(errorObj),
        );
      }
      return new RaiseCommand(errorObj);
    };

    // Le entregamos el CatchCommand al Kernel para que lo apile ANTES de ejecutar el cuerpo
    return new CatchCommand(catchHandler, bodyCommand);
  }

  visitIf(node: If): ExecutionCommand {
    return new BindCommand(this.evaluate(node.condition), (condition) => {
      if (!(condition instanceof YuBoolean))
        return new FailCommand(
          new InterpreterError(
            "If",
            `Expected boolean in condition and got ${condition.getType()}`,
          ),
        );
      const isTrue = condition.value;
      return isTrue ? this.evaluate(node.then) : this.evaluate(node.elseExpr);
    });
  }

  visitCall(node: Call): ExecutionCommand {
    return new BindCommand(this.evaluate(node.callee), (callee) => {
      const args: YuValue[] = [];
      const evaluateArgs = (index: number): ExecutionCommand => {
        if (index < node.args.length)
          return new BindCommand(this.evaluate(node.args[index]), (val) => {
            args.push(val);
            return evaluateArgs(index + 1);
          });

        if (!(callee instanceof RuntimeFunction))
          return new FailCommand(
            new InterpreterError("Call", "Target is not a function"),
          );

        return this.context.funcRuntime.apply(callee, args);
      };
      return evaluateArgs(0);
    });
  }

  visitOtherwise(node: Otherwise): ExecutionCommand {
    return boolean(true);
  }

  visitCompositionExpression(node: CompositionExpression): ExecutionCommand {
    return new BindCommand(this.evaluate(node.left), (f) => {
      return new BindCommand(this.evaluate(node.right), (g) => {
        if (
          !(f instanceof RuntimeFunction) ||
          !(g instanceof RuntimeFunction)
        ) {
          return new FailCommand(
            new InterpreterError(
              "Composition",
              "Both operands of (.) must be functions",
            ),
          );
        }

        const F_REF = "__internal_f";
        const G_REF = "__internal_g";
        const PARAM_NAME = "__x";

        const compositionBody = new Application(
          new SymbolPrimitive(F_REF),
          new Application(
            new SymbolPrimitive(G_REF),
            new SymbolPrimitive(PARAM_NAME),
          ),
        );

        const patterns = [new VariablePattern(new SymbolPrimitive(PARAM_NAME))];
        const equation: EquationRuntime = {
          patterns,
          body: new UnguardedBody(new Sequence([new Return(compositionBody)])),
        };

        const privateScope = new Map<string, YuValue>();
        privateScope.set(F_REF, f);
        privateScope.set(G_REF, g);

        const capturedEnv: EnvStack = {
          head: privateScope,
          tail: this.context.env,
        };
        const func = new RuntimeFunction(
          1,
          [equation],
          `<(${f.identifier} . ${g.identifier})>`,
          [],
          capturedEnv,
        );
        return new StepCommand(func);
      });
    });
  }

  visitLambda(node: Lambda): ExecutionCommand {
    const patterns = node.parameters;
    const equation: EquationRuntime = {
      patterns,
      body: new UnguardedBody(new Sequence([new Return(node.body)])),
    };
    const func = new RuntimeFunction(
      patterns.length,
      [equation],
      "<lambda>",
      [],
      this.context.env,
    );
    return new StepCommand(func);
  }

  visitApplication(node: Application): ExecutionCommand {
    const { funcRuntime } = this.context;
    return new BindCommand(this.evaluate(node.functionExpr), (func) => {
      if (!(func instanceof RuntimeFunction)) {
        return new FailCommand(
          new InterpreterError("Application", "Cannot apply non-function"),
        );
      }

      const applyFuncToNode = (func: RuntimeFunction): ExecutionCommand =>
        new BindCommand(this.evaluate(node.parameter), (arg) => {
          return funcRuntime.applyArguments(func, [() => arg]);
        });

      if (func.arity === 0) {
        return new BindCommand(
          funcRuntime.applyArguments(func),
          (resultOfFunc) => {
            if (!(resultOfFunc instanceof RuntimeFunction))
              return new FailCommand(
                new InterpreterError(
                  "Application",
                  "Cannot apply non-function result of arity-0 function",
                ),
              );
            return applyFuncToNode(resultOfFunc);
          },
        );
      }

      return applyFuncToNode(func);
    });
  }

  visitQuery(node: Query): ExecutionCommand {
    return this.getLogicEngine().solveQuery(node);
  }

  visitExist(node: Exist): ExecutionCommand {
    return this.getLogicEngine().solveGoalLike(node);
  }

  visitNot(node: Not): ExecutionCommand {
    return this.getLogicEngine().solveNot(node);
  }

  visitFindall(node: Findall): ExecutionCommand {
    return this.getLogicEngine().solveFindall(node);
  }

  visitForall(node: Forall): ExecutionCommand {
    return this.getLogicEngine().solveForall(node);
  }

  visitGoal(node: Goal): ExecutionCommand {
    return this.getLogicEngine().solveGoalLike(node);
  }

  visitLogicConstraint(node: LogicConstraint): ExecutionCommand {
    return new BindCommand(this.evaluate(node.expression), (val) => {
      if (isTrue(val))
        return new StepCommand(
          new LogicResult([new LogicAnswer(true, new Map())]),
        );
      return new BacktrackCommand();
    });
  }

  visitSuper(node: Super): ExecutionCommand {
    let methodName: YuString;
    try {
      methodName = this.context.lookup("__METHOD_NAME__") as YuString;
    } catch (e) {
      return new FailCommand(
        new InterpreterError(
          "Super",
          "'super' keyword used outside of a method context",
        ),
      );
    }

    const args: YuValue[] = [];
    const evaluateNextArg = (index: number): ExecutionCommand => {
      if (index >= node.args.length) {
        return this.context.objRuntime.dispatchSuper(methodName.toJSON(), args);
      }
      return new BindCommand(this.evaluate(node.args[index]), (val) => {
        args.push(val);
        return evaluateNextArg(index + 1);
      });
    };
    return evaluateNextArg(0);
  }

  visitSend(node: Send): ExecutionCommand {
    if (node.receiver instanceof Super) {
      const methodName = node.selector.value;
      const args: YuValue[] = [];
      const evaluateNextArg = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          try {
            return this.context.objRuntime.dispatchSuper(methodName, args);
          } catch (error: any) {
            if (error instanceof InterpreterError) {
              const mappedErrors = this.context.dispatchHook(
                "onInterpreterError",
                error,
                this.context,
              );
              const userException = mappedErrors.find(
                (res: any) => res !== undefined && res !== null,
              );
              return new RaiseCommand((userException as any) || error);
            }
            return new RaiseCommand(
              new InterpreterError("RuntimeError", String(error)),
            );
          }
        }
        return new BindCommand(this.evaluate(node.args[index]), (val) => {
          args.push(val);
          return evaluateNextArg(index + 1);
        });
      };
      return evaluateNextArg(0);
    }

    return new BindCommand(this.evaluate(node.receiver), (receiver) => {
      const methodName = node.selector.value;
      const args: YuValue[] = [];
      const evaluateNextArg = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          try {
            return this.context.objRuntime.dispatch(receiver, methodName, args);
          } catch (error: any) {
            if (error instanceof InterpreterError) {
              const mappedErrors = this.context.dispatchHook(
                "onInterpreterError",
                error,
                this.context,
              );
              const userException = mappedErrors.find(
                (res) => res !== undefined && res !== null,
              );
              return new RaiseCommand((userException as any) || error);
            }
            return new RaiseCommand(
              new InterpreterError("RuntimeError", String(error)),
            );
          }
        }
        return new BindCommand(this.evaluate(node.args[index]), (val) => {
          args.push(val);
          return evaluateNextArg(index + 1);
        });
      };
      return evaluateNextArg(0);
    });
  }

  visitNew(node: New): ExecutionCommand {
    const className = node.identifier.value;
    const classDef = this.context.lookup(className);
    if (!(classDef instanceof RuntimeClass))
      return new FailCommand(
        new InterpreterError("New", `${className} is not a class.`),
      );

    const instance = classDef.instantiate(node.identifier.value);
    instance.fields = this.getClassFields(classDef);

    const evaluateArgs = (index: number): ExecutionCommand => {
      if (index >= node.args.length) {
        return new StepCommand(instance);
      }
      const arg = node.args[index];
      if (
        arg instanceof NamedArgument ||
        arg.constructor.name === "NamedArgument"
      ) {
        const fieldName = (arg as any).identifier.value;
        return new BindCommand(
          this.evaluate((arg as any).expression),
          (val) => {
            instance.setField(fieldName, val);
            return evaluateArgs(index + 1);
          },
        );
      }
      return evaluateArgs(index + 1);
    };

    const initializers = this.getClassInitializers(classDef);
    const initializerKeys = Array.from(initializers.keys());

    const evaluateInitializers = (keyIndex: number): ExecutionCommand => {
      if (keyIndex >= initializerKeys.length) {
        return evaluateArgs(0);
      }
      const key = initializerKeys[keyIndex];
      const expr = initializers.get(key);
      return new BindCommand(this.evaluate(expr), (val) => {
        instance.setField(key, val);
        return evaluateInitializers(keyIndex + 1);
      });
    };

    return evaluateInitializers(0);
  }

  visitSelf(node: Self): ExecutionCommand {
    try {
      return new StepCommand(this.context.lookup("self"));
    } catch {
      return new FailCommand(
        new InterpreterError("Self", "'self' is not defined in this context"),
      );
    }
  }

  visitListComprehension(node: ListComprehension): ExecutionCommand {
    const results: YuValue[] = [];

    const process = (index: number): ExecutionCommand => {
      if (index >= node.generators.length) {
        return new BindCommand(this.evaluate(node.projection), (proj) => {
          results.push(proj);
          return new StepCommand(new YuArray(results));
        });
      }

      const current = node.generators[index];

      if (current instanceof YuGenerator) {
        return new BindCommand(
          this.evaluate(current.expression),
          (exprResult) => {
            return new BindCommand(
              this.context.lazyRuntime.realizeList(exprResult),
              (sourceListVal) => {
                const sourceList = sourceListVal.asSequence;
                if (!(sourceList instanceof YuArray))
                  return raise(
                    error(
                      "visitListComprehension",
                      `Error expected YuArray and got ${sourceListVal.getType()}`,
                    ),
                  );
                const iterateSource = (
                  sourceIndex: number,
                ): ExecutionCommand => {
                  if (sourceIndex >= sourceList.items.length)
                    return new StepCommand(new YuArray(results));

                  const item = sourceList.at(sourceIndex);
                  const varName = current.variable.value;
                  this.context.define(varName, item);

                  return process(index + 1);
                };
                return iterateSource(0);
              },
            );
          },
        );
      } else {
        return new BindCommand(
          this.evaluate(current as Expression),
          (condition) => {
            return isTrue(condition)
              ? process(index + 1)
              : new StepCommand(new YuArray(results));
          },
        );
      }
    };

    this.context.pushEnv();
    return process(0);
  }

  visitTypeCast(node: TypeCast): ExecutionCommand {
    return node.expression.accept(this);
  }

  visitGenerator(node: YuGenerator): ExecutionCommand {
    return this.evaluate(node.expression);
  }

  visitRaise(node: Raise): ExecutionCommand {
    return new BindCommand(this.evaluate(node.body), (msg) => {
      if (msg instanceof RuntimeObject) return new RaiseCommand(msg);

      const msgStr = msg.toJSON();
      if (typeof msgStr !== "string") {
        return new RaiseCommand(new InterpreterError("Raise", msg.toString()));
      }
      return new RaiseCommand(new InterpreterError("Raise", msgStr));
    });
  }

  visitRangeExpression(node: RangeExpression): ExecutionCommand {
    return this.context.lazyRuntime.evaluateRange(node, this);
  }

  visit(node: Expression): ExecutionCommand {
    return node.accept<ExecutionCommand>(this);
  }

  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new UnexpectedNode(node.constructor.name, "InterpreterVisitor"),
    );
  }
  public realizeList(val: YuValue): ExecutionCommand {
    return this.context.lazyRuntime.realizeList(val);
  }

  private processBinary<T extends YuValue>(
    node: BinaryOperation,
    table: BinaryTable<T>,
    typeGuard: (a: YuValue, b: YuValue) => boolean,
    contextName: string,
  ): ExecutionCommand {
    return new BindCommand(this.evaluate(node.left), (rawLeft) => {
      return new BindCommand(this.context.forceValue(rawLeft), (left) => {
        return new BindCommand(this.evaluate(node.right), (rawRight) => {
          return new BindCommand(this.context.forceValue(rawRight), (right) => {
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
          });
        });
      });
    });
  }

  private processUnary<T extends YuValue>(
    node: UnaryOperation,
    table: UnaryTable<T>,
    typeGuard: (a: YuValue) => boolean,
    contextName: string,
  ): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (rawOperand) => {
      return new BindCommand(this.context.forceValue(rawOperand), (operand) => {
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
      });
    });
  }

  private getClassFields(classDef: RuntimeClass): Map<string, YuValue> {
    const fields = new Map<string, YuValue>();
    const collect = (c: RuntimeClass) => {
      if (c.superclass) {
        const superDef = this.context.lookup(c.superclass);
        if (superDef && superDef instanceof RuntimeClass) {
          collect(superDef);
        }
      }
      for (const mixin of c.mixins) {
        const mixinDef = this.context.lookup(mixin);
        if (mixinDef && mixinDef instanceof RuntimeClass) {
          collect(mixinDef);
        }
      }
      for (const [k, v] of c.fields.entries()) {
        fields.set(k, v);
      }
    };
    collect(classDef);
    return fields;
  }

  private getClassInitializers(classDef: RuntimeClass): Map<string, any> {
    const initializers = new Map<string, any>();
    const collect = (c: RuntimeClass) => {
      if (c.superclass) {
        const superDef = this.context.lookup(c.superclass);
        if (superDef && superDef instanceof RuntimeClass) {
          collect(superDef);
        }
      }
      for (const mixin of c.mixins) {
        const mixinDef = this.context.lookup(mixin);
        if (mixinDef && mixinDef instanceof RuntimeClass) {
          collect(mixinDef);
        }
      }
      const cInitializers = c.fieldInitializers;
      if (cInitializers) {
        for (const [k, v] of cInitializers.entries()) {
          initializers.set(k, v);
        }
      }
    };
    collect(classDef);
    return initializers;
  }

  private getLogicEngine(): LogicEngine {
    return new LogicEngine(this, this.context);
  }

  static evaluateLiteral(node: ASTNode, ctx?: RuntimeContext): YuValue {
    const targetCtx = ctx ?? new RuntimeContext();
    const visitor = new InterpreterVisitor(targetCtx);
    const kernel = new YukigoKernel(visitor);
    return kernel.run(new EvalCommand(node));
  }
}
