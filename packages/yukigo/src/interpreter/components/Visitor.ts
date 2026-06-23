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
  LogicConstraint,
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
import { boolean, Environment, EnvStack, Evaluator } from "../utils.js";
import { LogicEngine } from "./logic/LogicEngine.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { EnvBuilderVisitor } from "./EnvBuilder.js";
import { TestRunner } from "./TestRunner.js";
import { RuntimeContext } from "./RuntimeContext.js";
import {
  BacktrackCommand,
  BindCommand,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
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
  constructor(private context: RuntimeContext) {
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

  visitAssert(node: Assert): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitAssert(node);
  }

  visitTest(node: Test): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitTest(node);
  }

  visitTestGroup(node: TestGroup): ExecutionCommand {
    return new TestRunner(this, this.context.lazyRuntime).visitTestGroup(node);
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
      const val = this.context.lookup(node.value);
      if (val instanceof RuntimeFunction && val.arity === 0) {
        return this.context.funcRuntime.apply(val, []);
      }
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
    return this.processBinary(
      node,
      ArithmeticBinaryTable,
      (a, b) => !!a.asNumeric && !!b.asNumeric,
      "ArithmeticBinaryOperation",
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (operand) => {
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
          const seq = arr.asSequence
          if(!seq) throw new InterpreterError(`[${node.operator}]`, `Expected ${arr} to be a YuSequence.`)
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
  }

  visitListBinaryOperation(node: ListBinaryOperation): ExecutionCommand {
    if (node.operator === "Concat") {
      const capturedCtx = this.context.clone();
      return new BindCommand(this.evaluate(node.left), (left) => {
        const seqL = left.asSequence as YuSequence;
        if (!seqL) throw new Error("Invalid left operand for lazy Concat");

        if (this.context.config.lazyLoading) {
          const lazyRight = new LazyList(
            () => {
              if (!capturedCtx.evaluatorFactory)
                throw new Error(
                  "EvaluatorFactory not initialized in RuntimeContext",
                );
              const subEvaluator = capturedCtx.evaluatorFactory(capturedCtx);
              const subKernel = new YukigoKernel(subEvaluator);
              const right = subKernel.run(new EvalCommand(node.right));
              const seqR = right.asSequence as YuSequence;
              if (!seqR)
                throw new Error("Invalid right operand for lazy Concat");
              return seqR.step();
            },
            "LazyRight",
            capturedCtx,
          );
          return this.context.lazyRuntime.evaluateConcat(seqL, lazyRight);
        }

        return new BindCommand(this.evaluate(node.right), (right) => {
          const seqR = right.asSequence as YuSequence;
          if (!seqR) throw new Error("Invalid right operand for lazy Concat");
          return seqL.concat(seqR);
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
    if (node.operator === "Equal" || node.operator === "NotEqual") {
      return new BindCommand(
        this.evaluate(node.left),
        (left) =>
          new BindCommand(
            this.evaluate(node.right),
            (right) =>
              new BindCommand(EqualityComparer.compare(left, right), (eq) => {
                const isEq = eq.asLogic?.and(() => new StepCommand(eq)); // simple check
                return new StepCommand(
                  new YuBoolean(node.operator === "Equal" ? !!isEq : !isEq),
                );
              }),
          ),
      );
    }

    return this.processBinary(
      node,
      ComparisonOperationTable,
      () => true,
      "ComparisonOperation",
    );
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

      return fn(logicValue, () => {
        const subKernel = new YukigoKernel(this);
        return subKernel.run(new EvalCommand(node.right));
      });
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
      throw new InterpreterError(
        "AssignOperation",
        `Cannot perform assignment operation: mutability is disabled`,
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
      const isTrue = val instanceof YuBoolean && val.value;
      if (isTrue)
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
          return this.context.objRuntime.dispatchSuper(methodName, args);
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
          return this.context.objRuntime.dispatch(receiver, methodName, args);
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

    return new StepCommand(classDef.instantiate(node.identifier.value));
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
                  throw new InterpreterError(
                    "visitListComprehension",
                    `Error expected YuArray and got ${sourceListVal.getType()}`,
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
            const isTrue = condition instanceof YuBoolean && condition.value;
            return isTrue
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
      const msgStr = msg.toJSON();
      if (typeof msgStr !== "string")
        return new FailCommand(
          new InterpreterError(
            "Raise",
            `Expected string but got ${msg.getType()}`,
          ),
        );
      return new FailCommand(new InterpreterError("Raise", msgStr));
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
    return new BindCommand(this.evaluate(node.left), (left) => {
      return new BindCommand(this.evaluate(node.right), (right) => {
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
            new InterpreterError(contextName, `Unknown op: ${node.operator}`),
          );
        }

        try {
          return fn(left as T, right as T);
        } catch (e) {
          return new FailCommand(e as Error);
        }
      });
    });
  }

  private processUnary<T extends YuValue>(
    node: UnaryOperation,
    table: UnaryTable<T>,
    typeGuard: (a: YuValue) => boolean,
    contextName: string,
  ): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (operand) => {
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
  }

  private getLogicEngine(): LogicEngine {
    return new LogicEngine(this, this.context);
  }

  static evaluateLiteral(node: ASTNode): YuValue {
    const ctx = new RuntimeContext();
    const visitor = new InterpreterVisitor(ctx);
    const kernel = new YukigoKernel(visitor);
    return kernel.run(new EvalCommand(node));
  }
}
