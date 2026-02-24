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
  isRuntimeObject,
  isRuntimeClass,
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
import {
  createGlobalEnv,
  define,
  ExpressionEvaluator,
  lookup,
  pushEnv,
  replace,
} from "../utils.js";
import { LogicEngine } from "./logic/LogicEngine.js";
import { ErrorFrame, InterpreterError, UnexpectedValue } from "../errors.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { FunctionRuntime } from "./runtimes/FunctionRuntime.js";
import { ObjectRuntime } from "./runtimes/ObjectRuntime.js";
import { EnvBuilderVisitor } from "./EnvBuilder.js";
import { FailedAssert, TestRunner } from "./TestRunner.js";
import {
  Continuation,
  CPSThunk,
  idContinuation,
  Thunk,
  trampoline,
  valueToCPS,
} from "../trampoline.js";
import { RuntimeContext } from "./RuntimeContext.js";

export class InterpreterVisitor
  implements Visitor<CPSThunk<PrimitiveValue>>, ExpressionEvaluator
{
  constructor(
    private env: EnvStack,
    private context: RuntimeContext,
    private frames: ErrorFrame[] = [],
  ) {}

  evaluate<R = PrimitiveValue>(
    node: ASTNode,
    cont: Continuation<PrimitiveValue, R>,
  ): Thunk<R> {
    return () => {
      try {
        const cpsThunk = node.accept(this);
        return cpsThunk(cont);
      } catch (err) {
        if (err instanceof InterpreterError || err instanceof FailedAssert) {
          if (err instanceof InterpreterError) {
            err.pushFrame({ nodeType: node.constructor.name, loc: node.loc });
          }
          throw err;
        }
        throw new InterpreterError(
          node.constructor.name,
          (err as Error).message,
          [...this.frames, { nodeType: node.constructor.name, loc: node.loc }],
        );
      }
    };
  }

  visitSequence(node: Sequence): CPSThunk<PrimitiveValue> {
    return (k) => {
      if (node.statements.length === 0) return k(undefined);

      if (this.context.config.debug)
        console.log(
          `[Interpreter] Entering sequence with ${node.statements.length} statements`,
        );

      const evaluateNext = (
        index: number,
        lastResult: PrimitiveValue,
      ): Thunk<PrimitiveValue> => {
        if (index >= node.statements.length) return k(lastResult);
        const stmt = node.statements[index];

        return this.evaluate(stmt, (result) => {
          if (stmt instanceof Return) return k(result);
          return () => evaluateNext(index + 1, result);
        });
      };

      return evaluateNext(0, undefined);
    };
  }

  visitAssert(node: Assert): CPSThunk<PrimitiveValue> {
    if (this.context.config.debug) {
      console.log(`[Interpreter] Visiting Assert`);
    }
    return (k) =>
      new TestRunner(this, this.context.lazyRuntime).visitAssert(node)((val) =>
        k(val),
      );
  }

  visitTest(node: Test): CPSThunk<PrimitiveValue> {
    if (this.context.config.debug) {
      console.log(`[Interpreter] Visiting Test`);
    }
    return (k) =>
      new TestRunner(this, this.context.lazyRuntime).visitTest(node)((val) =>
        k(val),
      );
  }

  visitTestGroup(node: TestGroup): CPSThunk<PrimitiveValue> {
    if (this.context.config.debug) {
      console.log(`[Interpreter] Visiting TestGroup`);
    }
    return (k) =>
      new TestRunner(this, this.context.lazyRuntime).visitTestGroup(node)(
        (val) => k(val),
      );
  }

  visitNumberPrimitive(node: NumberPrimitive): CPSThunk<PrimitiveValue> {
    return valueToCPS(node.value);
  }

  visitBooleanPrimitive(node: BooleanPrimitive): CPSThunk<PrimitiveValue> {
    return valueToCPS(node.value);
  }

  visitStringPrimitive(node: StringPrimitive): CPSThunk<PrimitiveValue> {
    return valueToCPS(node.value);
  }

  visitListPrimitive(node: ListPrimitive): CPSThunk<PrimitiveValue> {
    return (k) => {
      if (node.value.length === 0) return k([]);

      const results: PrimitiveValue[] = [];
      const evaluateNext = (index: number): Thunk<PrimitiveValue> => {
        if (index >= node.value.length) return k(results);

        return this.evaluate(node.value[index], (val) => {
          results.push(val);
          return () => evaluateNext(index + 1);
        });
      };

      return evaluateNext(0);
    };
  }

  visitNilPrimitive(node: NilPrimitive): CPSThunk<PrimitiveValue> {
    return valueToCPS(node.value);
  }

  visitCharPrimitive(node: CharPrimitive): CPSThunk<PrimitiveValue> {
    return valueToCPS(node.value);
  }

  visitSymbolPrimitive(node: SymbolPrimitive): CPSThunk<PrimitiveValue> {
    try {
      const val = lookup(this.env, node.value);
      if (isRuntimeFunction(val) && val.arity === 0) {
        if (this.context.config.debug) {
          console.log(
            `[Interpreter] Resolved symbol ${node.value} as arity-0 function, applying...`,
          );
        }
        return (k) => () =>
          this.context.funcRuntime.apply(
            val.identifier ?? "<anon>",
            val.equations,
            [],
            val.closure || this.env,
            (newEnv) =>
              new InterpreterVisitor(newEnv, this.context, this.frames),
            k,
          );
      }
      return valueToCPS(val);
    } catch (error) {
      throw new InterpreterError(
        "Symbol Lookup",
        (error as Error).message,
        this.frames,
      );
    }
  }

  visitVariable(node: Variable): CPSThunk<PrimitiveValue> {
    const name = node.identifier.value;
    if (this.context.config.debug) {
      console.log(`[Interpreter] Defining variable: ${name}`);
    }
    return (k) =>
      this.evaluate(node.expression, (value) => {
        define(this.env, name, value);
        return k(true);
      });
  }

  visitAssignment(node: Assignment): CPSThunk<PrimitiveValue> {
    if (!this.context.config.mutability) {
      throw new InterpreterError(
        "Assignment",
        `Cannot reassign variable '${node.identifier.value}': mutability is disabled`,
        this.frames,
      );
    }

    const name = node.identifier.value;
    if (this.context.config.debug) {
      console.log(`[Interpreter] Assigning variable: ${name}`);
    }
    return (k) =>
      this.evaluate(node.expression, (value) => {
        const onReplace = (scope: Environment) => {
          if (scope.has("self")) {
            const self = scope.get("self");
            if (isRuntimeObject(self) && self.fields.has(name))
              self.fields.set(name, value);
          }
        };

        if (!replace(this.env, name, value, onReplace))
          throw new InterpreterError(
            "Assignment",
            `Cannot assign to undefined variable: ${name}`,
            this.frames,
          );

        return k(value);
      });
  }

  visitArithmeticUnaryOperation(
    node: ArithmeticUnaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processUnary(
      node,
      ArithmeticUnaryTable,
      (a: number) => !Number.isNaN(a),
      "ArithmeticUnaryOperation",
    );
  }

  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processBinary(
      node,
      ArithmeticBinaryTable,
      (a, b) => typeof a === "number" && typeof b === "number",
      "ArithmeticBinaryOperation",
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.operand, (operand) => {
        if (
          typeof operand !== "string" &&
          !Array.isArray(operand) &&
          !isLazyList(operand)
        )
          throw new UnexpectedValue(
            "ListUnaryOperation",
            "Array, String or LazyList",
            typeof operand,
          );

        return this.context.lazyRuntime.realizeList(operand, (arr) => {
          const fn = ListUnaryTable[node.operator];
          if (!fn)
            throw new InterpreterError(
              "ListUnaryOperation",
              `Unknown operator: ${node.operator}`,
            );
          return k(fn(arr));
        });
      });
  }

  visitListBinaryOperation(
    node: ListBinaryOperation,
  ): CPSThunk<PrimitiveValue> {
    if (node.operator === "Concat") {
      return (k) =>
        this.evaluate(node.left, (left) => {
          return () =>
            this.evaluate(node.right, (right) => {
              return this.context.lazyRuntime.evaluateConcat(left, right, k);
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

  visitComparisonOperation(
    node: ComparisonOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processBinary(
      node,
      ComparisonOperationTable,
      () => true,
      "ComparisonOperation",
    );
  }

  visitLogicalBinaryOperation(
    node: LogicalBinaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.left, (left) => {
        if (typeof left !== "boolean")
          throw new InterpreterError(
            "LogicalBinaryOperation",
            `Expected left side to be boolean and got: ${left}`,
          );

        const fn = LogicalBinaryTable[node.operator];
        if (!fn)
          throw new InterpreterError(
            "LogicalBinaryOperation",
            `Unknown operator '${node.operator}'`,
          );

        if (this.context.config.lazyLoading) {
          if (node.operator === "And" && left === false) return k(false);
          if (node.operator === "Or" && left === true) return k(true);
        }

        return this.evaluate(node.right, (right) => {
          if (typeof right !== "boolean")
            throw new InterpreterError(
              "LogicalBinaryOperation",
              `Expected right side to be boolean and got: ${right}`,
            );
          return k(fn(left, () => right));
        });
      });
  }

  visitLogicalUnaryOperation(
    node: LogicalUnaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processUnary(
      node,
      LogicalUnaryTable,
      (a) => typeof a === "boolean",
      "LogicalUnaryOperation",
    );
  }

  visitBitwiseBinaryOperation(
    node: BitwiseBinaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processBinary(
      node,
      BitwiseBinaryTable,
      (a, b) => !Number.isNaN(a) && !Number.isNaN(b),
      "BitwiseBinaryOperation",
    );
  }

  visitBitwiseUnaryOperation(
    node: BitwiseUnaryOperation,
  ): CPSThunk<PrimitiveValue> {
    return this.processUnary(
      node,
      BitwiseUnaryTable,
      (a) => !Number.isNaN(a),
      "BitwiseUnaryOperation",
    );
  }

  visitStringOperation(node: StringOperation): CPSThunk<PrimitiveValue> {
    return this.processBinary(
      node,
      StringOperationTable,
      (a, b) => typeof a === "string" || typeof b === "string",
      "StringOperation",
    );
  }

  visitUnifyOperation(node: UnifyOperation): CPSThunk<PrimitiveValue> {
    return (k) => this.getLogicEngine().unifyExpr(node.left, node.right, k);
  }

  visitAssignOperation(node: AssignOperation): CPSThunk<PrimitiveValue> {
    if (!this.context.config.mutability) {
      throw new InterpreterError(
        "AssignOperation",
        `Cannot perform assignment operation: mutability is disabled`,
        this.frames,
      );
    }

    if (!(node.left instanceof SymbolPrimitive))
      throw new InterpreterError(
        "AssignOperation",
        "Left side must be a SymbolPrimitive",
      );
    const name = node.left.value;

    return (k) =>
      this.evaluate(node.right, (value) => {
        const onReplace = (scope: Environment) => {
          if (scope.has("self")) {
            const self = scope.get("self");
            if (isRuntimeObject(self) && self.fields.has(name)) {
              self.fields.set(name, value);
            }
          }
        };

        if (!replace(this.env, name, value, onReplace)) {
          define(this.env, name, value);
        }

        return k(true);
      });
  }

  visitTupleExpr(node: TupleExpression): CPSThunk<PrimitiveValue> {
    return (k) => {
      const results: PrimitiveValue[] = [];
      const evaluateNext = (index: number): Thunk<PrimitiveValue> => {
        if (index >= node.elements.length) return k(results);
        return this.evaluate(node.elements[index], (val) => {
          results.push(val);
          return () => evaluateNext(index + 1);
        });
      };
      return evaluateNext(0);
    };
  }

  visitFieldExpression(node: FieldExpression): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.name, (obj) => {
        return k(this.context.objRuntime.getField(obj, node.name.value));
      });
  }

  visitDataExpr(node: DataExpression): CPSThunk<PrimitiveValue> {
    return (k) => {
      const fieldValues = new Map<string, PrimitiveValue>();

      const evaluateFields = (index: number): Thunk<PrimitiveValue> => {
        if (index >= node.contents.length) {
          return k(
            this.context.objRuntime.instantiate(
              node.name.value,
              node.name.value,
              fieldValues,
              new Map(),
            ),
          );
        }
        const field = node.contents[index];
        return this.evaluate(field.expression, (value) => {
          fieldValues.set(field.name.value, value);
          return () => evaluateFields(index + 1);
        });
      };

      return evaluateFields(0);
    };
  }

  visitConsExpr(node: ConsExpression): CPSThunk<PrimitiveValue> {
    return (k) => this.context.lazyRuntime.evaluateCons(node, this, k);
  }

  visitLetInExpr(node: LetInExpression): CPSThunk<PrimitiveValue> {
    return (k) => {
      const oldEnv = this.env;
      this.env = pushEnv(this.env);
      const envBuilder = new EnvBuilderVisitor(this.context, this.env);
      node.declarations.accept(envBuilder);
      return this.evaluate(node.expression, (result) => {
        this.env = oldEnv;
        return k(result);
      });
    };
  }

  visitIf(node: If): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.condition, (condition) => {
        if (typeof condition !== "boolean")
          throw new InterpreterError(
            "If",
            `Expected boolean in condition and got ${typeof condition}`,
            this.frames,
          );
        if (this.context.config.debug) {
          console.log(`[Interpreter] If condition: ${condition}`);
        }
        return condition
          ? node.then.accept(this)(k)
          : node.elseExpr.accept(this)(k);
      });
  }

  visitCall(node: Call): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.callee, (callee) => {
        const args: PrimitiveValue[] = [];
        const evaluateArgs = (index: number): Thunk<PrimitiveValue> => {
          if (index >= node.args.length) {
            if (isRuntimeFunction(callee)) {
              if (this.context.config.debug) {
                console.log(
                  `[Interpreter] Calling function: ${callee.identifier} with ${args.length} args`,
                );
              }
              return this.context.funcRuntime.apply(
                callee.identifier,
                callee.equations,
                args,
                callee.closure || this.env,
                (newEnv) =>
                  new InterpreterVisitor(newEnv, this.context, this.frames),
                k,
              );
            }
            throw new InterpreterError("Call", "Target is not a function");
          }
          return this.evaluate(node.args[index], (val) => {
            args.push(val);
            return () => evaluateArgs(index + 1);
          });
        };
        return evaluateArgs(0);
      });
  }

  visitOtherwise(node: Otherwise): CPSThunk<PrimitiveValue> {
    return valueToCPS(true);
  }

  visitCompositionExpression(
    node: CompositionExpression,
  ): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.left, (f) => {
        return this.evaluate(node.right, (g) => {
          if (!isRuntimeFunction(f) || !isRuntimeFunction(g)) {
            throw new InterpreterError(
              "Composition",
              "Both operands of (.) must be functions",
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

          const patterns = [
            new VariablePattern(new SymbolPrimitive(PARAM_NAME)),
          ];
          const equation: EquationRuntime = {
            patterns,
            body: new UnguardedBody(
              new Sequence([new Return(compositionBody)]),
            ),
          };

          const privateScope = new Map<string, PrimitiveValue>();
          privateScope.set(F_REF, f);
          privateScope.set(G_REF, g);

          const capturedEnv: EnvStack = {
            head: privateScope,
            tail: this.env,
          };
          return k({
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

  visitLambda(node: Lambda): CPSThunk<PrimitiveValue> {
    const patterns = node.parameters;
    const equation: EquationRuntime = {
      patterns,
      body: new UnguardedBody(new Sequence([new Return(node.body)])),
    };
    return valueToCPS({
      type: "Function",
      arity: patterns.length,
      equations: [equation],
      pendingArgs: [],
      identifier: "<lambda>",
      closure: this.env,
    });
  }

  visitApplication(node: Application): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.functionExpr, (func) => {
        if (!isRuntimeFunction(func))
          throw new InterpreterError(
            "Application",
            "Cannot apply non-function",
          );

        return this.evaluate(node.parameter, (arg) => {
          const argThunk = () => arg;
          const allPendingArgs = func.pendingArgs
            ? [...func.pendingArgs, argThunk]
            : [argThunk];

          return this.applyArguments(func, allPendingArgs)(k);
        });
      });
  }

  private applyArguments(
    func: RuntimeFunction,
    args: (PrimitiveValue | (() => PrimitiveValue))[],
  ): CPSThunk<PrimitiveValue> {
    if (args.length < func.arity) {
      return valueToCPS({
        ...func,
        pendingArgs: args,
      });
    }

    const argsToConsume = args.slice(0, func.arity);
    const remainingArgs = args.slice(func.arity);

    const evaluatedArgs = argsToConsume.map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );

    const executionEnv = func.closure ?? this.env;
    return (cont) => () =>
      this.context.funcRuntime.apply(
        func.identifier ?? "<anonymous>",
        func.equations,
        evaluatedArgs,
        executionEnv,
        (newEnv) => new InterpreterVisitor(newEnv, this.context, this.frames),
        (result) => {
          if (remainingArgs.length > 0) {
            if (isRuntimeFunction(result)) {
              const nextArgs = result.pendingArgs
                ? [...result.pendingArgs, ...remainingArgs]
                : remainingArgs;

              return this.applyArguments(result, nextArgs)(cont);
            } else {
              throw new InterpreterError(
                "Application",
                `Too many arguments provided. Result was '${result}' (not a function), but had ${remainingArgs.length} args left.`,
              );
            }
          }
          return cont(result);
        },
      );
  }

  visitQuery(node: Query): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.getLogicEngine().solveQuery(node, (res) => {
        this.bindLogicResults(res);
        return k(res);
      });
  }

  visitExist(node: Exist): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.getLogicEngine().solveExist(node, (res) => {
        this.bindLogicResults(res);
        return k(res);
      });
  }

  visitNot(node: Not): CPSThunk<PrimitiveValue> {
    return (k) => this.getLogicEngine().solveNot(node, k);
  }

  visitFindall(node: Findall): CPSThunk<PrimitiveValue> {
    return (k) => this.getLogicEngine().solveFindall(node, k);
  }

  visitForall(node: Forall): CPSThunk<PrimitiveValue> {
    return (k) => this.getLogicEngine().solveForall(node, k);
  }

  visitGoal(node: Goal): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.getLogicEngine().solveGoal(node, (res) => {
        this.bindLogicResults(res);
        return k(res);
      });
  }

  private bindLogicResults(res: PrimitiveValue) {
    if (!res) return;
    if (Array.isArray(res)) {
      if (res.length > 0) this.bindLogicResults(res[0]);
      return;
    }
    if (
      typeof res === "object" &&
      res !== null &&
      "success" in res &&
      res.success &&
      "solutions" in res
    ) {
      for (const [name, val] of (res as any).solutions) {
        define(this.env, name, val);
      }
    }
  }

  visitLogicConstraint(node: LogicConstraint): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.expression, (val) => {
        if (Array.isArray(val)) return k(val.length > 0);
        return k(!!val);
      });
  }

  visitSuper(node: Super): CPSThunk<PrimitiveValue> {
    let methodName: string;
    try {
      methodName = lookup(this.env, "__METHOD_NAME__") as string;
    } catch (e) {
      throw new InterpreterError(
        "Super",
        "'super' keyword used outside of a method context",
        this.frames,
      );
    }

    return (k) => {
      const args: PrimitiveValue[] = [];
      const evaluateNextArg = (index: number): Thunk<PrimitiveValue> => {
        if (index >= node.args.length) {
          if (this.context.config.debug) {
            console.log(`[Interpreter] Dispatching super call: ${methodName}`);
          }
          return this.context.objRuntime.dispatchSuper(
            this.env,
            methodName,
            args,
            (newEnv) =>
              new InterpreterVisitor(
                newEnv,
                this.context,
                this.frames,
              ),
            k,
          );
        }
        return this.evaluate(node.args[index], (val) => {
          args.push(val);
          return () => evaluateNextArg(index + 1);
        });
      };
      return evaluateNextArg(0);
    };
  }

  visitSend(node: Send): CPSThunk<PrimitiveValue> {
    return (k) => {
      if (node.receiver instanceof Super) {
        const methodName = node.selector.value;
        const args: PrimitiveValue[] = [];
        const evaluateNextArg = (index: number): Thunk<PrimitiveValue> => {
          if (index >= node.args.length) {
            if (this.context.config.debug) {
              console.log(
                `[Interpreter] Dispatching super call: ${methodName}`,
              );
            }
            return this.context.objRuntime.dispatchSuper(
              this.env,
              methodName,
              args,
              (newEnv) =>
                new InterpreterVisitor(
                  newEnv,
                  this.context,
                  this.frames,
                ),
              k,
            );
          }
          return this.evaluate(node.args[index], (val) => {
            args.push(val);
            return () => evaluateNextArg(index + 1);
          });
        };
        return evaluateNextArg(0);
      }

      return this.evaluate(node.receiver, (receiver) => {
        const methodName = node.selector.value;
        const args: PrimitiveValue[] = [];
        const evaluateNextArg = (index: number): Thunk<PrimitiveValue> => {
          if (index >= node.args.length) {
            if (this.context.config.debug) {
              console.log(
                `[Interpreter] Sending method call: ${methodName} to object`,
              );
            }
            return this.context.objRuntime.dispatch(
              receiver,
              methodName,
              args,
              this.env,
              (newEnv) =>
                new InterpreterVisitor(
                  newEnv,
                  this.context,
                  this.frames,
                ),
              k,
            );
          }
          return this.evaluate(node.args[index], (val) => {
            args.push(val);
            return () => evaluateNextArg(index + 1);
          });
        };
        return evaluateNextArg(0);
      });
    };
  }

  visitNew(node: New): CPSThunk<PrimitiveValue> {
    const className = node.identifier.value;
    const classDef = lookup(this.env, className);
    if (!isRuntimeClass(classDef))
      throw new InterpreterError(
        "New",
        `${className} is not a class.`,
        this.frames,
      );

    if (this.context.config.debug) {
      console.log(`[Interpreter] Instantiating class: ${className}`);
    }

    return valueToCPS(
      this.context.objRuntime.instantiate(
        className,
        node.identifier.value,
        classDef.fields,
        classDef.methods,
      ),
    );
  }

  visitSelf(node: Self): CPSThunk<PrimitiveValue> {
    try {
      return valueToCPS(lookup(this.env, "self"));
    } catch {
      throw new InterpreterError(
        "Self",
        "'self' is not defined in this context",
      );
    }
  }

  visitListComprehension(node: ListComprehension): CPSThunk<PrimitiveValue> {
    return (k) => {
      const results: PrimitiveValue[] = [];

      const process = (index: number): Thunk<PrimitiveValue> => {
        if (index >= node.generators.length) {
          return this.evaluate(node.projection, (proj) => {
            results.push(proj);
            return () => k(results);
          });
        }

        const current = node.generators[index];

        if (current instanceof YuGenerator) {
          return this.evaluate(current.expression, (exprResult) => {
            return this.context.lazyRuntime.realizeList(exprResult, (sourceList) => {
              const iterateSource = (
                sourceIndex: number,
              ): Thunk<PrimitiveValue> => {
                if (sourceIndex >= sourceList.length) return () => k(results);

                const item = sourceList[sourceIndex];
                const varName = current.variable.value;
                define(this.env, varName, item);

                return () => process(index + 1);
              };
              return iterateSource(0);
            });
          });
        } else {
          return this.evaluate(current as Expression, (condition) => {
            return condition === true
              ? () => process(index + 1)
              : () => k(results);
          });
        }
      };

      pushEnv(this.env);
      return process(0);
    };
  }

  visitGenerator(node: YuGenerator): CPSThunk<PrimitiveValue> {
    return (k) => this.evaluate(node.expression, k);
  }

  visitRaise(node: Raise): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.body, (msg) => {
        if (typeof msg !== "string")
          throw new UnexpectedValue("Raise", "string", typeof msg);
        throw new InterpreterError("Raise", msg);
      });
  }

  visitRangeExpression(node: RangeExpression): CPSThunk<PrimitiveValue> {
    return (k) => this.context.lazyRuntime.evaluateRange(node, this, k);
  }

  visit(node: Expression): CPSThunk<PrimitiveValue> {
    return node.accept(this);
  }

  public realizeList<R = PrimitiveValue[]>(
    val: PrimitiveValue,
    k: Continuation<PrimitiveValue[], R>,
  ): Thunk<R> {
    return this.context.lazyRuntime.realizeList(val, k);
  }

  private processBinary(
    node: BinaryOperation,
    table: any,
    typeGuard: (a: any, b: any) => boolean,
    contextName: string,
  ): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.left, (left) => {
        return this.evaluate(node.right, (right) => {
          if (!typeGuard(left, right))
            throw new InterpreterError(
              contextName,
              `Type mismatch: ${left}, ${right}`,
              this.frames,
            );

          const fn = table[node.operator];
          if (!fn)
            throw new InterpreterError(
              contextName,
              `Unknown op: ${node.operator}`,
            );
          return k(fn(left, right));
        });
      });
  }

  private processUnary(
    node: UnaryOperation,
    table: any,
    typeGuard: (a: any) => boolean,
    contextName: string,
  ): CPSThunk<PrimitiveValue> {
    return (k) =>
      this.evaluate(node.operand, (operand) => {
        if (!typeGuard(operand))
          throw new InterpreterError(
            contextName,
            `Type mismatch: ${operand}`,
            this.frames,
          );

        const fn = table[node.operator];
        if (!fn)
          throw new InterpreterError(
            contextName,
            `Unknown op: ${node.operator}`,
          );
        return k(fn(operand));
      });
  }

  private getLogicEngine(): LogicEngine {
    return new LogicEngine(this.env, this, this.context);
  }

  static evaluateLiteral(node: ASTNode): PrimitiveValue {
    const ctx = new RuntimeContext();
    const visitor = new InterpreterVisitor(createGlobalEnv(), ctx);
    return trampoline(visitor.evaluate(node, idContinuation));
  }
}
