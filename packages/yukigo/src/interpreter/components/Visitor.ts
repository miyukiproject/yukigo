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
  isLazyList,
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
  Include,
  Self,
  ListComprehension,
  RangeExpression,
  RuntimeFunction,
  Generator as YuGenerator,
  BinaryOperation,
  UnaryOperation,
  SourceLocation,
  ASTNode,
  Raise,
} from "@yukigo/ast";
import { Bindings, EnvStack, InterpreterConfig } from "../index.js";
import { PatternMatcher } from "./PatternMatcher.js";
import {
  ArithmeticBinaryTable,
  ArithmeticUnaryTable,
  BinaryOp,
  BitwiseBinaryTable,
  BitwiseUnaryTable,
  ComparisonOperationTable,
  ListBinaryTable,
  ListUnaryTable,
  LogicalBinaryTable,
  LogicalUnaryTable,
  OperatorTable,
  StringOperationTable,
  UnaryOp,
} from "./Operations.js";
import { lookup } from "../utils.js";

export interface ErrorFrame {
  nodeType: string;
  loc?: SourceLocation;
}

export class InterpreterError extends Error {
  context: string;
  frames: ErrorFrame[];

  constructor(context: string, message: string, frames: ErrorFrame[] = []) {
    super(`[${context}] ${message}`);
    this.context = context;
    this.frames = frames;
  }

  pushFrame(frame: ErrorFrame) {
    this.frames.push(frame);
  }

  formatStack(): string {
    if (!this.frames.length) return "";
    const formatted = this.frames
      .map((f) => {
        const loc = f.loc ? ` (line ${f.loc.line}, col ${f.loc.column})` : "";
        return `  • ${f.nodeType}${loc}`;
      })
      .join("\n");
    return `\nTrace:\n${formatted}`;
  }

  override toString(): string {
    return `${this.message}${this.formatStack()}`;
  }
}
class UnexpectedValue extends InterpreterError {
  constructor(ctx: string, expected: string, got: string) {
    super(ctx, `Expected ${expected} but got ${got}`);
  }
}

export class InterpreterVisitor implements Visitor<PrimitiveValue> {
  private frames: ErrorFrame[];

