import { Visitor } from "../visitor.js";
import { ASTNode, Expression, SourceLocation } from "./generics.js";

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

export class ArithmeticUnaryOperation extends ASTNode {
  constructor(
    public operator: ArithmeticUnaryOperator,
    public operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class ArithmeticBinaryOperation extends ASTNode {
  constructor(
    public operator: ArithmeticBinaryOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class ListUnaryOperation extends ASTNode {
  constructor(
    public operator: ListUnaryOperator,
    public operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class ListBinaryOperation extends ASTNode {
  constructor(
    public operator: ListBinaryOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class ComparisonOperation extends ASTNode {
  constructor(
    public operator: ComparisonOperatorType,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class LogicalBinaryOperation extends ASTNode {
  constructor(
    public operator: LogicalBinaryOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class LogicalUnaryOperation extends ASTNode {
  constructor(
    public operator: LogicalUnaryOperator,
    public operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class BitwiseBinaryOperation extends ASTNode {
  constructor(
    public operator: BitwiseBinaryOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
export class BitwiseUnaryOperation extends ASTNode {
  constructor(
    public operator: BitwiseUnaryOperator,
    public operand: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class StringOperation extends ASTNode {
  constructor(
    public operator: StringBinaryOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class UnifyOperation extends ASTNode {
  constructor(
    public operator: UnifyOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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

export class AssignOperation extends ASTNode {
  constructor(
    public operator: AssignOperator,
    public left: Expression,
    public right: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
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
