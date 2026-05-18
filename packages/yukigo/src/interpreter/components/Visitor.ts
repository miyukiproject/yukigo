import { YukigoKernel } from "./kernel/index.js";
import {
  Visitor,
  PrimitiveValue,
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
  EquationRuntime,
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
  Implement,
  Self,
  ListComprehension,
  RangeExpression,
  RuntimeFunction,
  Generator as YuGenerator,
  BinaryOperation,
  UnaryOperation,
  ASTNode,
  Raise,
  Query,
  TypeCast,
  isRuntimeObject,
  isRuntimeClass,
  isRuntimePredicate,
  Super,
  EnvStack,
  Environment,
  If,
  isRuntimeFunction,
  Assert,
  Test,
  TestGroup,
  LogicConstraint,
  isLazyList,
} from "yukigo-ast";
import {
  ArithmeticBinaryTable,
  ArithmeticUnaryTable,
  BitwiseBinaryTable,
  BitwiseUnaryTable,
  ComparisonOperationTable,
  ListBinaryTable,
  ListUnaryTable,
  LogicalBinaryTable,
  LogicalUnaryTable,
  StringOperationTable,
} from "./Operations.js";
import { Evaluator } from "../utils.js";
import { LogicEngine } from "./logic/LogicEngine.js";
import { ErrorFrame, InterpreterError, UnexpectedValue, UnexpectedNode } from "../errors.js";
import { EnvBuilderVisitor } from "./EnvBuilder.js";
import { FailedAssert, TestRunner } from "./TestRunner.js";
import { RuntimeContext } from "./RuntimeContext.js";
import {
  BindCommand,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
  StepCommand,
} from "./kernel/commands.js";

export class InterpreterVisitor implements Evaluator {
  constructor(private context: RuntimeContext) {}

  getContext(): RuntimeContext {
    return this.context;
  }

  evaluate(node: ASTNode): ExecutionCommand {
    return node.accept(this);
  }

  visitSequence(node: Sequence): ExecutionCommand {
    if (node.statements.length === 0) return new StepCommand(undefined);

    const evaluateNext = (
      index: number,
      lastResult: PrimitiveValue,
    ): ExecutionCommand => {
      if (index >= node.statements.length) return new StepCommand(lastResult);

      const stmt = node.statements[index];
      return new BindCommand(this.evaluate(stmt), (result) => {
        if (stmt instanceof Return) return new StepCommand(result);
        return evaluateNext(index + 1, result);
      });
    };

    return evaluateNext(0, undefined);
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
    return new StepCommand(node.value);
  }

  visitBooleanPrimitive(node: BooleanPrimitive): ExecutionCommand {
    return new StepCommand(node.value);
  }

  visitStringPrimitive(node: StringPrimitive): ExecutionCommand {
    return new StepCommand(node.value);
  }

  visitListPrimitive(node: ListPrimitive): ExecutionCommand {
    if (node.value.length === 0) return new StepCommand([]);

    const results: PrimitiveValue[] = [];
    const evaluateNext = (index: number): ExecutionCommand => {
      if (index >= node.value.length) return new StepCommand(results);

      return new BindCommand(this.evaluate(node.value[index]), (val) => {
        results.push(val);
        return evaluateNext(index + 1);
      });
    };

    return evaluateNext(0);
  }

  visitNilPrimitive(node: NilPrimitive): ExecutionCommand {
    return new StepCommand(node.value);
  }

  visitCharPrimitive(node: CharPrimitive): ExecutionCommand {
    return new StepCommand(node.value);
  }

