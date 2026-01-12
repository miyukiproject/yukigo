import { Visitor } from "../visitor.js";
import { Expression } from "./expressions.js";
import { ASTNode, SourceLocation } from "./generics.js";

export type ArithmeticBinaryOperator =
  | "Plus"
  | "Minus"
  | "Multiply"
  | "Divide"
  | "Modulo"
  | "Power"
  | "Max"
  | "Min";
export type ArithmeticUnaryOperator =
  | "Round"
  | "Absolute"
  | "Ceil"
  | "Floor"
  | "Negation"
  | "Sqrt";

export type ComparisonOperatorType =
  | "Equal"
  | "NotEqual"
  | "Same"
  | "NotSame"
  | "Similar"
  | "NotSimilar"
  | "GreaterOrEqualThan"
  | "GreaterThan"
  | "LessOrEqualThan"
  | "LessThan";

export type LogicalBinaryOperator = "And" | "Or";
export type LogicalUnaryOperator = "Negation";

export type BitwiseBinaryOperator =
  | "BitwiseOr"
  | "BitwiseAnd"
  | "BitwiseLeftShift"
  | "BitwiseRightShift"
  | "BitwiseUnsignedRightShift"
  | "BitwiseXor";

export type BitwiseUnaryOperator = "BitwiseNot";

export type ListBinaryOperator =
  | "Push"
  | "Concat"
  | "Inject"
  | "Gather"
  | "Collect"
  | "AllSatisfy"
  | "AnySatisfy"
  | "Select"
  | "Detect"
  | "GetAt"
  | "Count"
  | "Slice"
  | "SetAt";

export type ListUnaryOperator = "Size" | "DetectMax" | "DetectMin" | "Flatten";

export type UnifyOperator = "Unify";

export type AssignOperator = "Assign";

export type StringBinaryOperator = "Concat";

export type UnaryOperator =
  | ArithmeticUnaryOperator
  | LogicalUnaryOperator
  | ListUnaryOperator;

export type BinaryOperator =
  | ArithmeticBinaryOperator
  | ComparisonOperatorType
  | LogicalBinaryOperator
  | BitwiseBinaryOperator
  | BitwiseUnaryOperator
  | AssignOperator
  | UnifyOperator
  | StringBinaryOperator
  | ListBinaryOperator;

export type Operator = UnaryOperator | BinaryOperator;

/**
 * Represents a unary arithmetic operation like negation (-x).
 * @category Operators
 */
export class ArithmeticUnaryOperation extends ASTNode {
    /** @hidden */
    public operand: Expression;
    /** @hidden */
    public operator: ArithmeticUnaryOperator;

  constructor(
    operator: ArithmeticUnaryOperator,
    operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.operand = operand;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitArithmeticUnaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "ArithmeticUnaryOperation",
      operator: this.operator,
      operand: this.operand,
    };
  }
}

/**
 * Represents a binary arithmetic operation like addition or multiplication.
 * @category Operators
 */
export class ArithmeticBinaryOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: ArithmeticBinaryOperator;

  constructor(
    operator: ArithmeticBinaryOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitArithmeticBinaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "ArithmeticBinaryOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}
/**
 * Represents a unary operation on a list, such as getting the head or tail.
 * @category Operators
 */
export class ListUnaryOperation extends ASTNode {
    /** @hidden */
    public operand: Expression;
    /** @hidden */
    public operator: ListUnaryOperator;

  constructor(
    operator: ListUnaryOperator,
    operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.operand = operand;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListUnaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "ListUnaryOperation",
      operator: this.operator,
      operand: this.operand,
    };
  }
}

/**
 * Represents a binary operation on lists, such as concatenation.
 * @category Operators
 */
export class ListBinaryOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: ListBinaryOperator;

  constructor(
    operator: ListBinaryOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitListBinaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "ListBinaryOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}

/**
 * Represents a comparison between two values (e.g., >, <, ==).
 * @category Operators
 */
export class ComparisonOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: ComparisonOperatorType;

  constructor(
    operator: ComparisonOperatorType,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitComparisonOperation?.(this);
  }
  public toJSON() {
    return {
      type: "ComparisonOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}

/**
 * Represents a binary logical operation like AND or OR.
 * @category Operators
 */
export class LogicalBinaryOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: LogicalBinaryOperator;

  constructor(
    operator: LogicalBinaryOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalBinaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "LogicalBinaryOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}
/**
 * Represents a unary logical operation like NOT.
 * @category Operators
 */
export class LogicalUnaryOperation extends ASTNode {
    /** @hidden */
    public operand: Expression;
    /** @hidden */
    public operator: LogicalUnaryOperator;

  constructor(
    operator: LogicalUnaryOperator,
    operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.operand = operand;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalUnaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "LogicalUnaryOperation",
      operator: this.operator,
      operand: this.operand,
    };
  }
}

/**
 * Represents a binary bitwise operation like AND, OR, XOR.
 * @category Operators
 */
export class BitwiseBinaryOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: BitwiseBinaryOperator;

  constructor(
    operator: BitwiseBinaryOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBitwiseBinaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "BitwiseBinaryOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}
/**
 * Represents a unary bitwise operation like NOT (complement).
 * @category Operators
 */
export class BitwiseUnaryOperation extends ASTNode {
    /** @hidden */
    public operand: Expression;
    /** @hidden */
    public operator: BitwiseUnaryOperator;

  constructor(
    operator: BitwiseUnaryOperator,
    operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.operand = operand;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBitwiseUnaryOperation?.(this);
  }
  public toJSON() {
    return {
      type: "BitwiseUnaryOperation",
      operator: this.operator,
      operand: this.operand,
    };
  }
}

/**
 * Represents an operation specific to string manipulation.
 * @category Operators
 */
export class StringOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: StringBinaryOperator;

  constructor(
    operator: StringBinaryOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitStringOperation?.(this);
  }
  public toJSON() {
    return {
      type: "StringOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}

/**
 * Represents a unification operation (=), fundamental to logic programming.
 *
 * @example
 * X = 5
 * @category Logic
 */
export class UnifyOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: UnifyOperator;

  constructor(
    operator: UnifyOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnifyOperation?.(this);
  }
  public toJSON() {
    return {
      type: "UnifyOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}

/**
 * Represents an in-place assignment operation (e.g., +=, -=).
 * @category Operators
 */
export class AssignOperation extends ASTNode {
    /** @hidden */
    public right: Expression;
    /** @hidden */
    public left: Expression;
    /** @hidden */
    public operator: AssignOperator;

  constructor(
    operator: AssignOperator,
    left: Expression,
    right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignOperation?.(this);
  }
  public toJSON() {
    return {
      type: "AssignOperation",
      operator: this.operator,
      left: this.left,
      right: this.right,
    };
  }
}

export type BinaryOperation =
  | ArithmeticBinaryOperation
  | StringOperation
  | ListBinaryOperation
  | LogicalBinaryOperation
  | ComparisonOperation
  | UnifyOperation
  | AssignOperation
  | BitwiseBinaryOperation;

export type UnaryOperation =
  | ArithmeticUnaryOperation
  | ListUnaryOperation
  | LogicalUnaryOperation
  | BitwiseUnaryOperation;

export type Operation = BinaryOperation | UnaryOperation;
