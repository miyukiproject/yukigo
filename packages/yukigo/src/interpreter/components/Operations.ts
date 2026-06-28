import { InterpreterError } from "../errors.js";
import {
  YuNumeric,
  YuComparable,
  YuLogic,
  YuSummable,
  YuSequence,
} from "../primitives/capabilities.js";
import { YuValue, YuNumber, YuArray } from "../primitives/index.js";
import { compareResult, not, number } from "../utils.js";
import { ExecutionCommand, StepCommand } from "./kernel/commands.js";

export type UnaryOp<T extends YuValue> = (x: T) => ExecutionCommand;
export type BinaryOp<T1 extends YuValue, T2 = T1> = (
  x: T1,
  y: T2,
) => ExecutionCommand;
export type BinaryTable<T1 extends YuValue, T2 = T1> = Record<
  string,
  BinaryOp<T1, T2>
>;
export type UnaryTable<T extends YuValue> = Record<string, UnaryOp<T>>;

export const ArithmeticBinaryTable: BinaryTable<YuNumeric> = {
  Plus: (a, b) => a.plus(b),
  Minus: (a, b) => a.minus(b),
  Multiply: (a, b) => a.multiply(b),
  Divide: (a, b) => a.divide(b),
  Modulo: (a, b) => a.modulo(b),
  Power: (a, b) => a.power(b),
  Min: (a, b) => a.min(b),
  Max: (a, b) => a.max(b),
};

export const ComparisonOperationTable: BinaryTable<YuComparable> = {
  Equal: (a, b) => a.equals(b),
  NotEqual: (a, b) => not(a.equals(b)),
  Same: (a, b) => a.isSame(b),
  NotSame: (a, b) => not(a.isSame(b)),
  GreaterOrEqualThan: (a, b) => compareResult(a.compare(b), (res) => res >= 0),
  GreaterThan: (a, b) => compareResult(a.compare(b), (res) => res > 0),
  LessOrEqualThan: (a, b) => compareResult(a.compare(b), (res) => res <= 0),
  LessThan: (a, b) => compareResult(a.compare(b), (res) => res < 0),
};

export const LogicalBinaryTable: BinaryTable<YuLogic, () => ExecutionCommand> =
  {
    And: (left, rightThunk) => left.and(rightThunk),
    Or: (left, rightThunk) => left.or(rightThunk),
  };

export const StringOperationTable: BinaryTable<YuSummable> = {
  Concat: (a, b) => a.plus(b),
};

// TODO: re think bitwise things
export const BitwiseBinaryTable: BinaryTable<YuNumeric> = {
  BitwiseOr: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) | (b.toJSON() as number)),
    ),
  BitwiseAnd: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) & (b.toJSON() as number)),
    ),
  BitwiseLeftShift: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) << (b.toJSON() as number)),
    ),
  BitwiseRightShift: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) >> (b.toJSON() as number)),
    ),
  BitwiseUnsignedRightShift: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) >>> (b.toJSON() as number)),
    ),
  BitwiseXor: (a, b) =>
    new StepCommand(
      new YuNumber((a.toJSON() as number) ^ (b.toJSON() as number)),
    ),
};

export const BitwiseUnaryTable: UnaryTable<YuNumeric> = {
  BitwiseNot: (a) => number(~(a.toJSON() as number)),
};

export const LogicalUnaryTable: UnaryTable<YuLogic> = {
  Negation: (a) => a.not(),
};

export const ListBinaryTable: BinaryTable<YuSequence> = {
  Concat: (a, b) => a.concat(b),
};

export const ListUnaryTable: UnaryTable<YuSequence> = {
  Size: (a) => a.size(),
  DetectMax: (a) => {
    const items = [...a].map((i) => {
      const n = i.toJSON();
      if (typeof n !== "number") throw new Error("DetectMax requires numbers"); // TODO:make it work with chars, etc.
      return n;
    });
    return number(Math.max(...items));
  },
  DetectMin: (a) => {
    const items = [...a].map((i) => {
      const n = i.toJSON();
      if (typeof n !== "number") throw new Error("DetectMin requires numbers"); // TODO: make it work with chars, etc.
      return n;
    });
    return number(Math.min(...items));
  },
  Flatten: (a) => {
    if (!(a instanceof YuArray))
      throw new InterpreterError("[Flat operator]", "Operand must be a YuArray");
    return new StepCommand(a.flat());
  },
};

export const ArithmeticUnaryTable: UnaryTable<YuNumeric> = {
  Round: (a) => a.round(),
  Absolute: (a) => a.abs(),
  Ceil: (a) => a.ceil(),
  Floor: (a) => a.floor(),
  Negation: (a) => a.negation(),
  Sqrt: (a) => a.sqrt(),
  //ToString: (a) => a.toString(),
};