  constructor(
    private env: EnvStack,
    private readonly config: InterpreterConfig,
    frames: ErrorFrame[] = []
  ) {
    this.frames = frames;
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
  visitSymbolPrimitive(node: SymbolPrimitive): PrimitiveValue {
    try {
      return lookup(this.env, node.value);
    } catch (error) {
      throw new InterpreterError("Symbol Lookup", error.message, this.frames);
    }
  }
  visitVariable(node: Variable): PrimitiveValue {
    const name = node.identifier.value;
    const value = node.expression.accept(this);
    this.env.at(-1).set(name, value);
    return true;
  }
  visitCharPrimitive(node: CharPrimitive): PrimitiveValue {
    return node.value;
  }
  visitArithmeticUnaryOperation(
    node: ArithmeticUnaryOperation
  ): PrimitiveValue {
    const typeCheck = (a: number) => !Number.isNaN(a);
    return this.evaluateUnary(
      node,
      ArithmeticUnaryTable,
      "ArithmeticUnaryOperation",
      typeCheck
    );
  }
  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation
  ): PrimitiveValue {
    const typeCheck = (a, b) => typeof a === "number" && typeof b === "number";
    return this.evaluateBinary(
      node,
      ArithmeticBinaryTable,
      "ArithmeticBinaryOperation",
      typeCheck
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
    const typeCheck = (a, b) => Array.isArray(a) && Array.isArray(b);
    return this.evaluateBinary(
      node,
      ListBinaryTable,
      "ListBinaryOperation",
      typeCheck
    );
  }
  visitComparisonOperation(node: ComparisonOperation): PrimitiveValue {
    return this.evaluateBinary(
      node,
      ComparisonOperationTable,
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
    const typeCheck = (a) => typeof a === "boolean";
    return this.evaluateUnary(
      node,
      LogicalUnaryTable,
      "LogicalUnaryOperation",
      typeCheck
    );
  }
  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): PrimitiveValue {
    const typeCheck = (a: PrimitiveValue, b: PrimitiveValue) =>
      !Number.isNaN(a) && !Number.isNaN(b);
    return this.evaluateBinary(
      node,
      BitwiseBinaryTable,
      "BitwiseBinaryOperation",
      typeCheck
    );
  }
  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): PrimitiveValue {
    const typeCheck = (a: PrimitiveValue) => !Number.isNaN(a);
    return this.evaluateUnary(
      node,
      BitwiseUnaryTable,
      "BitwiseUnaryOperation",
      typeCheck
    );
  }
  visitStringOperation(node: StringOperation): PrimitiveValue {
    const typeCheck = (a: PrimitiveValue, b: PrimitiveValue) =>
      typeof a === "string" || typeof b === "string";
    return this.evaluateBinary(
      node,
      StringOperationTable,
      "StringOperation",
      typeCheck
    );
  }
  visitUnifyOperation(node: UnifyOperation): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitAssignOperation(node: AssignOperation): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitTupleExpr(node: TupleExpression): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitFieldExpr(node: FieldExpression): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitDataExpr(node: DataExpression): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitConsExpr(node: ConsExpression): PrimitiveValue {
    const head = node.head.accept(this);

    if (this.config.lazyLoading) {
      const tail = node.tail.accept(this);

      // tail is already a realized list so we return a realized list
      if (Array.isArray(tail)) {
        return [head, ...tail];
      }

      // tail is a LazyList so we extend lazily
      if (isLazyList(tail)) {
        const generator = function* (): Generator<
          PrimitiveValue,
          void,
          unknown
        > {
          yield head;
          yield* tail.generator();
        };
        return { type: "LazyList", generator };
      }
      throw new UnexpectedValue("ConsExpr", "Array or LazyList", typeof tail);
    }

    const tail = node.tail.accept(this);

    if (isLazyList(tail) || !Array.isArray(tail))
      throw new UnexpectedValue("ConsExpr", "Array", typeof tail);

    return [head, ...tail];
  }
  visitLetInExpr(node: LetInExpression): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitCall(node: Call): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitOtherwise(node: Otherwise): PrimitiveValue {
    return true;
  }
  visitCompositionExpression(node: CompositionExpression): PrimitiveValue {
    const f = node.left.accept(this);
    const g = node.right.accept(this);

    if (!this.isRuntimeFunction(f) || !this.isRuntimeFunction(g)) {
      throw new InterpreterError(
        "CompositionExpression",
        "Both operands of (.) must be functions"
      );
    }

    const fLabel = f.identifier ?? "λ";
    const gLabel = g.identifier ?? "λ";

    // Get the parameter patterns from g
    const arity = g.arity;

    // Generate placeholder variables for arguments
    const placeholders = Array.from(
      { length: arity },
      (_, i) => new VariablePattern(new SymbolPrimitive(`_p${i}`))
    );

    // Build g applied to all placeholders
    const gCall = placeholders.reduce<Expression>(
      (acc, p) => new Application(acc, new SymbolPrimitive(p.name.value)),
      new SymbolPrimitive(gLabel)
    );

    // Then f (g p1 ... pN)
    const composedBody = new Application(new SymbolPrimitive(fLabel), gCall);

    // Create lambda taking those placeholders
    const lambda = new Lambda(placeholders, composedBody);

    return lambda.accept(this);
  }
  visitLambda(node: Lambda): PrimitiveValue {
    const patterns = node.parameters; // accept any Pattern node directly

    const equation: EquationRuntime = {
      patterns,
      body: new UnguardedBody(new Sequence([new Return(node.body)])),
    };

    return {
      arity: patterns.length,
      equations: [equation],
      pendingArgs: [],
      identifier: "<lambda>",
    };
  }