  visitSymbolPrimitive(node: SymbolPrimitive): ExecutionCommand {
    try {
      const val = this.context.lookup(node.value);
      if (isRuntimeFunction(val) && val.arity === 0) {
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
      return new StepCommand(true);
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
          if (isRuntimeObject(self) && self.fields.has(name))
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
      (a: number) => !Number.isNaN(a),
      "ArithmeticUnaryOperation",
    );
  }

  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation,
  ): ExecutionCommand {
    return this.processBinary(
      node,
      ArithmeticBinaryTable,
      (a, b) => typeof a === "number" && typeof b === "number",
      "ArithmeticBinaryOperation",
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (operand) => {
      if (
        typeof operand !== "string" &&
        !Array.isArray(operand) &&
        !isLazyList(operand)
      )
        return new FailCommand(
          new InterpreterError(
            "ListUnaryOperation",
            `Expected Array, String or LazyList but got ${typeof operand}`,
          ),
        );

      return new BindCommand(
        this.context.lazyRuntime.realizeList(operand),
        (arr) => {
          const fn = ListUnaryTable[node.operator];
          if (!fn)
            return new FailCommand(
              new InterpreterError(
                "ListUnaryOperation",
                `Unknown operator: ${node.operator}`,
              ),
            );
          if (!Array.isArray(arr))
            return new FailCommand(
              new InterpreterError(
                "ListUnaryOperation",
                "realizeList did not return an array",
              ),
            );
          return new StepCommand(fn(arr));
        },
      );
    });
  }

