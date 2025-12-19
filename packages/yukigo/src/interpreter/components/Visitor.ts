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
  If,
  isRuntimeFunction,
} from "yukigo-ast";
import { InterpreterConfig } from "../index.js";
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
  popEnv,
  pushEnv,
  remove,
  replace,
} from "../utils.js";
import { LogicEngine } from "./LogicEngine.js";
import {
  ErrorFrame,
  InterpreterError,
  UnboundVariable,
  UnexpectedValue,
} from "../errors.js";
import { LazyRuntime } from "./LazyRuntime.js";
import { FunctionRuntime } from "./FunctionRuntime.js";
import { ObjectRuntime } from "./ObjectRuntime.js";
import { EnvBuilderVisitor } from "./EnvBuilder.js";

export class InterpreterVisitor
  implements Visitor<PrimitiveValue>, ExpressionEvaluator
{
  private frames: ErrorFrame[];
  private env: EnvStack;
  private readonly config: InterpreterConfig;

  constructor(
    env: EnvStack,
    config: InterpreterConfig,
    frames: ErrorFrame[] = []
  ) {
    this.frames = frames;
    this.env = env;
    this.config = config;
  }

  evaluate(node: Expression): PrimitiveValue {
    return node.accept(this);
  }
  visitNumberPrimitive(node: NumberPrimitive): PrimitiveValue {
    return node.value;
  }
  visitBooleanPrimitive(node: BooleanPrimitive): PrimitiveValue {
    return node.value;
  }
  visitStringPrimitive(node: StringPrimitive): PrimitiveValue {
    return node.value;
  }
  visitListPrimitive(node: ListPrimitive): PrimitiveValue {
    return node.elements.map((elem) => elem.accept(this));
  }
  visitNilPrimitive(node: NilPrimitive): PrimitiveValue {
    return node.value;
  }
  visitCharPrimitive(node: CharPrimitive): PrimitiveValue {
    return node.value;
  }
  visitSymbolPrimitive(node: SymbolPrimitive): PrimitiveValue {
    try {
      const val = lookup(this.env, node.value);
      // evaluate if its a function with arity 0
      if (isRuntimeFunction(val) && val.arity === 0) {
        return FunctionRuntime.apply(
          val.identifier ?? "<anon>",
          val.equations,
          [],
          val.closure || this.env,
          (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
        );
      }

      return val;
    } catch (error) {
      throw new InterpreterError("Symbol Lookup", error.message, this.frames);
    }
  }
  visitVariable(node: Variable): PrimitiveValue {
    const name = node.identifier.value;
    const value = node.expression.accept(this);
    define(this.env, name, value);
    return true;
  }
  visitArithmeticUnaryOperation(
    node: ArithmeticUnaryOperation
  ): PrimitiveValue {
    return this.processUnary(
      node,
      ArithmeticUnaryTable,
      (a: number) => !Number.isNaN(a),
      "ArithmeticUnaryOperation"
    );
  }
  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation
  ): PrimitiveValue {
    return this.processBinary(
      node,
      ArithmeticBinaryTable,
      (a, b) => typeof a === "number" && typeof b === "number",
      "ArithmeticBinaryOperation"
    );
  }
  visitListUnaryOperation(node: ListUnaryOperation): PrimitiveValue {
    const operand = node.operand.accept(this);
    if (!Array.isArray(operand))
      throw new UnexpectedValue("ListUnaryOperation", "Array", typeof operand);

    const arr = this.realizeList(operand);
    const fn = ListUnaryTable[node.operator];
    if (!fn)
      throw new InterpreterError(
        "ListUnaryOperation",
        `Unknown operator: ${node.operator}`
      );
    return fn(arr);
  }
  visitListBinaryOperation(node: ListBinaryOperation): PrimitiveValue {
    return this.processBinary(
      node,
      ListBinaryTable,
      (a, b) => Array.isArray(a) && Array.isArray(b),
      "ListBinaryOperation"
    );
  }
  visitComparisonOperation(node: ComparisonOperation): PrimitiveValue {
    return this.processBinary(
      node,
      ComparisonOperationTable,
      () => true,
      "ComparisonOperation"
    );
  }
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): PrimitiveValue {
    const left = node.left.accept(this);
    if (typeof left !== "boolean")
      throw new InterpreterError(
        "LogicalBinaryOperation",
        `Expected left side to be boolean and got: ${left}`
      );

    const fn = LogicalBinaryTable[node.operator];
    if (!fn)
      throw new InterpreterError(
        "LogicalBinaryOperation",
        `Unknown operator '${node.operator}'`
      );

    const rightThunk = () => {
      const right = node.right.accept(this);
      if (typeof right !== "boolean")
        throw new InterpreterError(
          "LogicalBinaryOperation",
          `Expected right side to be boolean and got: ${right}`
        );
      return right;
    };

    // short circuit if lazy loading is enabled
    if (this.config.lazyLoading) {
      if (node.operator === "And" && left === false) return false;
      if (node.operator === "Or" && left === true) return true;
    }
    return fn(left, rightThunk);
  }
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): PrimitiveValue {
    return this.processUnary(
      node,
      LogicalUnaryTable,
      (a) => typeof a === "boolean",
      "LogicalUnaryOperation"
    );
  }
  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): PrimitiveValue {
    return this.processBinary(
      node,
      BitwiseBinaryTable,
      (a, b) => !Number.isNaN(a) && !Number.isNaN(b),
      "BitwiseBinaryOperation"
    );
  }
  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): PrimitiveValue {
    return this.processUnary(
      node,
      BitwiseUnaryTable,
      (a) => !Number.isNaN(a),
      "BitwiseUnaryOperation"
    );
  }
  visitStringOperation(node: StringOperation): PrimitiveValue {
    return this.processBinary(
      node,
      StringOperationTable,
      (a, b) => typeof a === "string" || typeof b === "string",
      "StringOperation"
    );
  }
  visitUnifyOperation(node: UnifyOperation): PrimitiveValue {
    return this.getLogicEngine().unifyExpr(node.left, node.right);
  }
  visitAssignOperation(node: AssignOperation): PrimitiveValue {
    if (!(node.left instanceof Variable))
      throw new InterpreterError(
        "AssignOperation",
        "Left side must be a Variable"
      );
    const identifier = node.left.identifier;
    const value = node.right.accept(this);

    // check if the value to change is a member from an obj
    const obj = identifier.accept(this);
    if (isRuntimeObject(obj)) {
      const val = node.right.accept(this);
      return ObjectRuntime.setField(obj, identifier.value, val);
    }
    const succed = replace(this.env, identifier.value, value);
    if (!succed) define(this.env, identifier.value, value);
    return true;
  }
  visitTupleExpr(node: TupleExpression): PrimitiveValue {
    return node.elements.map((elem) => elem.accept(this));
  }
  visitFieldExpression(node: FieldExpression): PrimitiveValue {
    const obj = node.name.accept(this);
    return ObjectRuntime.getField(obj, node.name.value);
  }
  visitDataExpr(node: DataExpression): PrimitiveValue {
    const fieldValues = new Map<string, PrimitiveValue>();

    for (const field of node.contents) {
      const value = field.expression.accept(this);
      fieldValues.set(field.name.value, value);
    }
    return ObjectRuntime.instantiate(node.name.value, fieldValues, new Map());
  }
  visitConsExpr(node: ConsExpression): PrimitiveValue {
    try {
      return LazyRuntime.evaluateCons(node, this, this.config.lazyLoading);
    } catch (e) {
      throw new InterpreterError("Cons", e.message, this.frames);
    }
  }
  visitLetInExpr(node: LetInExpression): PrimitiveValue {
    pushEnv(this.env);
    try {
      const envBuilder = new EnvBuilderVisitor(this.env);
      node.declarations.accept(envBuilder);
      return node.expression.accept(this);
    } finally {
      popEnv(this.env);
    }
  }
  visitIf(node: If): PrimitiveValue {
    const condition = node.condition.accept(this);
    if (typeof condition !== "boolean")
      throw new InterpreterError(
        "If",
        `Expected boolean in condition and got ${typeof condition}`,
        this.frames
      );
    if (condition) {
      return node.then.accept(this);
    } else {
      return node.elseExpr.accept(this);
    }
  }
  visitCall(node: Call): PrimitiveValue {
    // similar to Application but without currying
    const callee = node.callee.accept(this);
    const args = node.args.map((arg) => arg.accept(this));

    if (isRuntimeFunction(callee)) {
      return FunctionRuntime.apply(
        callee.identifier,
        callee.equations,
        args,
        callee.closure || this.env,
        (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
      );
    }
    throw new InterpreterError("Call", "Target is not a function");
  }
  visitOtherwise(node: Otherwise): PrimitiveValue {
    return true;
  }
  visitCompositionExpression(node: CompositionExpression): PrimitiveValue {
    const f = node.left.accept(this);
    const g = node.right.accept(this);

    if (!isRuntimeFunction(f) || !isRuntimeFunction(g)) {
      throw new InterpreterError(
        "Composition",
        "Both operands of (.) must be functions"
      );
    }

    const F_REF = "__internal_f";
    const G_REF = "__internal_g";
    const PARAM_NAME = "__x";

    const compositionBody = new Application(
      new SymbolPrimitive(F_REF),
      new Application(
        new SymbolPrimitive(G_REF),
        new SymbolPrimitive(PARAM_NAME)
      )
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
      tail: this.env,
    };
    return {
      type: "Function",
      arity: 1,
      identifier: `<(${f.identifier} . ${g.identifier})>`,
      equations: [equation],
      pendingArgs: [],
      closure: capturedEnv,
    };
  }
  visitLambda(node: Lambda): PrimitiveValue {
    const patterns = node.parameters;
    const equation: EquationRuntime = {
      patterns,
      body: new UnguardedBody(new Sequence([new Return(node.body)])),
    };
    return {
      type: "Function",
      arity: patterns.length,
      equations: [equation],
      pendingArgs: [],
      identifier: "<lambda>",
      closure: this.env,
    };
  }

  visitApplication(node: Application): PrimitiveValue {
    const func = node.functionExpr.accept(this);

    if (!isRuntimeFunction(func))
      throw new InterpreterError("Application", "Cannot apply non-function");

    const argThunk = () => node.parameter.accept(this);

    const allPendingArgs = func.pendingArgs
      ? [...func.pendingArgs, argThunk]
      : [argThunk];

    return this.applyArguments(func, allPendingArgs);
  }

  private applyArguments(
    func: RuntimeFunction,
    args: (PrimitiveValue | (() => PrimitiveValue))[]
  ): PrimitiveValue {
    if (args.length < func.arity) {
      return {
        ...func,
        pendingArgs: args,
      };
    }

    const argsToConsume = args.slice(0, func.arity);
    const remainingArgs = args.slice(func.arity);

    const evaluatedArgs = argsToConsume.map((arg) =>
      typeof arg === "function" ? arg() : arg
    );

    const executionEnv = func.closure ?? this.env;
    const result = FunctionRuntime.apply(
      func.identifier ?? "<anonymous>",
      func.equations,
      evaluatedArgs,
      executionEnv,
      (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
    );
    if (remainingArgs.length > 0) {
      if (isRuntimeFunction(result)) {
        const nextArgs = result.pendingArgs
          ? [...result.pendingArgs, ...remainingArgs]
          : remainingArgs;

        return this.applyArguments(result, nextArgs);
      } else {
        throw new InterpreterError(
          "Application",
          `Too many arguments provided. Result was '${result}' (not a function), but had ${remainingArgs.length} args left.`
        );
      }
    }

    return result;
  }
  visitQuery(node: Query): PrimitiveValue {
    return this.getLogicEngine().solveQuery(node);
  }
  visitExist(node: Exist): PrimitiveValue {
    return this.getLogicEngine().solveExist(node);
  }
  visitNot(node: Not): PrimitiveValue {
    return this.getLogicEngine().solveNot(node);
  }
  visitFindall(node: Findall): PrimitiveValue {
    return this.getLogicEngine().solveFindall(node);
  }
  visitForall(node: Forall): PrimitiveValue {
    return this.getLogicEngine().solveForall(node);
  }
  visitGoal(node: Goal): PrimitiveValue {
    return this.getLogicEngine().solveGoal(node);
  }
  visitSuper(node: Super): PrimitiveValue {
    let methodName: string;
    try {
      methodName = lookup(this.env, "__METHOD_NAME__") as string;
    } catch (e) {
      throw new InterpreterError(
        "Super",
        "'super' keyword used outside of a method context",
        this.frames
      );
    }

    if (typeof methodName !== "string")
      throw new InterpreterError("Super", "Corrupted method context");

    const args = node.args.map((arg) => arg.accept(this));

    return ObjectRuntime.dispatchSuper(
      this.env,
      methodName,
      args,
      (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
    );
  }
  visitSend(node: Send): PrimitiveValue {
    if (node.receiver instanceof Super) {
      const args = node.args.map((arg) => arg.accept(this));
      const methodName = node.selector.value;

      return ObjectRuntime.dispatchSuper(
        this.env,
        methodName,
        args,
        (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
      );
    }
    const receiver = node.receiver.accept(this);
    const args = node.args.map((arg) => arg.accept(this));
    const methodName = node.selector.value;

    return ObjectRuntime.dispatch(
      receiver,
      methodName,
      args,
      this.env,
      (newEnv) => new InterpreterVisitor(newEnv, this.config, this.frames)
    );
  }
  visitNew(node: New): PrimitiveValue {
    const className = node.identifier.value;

    const classDef = lookup(this.env, className);
    if (!isRuntimeClass(classDef))
      throw new InterpreterError(
        "New",
        `${className} is not a class.`,
        this.frames
      );

    return ObjectRuntime.instantiate(
      node.identifier.value,
      classDef.fields,
      classDef.methods
    );
  }
  visitSelf(node: Self): PrimitiveValue {
    try {
      return lookup(this.env, "self");
    } catch {
      throw new InterpreterError(
        "Self",
        "'self' is not defined in this context"
      );
    }
  }
  visitListComprehension(node: ListComprehension): PrimitiveValue {
    const results: PrimitiveValue[] = [];

    const process = (index: number) => {
      if (index >= node.generators.length) {
        results.push(node.projection.accept(this));
        return;
      }

      const current = node.generators[index];

      if (current instanceof YuGenerator) {
        const sourceList = this.realizeList(current.expression.accept(this));
        for (const item of sourceList) {
          const varName = current.variable.value;
          const previousVal = lookup(this.env, varName);
          define(this.env, varName, item);
          process(index + 1);
          if (previousVal !== undefined) define(this.env, varName, previousVal);
          else remove(this.env, varName);
        }
      } else {
        const guard = current as Expression;
        const condition = guard.accept(this);
        if (condition === true) process(index + 1);
      }
    };

    pushEnv(this.env);
    try {
      process(0);
    } finally {
      popEnv(this.env);
    }

    return results;
  }
  visitGenerator(node: YuGenerator): PrimitiveValue {
    return node.expression.accept(this);
  }
  visitRaise(node: Raise): PrimitiveValue {
    const msg = node.body.accept(this);
    if (typeof msg !== "string")
      throw new UnexpectedValue("Raise", "string", typeof msg);
    throw new InterpreterError("Raise", msg);
  }
  visitRangeExpression(node: RangeExpression): PrimitiveValue {
    try {
      return LazyRuntime.evaluateRange(node, this);
    } catch (e) {
      throw new InterpreterError("Range", e.message, this.frames);
    }
  }
  visit(node: Expression): PrimitiveValue {
    return this.safelyVisit(node, () => node.accept(this));
  }
  private safelyVisit<T>(node: Expression, fn: () => T): T {
    try {
      return fn();
    } catch (err) {
      if (err instanceof InterpreterError) {
        err.pushFrame({ nodeType: node.constructor.name, loc: node.loc });
        throw err;
      }
      const wrapped = new InterpreterError(
        node.constructor.name,
        (err as Error).message,
        [...this.frames, { nodeType: node.constructor.name, loc: node.loc }]
      );
      throw wrapped;
    }
  }
  public realizeList(val: PrimitiveValue): PrimitiveValue[] {
    return LazyRuntime.realizeList(val);
  }
  private processBinary(
    node: BinaryOperation,
    table: any,
    typeGuard: (a: any, b: any) => boolean,
    contextName: string
  ): PrimitiveValue {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    if (!typeGuard(left, right))
      throw new InterpreterError(
        contextName,
        `Type mismatch: ${left}, ${right}`,
        this.frames
      );

    const fn = table[node.operator];
    if (!fn)
      throw new InterpreterError(contextName, `Unknown op: ${node.operator}`);
    return fn(left, right);
  }

  private processUnary(
    node: UnaryOperation,
    table: any,
    typeGuard: (a: any) => boolean,
    contextName: string
  ): PrimitiveValue {
    const operand = node.operand.accept(this);
    if (!typeGuard(operand))
      throw new InterpreterError(
        contextName,
        `Type mismatch: ${operand}`,
        this.frames
      );

    const fn = table[node.operator];
    if (!fn)
      throw new InterpreterError(contextName, `Unknown op: ${node.operator}`);
    return fn(operand);
  }
  private getLogicEngine(): LogicEngine {
    return new LogicEngine(this.env, this.config, this);
  }
  static evaluateLiteral(node: ASTNode): PrimitiveValue {
    return node.accept(
      new InterpreterVisitor(createGlobalEnv(), { lazyLoading: false })
    );
  }
}