  visitApplication(node: Application): PrimitiveValue {
    const func = node.functionExpr.accept(this);
    const argThunk = () => node.parameter.accept(this);

    if (!this.isRuntimeFunction(func))
      throw new InterpreterError("Application", "Cannot apply non-function");

    const pending = func.pendingArgs
      ? [...func.pendingArgs, argThunk]
      : [argThunk];

    // fully applied
    if (pending.length === func.arity) {
      const evaluatedArgs = pending.map((arg) =>
        typeof arg === "function" ? arg() : arg
      );

      const result = this.matchFunction(
        func.identifier ?? "<anonymous>",
        func.equations,
        evaluatedArgs
      );
      return result;
    }

    // partial application → carry args forward
    return {
      ...func,
      pendingArgs: pending,
    };
  }

  visitExist(node: Exist): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitNot(node: Not): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitFindall(node: Findall): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitForall(node: Forall): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitGoal(node: Goal): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitSend(node: Send): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitNew(node: New): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitImplement(node: Implement): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitInclude(node: Include): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitSelf(node: Self): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitListComprehension(node: ListComprehension): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitGenerator(node: YuGenerator): PrimitiveValue {
    throw new Error("Method not implemented.");
  }
  visitRaise(node: Raise): PrimitiveValue {
    const msg = node.body.accept(this);
    if (typeof msg !== "string")
      throw new UnexpectedValue("Raise", "string", typeof msg);
    throw new InterpreterError("Raise", msg);
  }
  visitRangeExpression(node: RangeExpression): PrimitiveValue {
    const startVal = node.start.accept(this);
    if (typeof startVal !== "number")
      throw new InterpreterError(
        "RangeExpression",
        "Range start must be a number"
      );

    const hasEnd = node.end != null;

    if (!hasEnd) {
      // Infinite range: [start..] or [start,second..]
      if (!this.config.lazyLoading) {
        throw new InterpreterError(
          "RangeExpression",
          "Infinite range not allowed when 'config.lazyLoading' is disabled"
        );
      }

      let step: number;
      if (node.step) {
        const secondVal = node.step.accept(this);
        if (typeof secondVal !== "number")
          throw new InterpreterError(
            "RangeExpression",
            "Range second element must be a number"
          );

        step = secondVal - startVal;
        if (step === 0)
          throw new InterpreterError(
            "RangeExpression",
            "Range step cannot be zero"
          );
      } else {
        step = 1;
      }

      // Create infinite lazy list
      const generator = function* (): Generator<number, never, unknown> {
        let current = startVal;
        while (true) {
          yield current;
          current += step;
        }
      };
      return { type: "LazyList", generator };
    }

    // eager eval
    const endVal = node.end.accept(this);
    if (typeof endVal !== "number") {
      throw new InterpreterError(
        "RangeExpression",
        "Range end must be a number"
      );
    }

    let step: number;
    if (node.step) {
      const secondVal = node.step.accept(this);
      if (typeof secondVal !== "number")
        throw new InterpreterError(
          "RangeExpression",
          "Range second element must be a number"
        );

      step = secondVal - startVal;
      if (step === 0)
        throw new InterpreterError(
          "RangeExpression",
          "Range step cannot be zero"
        );
    } else {
      step = 1;
    }

    const result: number[] = [];
    let current = startVal;

    if (step > 0) {
      while (current <= endVal) {
        result.push(current);
        current += step;
      }
    } else {
      while (current >= endVal) {
        result.push(current);
        current += step;
      }
    }

    return result;
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
      } else {
        // Wrap unknown errors
        const wrapped = new InterpreterError(
          node.constructor.name,
          (err as Error).message,
          [...this.frames, { nodeType: node.constructor.name, loc: node.loc }]
        );
        throw wrapped;
      }
    }
  }
  private matchFunction(
    funcName: string,
    equations: EquationRuntime[],
    args: PrimitiveValue[]
  ): PrimitiveValue {
    for (const eq of equations) {
      if (eq.patterns.length !== args.length) continue;

      const bindings: Bindings = [];
      let matched = true;

      for (let i = 0; i < args.length; i++) {
        const matcher = new PatternMatcher(args[i], bindings);
        if (!eq.patterns[i].accept(matcher)) {
          matched = false;
          break;
        }
      }

      if (!matched) continue;

      // Push local bindings
      const localEnv = new Map<string, PrimitiveValue>(bindings);
      const newStack = [localEnv, ...this.env];

      const visitor = new InterpreterVisitor(newStack, this.config);

      if (eq.body instanceof UnguardedBody) {
        return visitor.evaluateSequence(eq.body.sequence, newStack);
      }

      // Guarded case
      for (const guard of eq.body) {
        const cond = guard.condition.accept(visitor);
        if (cond === true) {
          return guard.body.accept(visitor);
        }
      }
    }

    throw new InterpreterError(
      "PatternMatch",
      `Non-exhaustive patterns in '${funcName}'`
    );
  }

  private evaluateSequence(seq: Sequence, env: EnvStack): PrimitiveValue {
    let result: PrimitiveValue = undefined;
    for (const stmt of seq.statements) {
      if (stmt instanceof Return) {
        return stmt.body.accept(
          new InterpreterVisitor(env, this.config, this.frames)
        );
      } else if ((stmt as any).accept) {
        result = (stmt as Expression).accept(
          new InterpreterVisitor(env, this.config, this.frames)
        );
      }
    }
    return result;
  }

  private isRuntimeFunction(val: any): val is RuntimeFunction {
    return (
      typeof val === "object" &&
      val !== null &&
      Array.isArray(val.equations) &&
      typeof val.arity === "number"
    );
  }
  public realizeList(val: PrimitiveValue): PrimitiveValue[] {
    if (Array.isArray(val)) {
      return val;
    }

    if (isLazyList(val)) {
      const result: PrimitiveValue[] = [];
      const iter = val.generator();
      let next = iter.next();
      // Add safety limit for infinite lists in non-lazy contexts
      let count = 0;
      while (!next.done) {
        if (!next.value)
          throw new InterpreterError("LazyList", "Value yielded undefined");

        result.push(next.value);
        next = iter.next();
        count++;
      }
      return result;
    }

    throw new UnexpectedValue("RealizeList", "List or LazyList", typeof val);
  }
  private evaluateBinary(
    node: BinaryOperation,
    table: OperatorTable<BinaryOp<PrimitiveValue>>,
    errorCtx: string,
    typeCheck?: (x: any, y: any) => boolean
  ): PrimitiveValue {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    if (typeCheck && !typeCheck(left, right))
      throw new InterpreterError(
        errorCtx,
        `Type mismatch. Left: ${left}. Right ${right}`
      );

    const fn = table[node.operator];
    if (!fn)
      throw new InterpreterError(
        errorCtx,
        `Unknown operator '${node.operator}'`
      );

    return fn(left, right);
  }
  private evaluateUnary(
    node: UnaryOperation,
    table: OperatorTable<UnaryOp<PrimitiveValue>>,
    errorCtx: string,
    typeCheck?: (x: any) => boolean
  ): PrimitiveValue {
    const operand = node.operand.accept(this);
    if (typeCheck && !typeCheck(operand))
      throw new InterpreterError(
        errorCtx,
        `Type mismatch. Operand: ${operand}`
      );

    const fn = table[node.operator];
    if (!fn)
      throw new InterpreterError(
        errorCtx,
        `Unknown operator '${node.operator}'`
      );

    return fn(operand);
  }
  private debug(msg: string, data?: any) {
    if (this.config.debug) console.log(`[Interpreter] ${msg}`, data ?? "");
  }
  static evaluateLiteral(node: ASTNode): PrimitiveValue {
    return node.accept(
      new InterpreterVisitor([new Map()], { lazyLoading: false })
    );
  }
}