  visitListBinaryOperation(node: ListBinaryOperation): ExecutionCommand {
    if (node.operator === "Concat") {
      if (this.context.config.lazyLoading) {
        return this.context.lazyRuntime.evaluateConcatLazy(node, this);
      }
      return new BindCommand(this.evaluate(node.left), (left) => {
        return new BindCommand(this.evaluate(node.right), (right) => {
          return this.context.lazyRuntime.evaluateConcat(left, right);
        });
      });
    }

    return this.processBinary(
      node,
      ListBinaryTable,
      (a, b) =>
        (Array.isArray(a) || typeof a === "string" || isLazyList(a)) &&
        (Array.isArray(b) || typeof b === "string" || isLazyList(b)),
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
              new BindCommand(
                this.context.lazyRuntime.deepEqual(left, right),
                (eq) => new StepCommand(node.operator === "Equal" ? eq : !eq),
              ),
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
      if (typeof left !== "boolean")
        return new FailCommand(
          new InterpreterError(
            "LogicalBinaryOperation",
            `Expected left side to be boolean and got: ${left}`,
          ),
        );

      const fn = LogicalBinaryTable[node.operator];
      if (!fn)
        return new FailCommand(
          new InterpreterError(
            "LogicalBinaryOperation",
            `Unknown operator '${node.operator}'`,
          ),
        );

      if (this.context.config.lazyLoading) {
        if (node.operator === "And" && left === false)
          return new StepCommand(false);
        if (node.operator === "Or" && left === true)
          return new StepCommand(true);
      }

      return new BindCommand(this.evaluate(node.right), (right) => {
        if (typeof right !== "boolean")
          return new FailCommand(
            new InterpreterError(
              "LogicalBinaryOperation",
              `Expected right side to be boolean and got: ${right}`,
            ),
          );
        return new StepCommand(fn(left, () => right));
      });
    });
  }

  visitLogicalUnaryOperation(node: LogicalUnaryOperation): ExecutionCommand {
    return this.processUnary(
      node,
      LogicalUnaryTable,
      (a) => typeof a === "boolean",
      "LogicalUnaryOperation",
    );
  }

  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): ExecutionCommand {
    return this.processBinary(
      node,
      BitwiseBinaryTable,
      (a, b) => !Number.isNaN(a) && !Number.isNaN(b),
      "BitwiseBinaryOperation",
    );
  }

  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): ExecutionCommand {
    return this.processUnary(
      node,
      BitwiseUnaryTable,
      (a) => !Number.isNaN(a),
      "BitwiseUnaryOperation",
    );
  }

  visitStringOperation(node: StringOperation): ExecutionCommand {
    return this.processBinary(
      node,
      StringOperationTable,
      (a, b) => typeof a === "string" || typeof b === "string",
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
          if (isRuntimeObject(self) && self.fields.has(name)) {
            self.fields.set(name, value);
          }
        }
      };

      if (!this.context.replace(name, value, onReplace)) {
        this.context.define(name, value);
      }

      return new StepCommand(true);
    });
  }

  visitTupleExpr(node: TupleExpression): ExecutionCommand {
    const results: PrimitiveValue[] = [];
    const evaluateNext = (index: number): ExecutionCommand => {
      if (index >= node.elements.length) return new StepCommand(results);
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
    const fieldValues = new Map<string, PrimitiveValue>();

    const evaluateFields = (index: number): ExecutionCommand => {
      if (index >= node.contents.length) {
        return new StepCommand(
          this.context.objRuntime.instantiate(
            node.name.value,
            node.name.value,
            fieldValues,
            new Map(),
          ),
        );
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
      if (typeof condition !== "boolean")
        return new FailCommand(
          new InterpreterError("If", `Expected boolean in condition and got ${typeof condition}`),
        );
      return condition
        ? this.evaluate(node.then)
        : this.evaluate(node.elseExpr);
    });
  }

  visitCall(node: Call): ExecutionCommand {
    return new BindCommand(this.evaluate(node.callee), (callee) => {
      const args: PrimitiveValue[] = [];
      const evaluateArgs = (index: number): ExecutionCommand => {
        if (index < node.args.length)
          return new BindCommand(this.evaluate(node.args[index]), (val) => {
            args.push(val);
            return evaluateArgs(index + 1);
          });

        if (!isRuntimeFunction(callee))
          return new FailCommand(new InterpreterError("Call", "Target is not a function"));

        return this.context.funcRuntime.apply(callee, args);
      };
      return evaluateArgs(0);
    });
  }

  visitOtherwise(node: Otherwise): ExecutionCommand {
    return new StepCommand(true);
  }

  visitCompositionExpression(node: CompositionExpression): ExecutionCommand {
    return new BindCommand(this.evaluate(node.left), (f) => {
      return new BindCommand(this.evaluate(node.right), (g) => {
        if (!isRuntimeFunction(f) || !isRuntimeFunction(g)) {
          return new FailCommand(
            new InterpreterError("Composition", "Both operands of (.) must be functions"),
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

        const privateScope = new Map<string, PrimitiveValue>();
        privateScope.set(F_REF, f);
        privateScope.set(G_REF, g);

        const capturedEnv: EnvStack = {
          head: privateScope,
          tail: this.context.env,
        };
        return new StepCommand({
          type: "Function",
          arity: 1,
          identifier: `<(${f.identifier} . ${g.identifier})>`,
          equations: [equation],
          pendingArgs: [],
          closure: capturedEnv,
        });
      });
    });
  }

  visitLambda(node: Lambda): ExecutionCommand {
    const patterns = node.parameters;
    const equation: EquationRuntime = {
      patterns,
      body: new UnguardedBody(new Sequence([new Return(node.body)])),
    };
    return new StepCommand({
      type: "Function",
      arity: patterns.length,
      equations: [equation],
      pendingArgs: [],
      identifier: "<lambda>",
      closure: this.context.env,
    });
  }

  visitApplication(node: Application): ExecutionCommand {
    const { funcRuntime } = this.context;
    return new BindCommand(this.evaluate(node.functionExpr), (func) => {
      if (!isRuntimeFunction(func))
        return new FailCommand(
          new InterpreterError("Application", "Cannot apply non-function"),
        );

      const applyFuncToNode = (func: RuntimeFunction): ExecutionCommand =>
        new BindCommand(this.evaluate(node.parameter), (arg) => {
          const argThunk = () => arg;
          const allPendingArgs = func.pendingArgs
            ? [...func.pendingArgs, argThunk]
            : [argThunk];
          // We need applyArguments to return ExecutionCommand too.
          return funcRuntime.applyArguments(func, allPendingArgs);
        });

      if (func.arity === 0) {
        return new BindCommand(
          funcRuntime.applyArguments(func, []),
          (resultOfFunc) => {
            if (!isRuntimeFunction(resultOfFunc))
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
    return this.getLogicEngine().solveExist(node);
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
    return this.getLogicEngine().solveGoal(node);
  }

  visitLogicConstraint(node: LogicConstraint): ExecutionCommand {
    return new BindCommand(this.evaluate(node.expression), (val) => {
      const success = Array.isArray(val) ? val.length > 0 : !!val;
      if (success) return new StepCommand({ success: true });
      return new FailCommand(new InterpreterError("Logic", "Constraint failed"), true);
    });
  }

  visitSuper(node: Super): ExecutionCommand {
    let methodName: string;
    try {
      methodName = this.context.lookup("__METHOD_NAME__") as string;
    } catch (e) {
      return new FailCommand(
        new InterpreterError("Super", "'super' keyword used outside of a method context"),
      );
    }

    const args: PrimitiveValue[] = [];
    const evaluateNextArg = (index: number): ExecutionCommand => {
      if (index >= node.args.length) {
        return this.context.objRuntime.dispatchSuper(
          this.context.env,
          methodName,
          args,
        );
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
      const args: PrimitiveValue[] = [];
      const evaluateNextArg = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          return this.context.objRuntime.dispatchSuper(
            this.context.env,
            methodName,
            args,
          );
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
      const args: PrimitiveValue[] = [];
      const evaluateNextArg = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          return this.context.objRuntime.dispatch(
            receiver,
            methodName,
            args,
            this.context.env,
          );
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
    if (!isRuntimeClass(classDef))
      return new FailCommand(new InterpreterError("New", `${className} is not a class.`));

    return new StepCommand(
      this.context.objRuntime.instantiate(
        className,
        node.identifier.value,
        classDef.fields,
        classDef.methods,
      ),
    );
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
    const results: PrimitiveValue[] = [];

    const process = (index: number): ExecutionCommand => {
      if (index >= node.generators.length) {
        return new BindCommand(this.evaluate(node.projection), (proj) => {
          results.push(proj);
          return new StepCommand(results);
        });
      }

      const current = node.generators[index];

      if (current instanceof YuGenerator) {
        return new BindCommand(
          this.evaluate(current.expression),
          (exprResult) => {
            return new BindCommand(
              this.context.lazyRuntime.realizeList(exprResult),
              (sourceList) => {
                const iterateSource = (
                  sourceIndex: number,
                ): ExecutionCommand => {
                  if (sourceIndex >= (sourceList as any[]).length)
                    return new StepCommand(results);

                  const item = (sourceList as any[])[sourceIndex];
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
            return condition === true
              ? process(index + 1)
              : new StepCommand(results);
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
      if (typeof msg !== "string")
        return new FailCommand(
          new InterpreterError("Raise", `Expected string but got ${typeof msg}`),
        );
      return new FailCommand(new InterpreterError("Raise", msg));
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
  public realizeList(val: PrimitiveValue): ExecutionCommand {
    return this.context.lazyRuntime.realizeList(val);
  }

  private processBinary(
    node: BinaryOperation,
    table: Record<string, any>,
    typeGuard: (a: any, b: any) => boolean,
    contextName: string,
  ): ExecutionCommand {
    return new BindCommand(this.evaluate(node.left), (left) => {
      return new BindCommand(this.evaluate(node.right), (right) => {
        if (!typeGuard(left, right)) {
          return new FailCommand(
            new InterpreterError(contextName, `Type mismatch: ${left}, ${right}`),
          );
        }

        const fn = table[node.operator];
        if (!fn) {
          return new FailCommand(
            new InterpreterError(contextName, `Unknown op: ${node.operator}`),
          );
        }

        return new StepCommand(fn(left, right));
      });
    });
  }

  private processUnary(
    node: UnaryOperation,
    table: any,
    typeGuard: (a: any) => boolean,
    contextName: string,
  ): ExecutionCommand {
    return new BindCommand(this.evaluate(node.operand), (operand) => {
      if (!typeGuard(operand))
        return new FailCommand(
          new InterpreterError(contextName, `Type mismatch: ${operand}`),
        );

      const fn = table[node.operator];
      if (!fn)
        return new FailCommand(
          new InterpreterError(contextName, `Unknown op: ${node.operator}`),
        );

      return new StepCommand(fn(operand));
    });
  }

  private getLogicEngine(): LogicEngine {
    return new LogicEngine(this, this.context);
  }

  static evaluateLiteral(node: ASTNode): PrimitiveValue {
    const ctx = new RuntimeContext();
    const visitor = new InterpreterVisitor(ctx);
    const kernel = new YukigoKernel(visitor);
    return kernel.run(new EvalCommand(node));
  }
}
