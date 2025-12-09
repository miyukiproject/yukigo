import { PrimitiveValue } from "yukigo-ast";
import { isArrayOfNumbers } from "../utils.js";

export type UnaryOp<T, R = T> = (x: T) => R;
export type BinaryOp<T, R = T> = (x: T, y: T) => R;
export type OperatorTable<T> = Record<string, T>;

export const ArithmeticBinaryTable: OperatorTable<BinaryOp<number>> = {
  Plus: (a, b) => a + b,
  Minus: (a, b) => a - b,
  Multiply: (a, b) => a * b,
  Divide: (a, b) => a / b,
  Modulo: (a, b) => a % b,
  Power: (a, b) => a ** b,
  Min: (a, b) => Math.min(a, b),
  Max: (a, b) => Math.max(a, b),
};

export const ComparisonOperationTable: OperatorTable<BinaryOp<boolean>> = {
  Equal: (a, b) => a == b,
  NotEqual: (a, b) => a != b,
  Same: (a, b) => a === b,
  NotSame: (a, b) => a !== b,
  //Similar: (a, b) => ,
  //NotSimilar: (a, b) => ,
  GreaterOrEqualThan: (a, b) => a >= b,
  GreaterThan: (a, b) => a > b,
  LessOrEqualThan: (a, b) => a <= b,
  LessThan: (a, b) => a < b,
};
export const LogicalBinaryTable: OperatorTable<
  (l: boolean, r: () => boolean) => boolean
> = {
  And: (left: boolean, rightThunk: () => boolean) => left && rightThunk(),
  Or: (left: boolean, rightThunk: () => boolean) => left || rightThunk(),
};

export const BitwiseBinaryTable: OperatorTable<BinaryOp<number>> = {
  BitwiseOr: (a, b) => a | b,
  BitwiseAnd: (a, b) => a & b,
  BitwiseLeftShift: (a, b) => a << b,
  BitwiseRightShift: (a, b) => a >> b,
  BitwiseUnsignedRightShift: (a, b) => a >>> b,
  BitwiseXor: (a, b) => a ^ b,
};

export const StringOperationTable: OperatorTable<BinaryOp<string>> = {
  Concat: (a, b) => `${a + b}`,
};

export const BitwiseUnaryTable: OperatorTable<UnaryOp<number>> = {
  BitwiseNot: (a) => ~a,
};
export const LogicalUnaryTable: OperatorTable<UnaryOp<boolean>> = {
  Negation: (a: boolean) => !a,
};
export const ListBinaryTable: OperatorTable<BinaryOp<PrimitiveValue[]>> = {
  Concat: (a, b) => a.concat(b),
};
export const ListUnaryTable: OperatorTable<UnaryOp<PrimitiveValue[], PrimitiveValue>> = {
  Size: (a: PrimitiveValue[]) => a.length,
  DetectMax: (a: PrimitiveValue[]) => {
    if (!isArrayOfNumbers(a))
      throw new Error("Operand of DetectMax must be Array of numbers");
    return Math.max(...a);
  },
  DetectMin: (a: PrimitiveValue[]) => {
    if (!isArrayOfNumbers(a))
      throw new Error("Operand of DetectMin must be Array of numbers");
    return Math.min(...a);
  },
  Flatten: (a: PrimitiveValue[]) => a.flat(),
};
export const ArithmeticUnaryTable: OperatorTable<UnaryOp<number>> = {
  Round: (a) => Math.round(a),
  Absolute: (a) => Math.abs(a),
  Ceil: (a) => Math.ceil(a),
  Floor: (a) => Math.floor(a),
  Negation: (a) => a * -1,
  Sqrt: (a) => Math.sqrt(a),
};
