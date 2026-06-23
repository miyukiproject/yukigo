import { ExecutionCommand } from "../components/kernel/commands.js";
import { YuValue } from "./YuValue.js";


/**
 * Capability for addition and concatenation.
*/
export interface Summable {
  plus(other: YuValue): ExecutionCommand; 
  plusWithNumber(left: YuValue): ExecutionCommand;
  plusWithString(left: YuValue): ExecutionCommand;
}
export type YuSummable = YuValue & Summable


/**
 * Capability for numeric operations.
*/
export interface Numeric extends Summable {
  minus(other: YuValue): ExecutionCommand;
  multiply(other: YuValue): ExecutionCommand;
  divide(other: YuValue): ExecutionCommand;
  modulo(other: YuValue): ExecutionCommand;
  power(other: YuValue): ExecutionCommand;
  min(other: YuValue): ExecutionCommand;
  max(other: YuValue): ExecutionCommand;
  
  round(): ExecutionCommand
  abs(): ExecutionCommand
  ceil(): ExecutionCommand
  floor(): ExecutionCommand
  negation(): ExecutionCommand
  sqrt(): ExecutionCommand

  minusWithNumber(left: YuValue): ExecutionCommand;
  multiplyWithNumber(left: YuValue): ExecutionCommand;
  divideWithNumber(left: YuValue): ExecutionCommand;
  moduloWithNumber(left: YuValue): ExecutionCommand;
  powerWithNumber(left: YuValue): ExecutionCommand;
  minWithNumber(left: YuValue): ExecutionCommand;
  maxWithNumber(left: YuValue): ExecutionCommand;
}

export type YuNumeric = YuValue & Numeric

/**
 * Capability for sequences.
 */
export interface Sequence {
  step(): ExecutionCommand;
  realize(): ExecutionCommand;

  size(): ExecutionCommand;

  concat(other: YuValue): ExecutionCommand;
  concatWithArray(arr: YuValue): ExecutionCommand
  concatWithString(str: YuValue): ExecutionCommand

  [Symbol.iterator](): Iterator<YuValue>;
  getType(): string;
  toJSON(): unknown;
  readonly isNil: boolean;
  readonly asStepResult?: StepResult;
}

export type YuSequence = YuValue & Sequence

/**
 * Capability for logical operations.
 */
export interface Logic {
  not(): ExecutionCommand;
  and(otherThunk: () => ExecutionCommand): ExecutionCommand;
  or(otherThunk: () => ExecutionCommand): ExecutionCommand;
  toJSON(): unknown;
}

export type YuLogic = YuValue & Logic


/**
 * Capability for comparisons.
 */
export interface Comparable {
  equals(other: YuValue): ExecutionCommand;
  compare(other: YuValue): ExecutionCommand;

  equalsWithNumber(left: YuValue): ExecutionCommand;
  equalsWithBoolean(left: YuValue): ExecutionCommand;
  equalsWithString(left: YuValue): ExecutionCommand;
  equalsWithArray(left: YuValue): ExecutionCommand;
  equalsWithNil(left: YuValue): ExecutionCommand;

  compareWithNumber(left: YuValue): ExecutionCommand;
  compareWithBoolean(left: YuValue): ExecutionCommand;
  compareWithString(left: YuValue): ExecutionCommand;
  compareWithArray(left: YuValue): ExecutionCommand;
  compareWithNil(left: YuValue): ExecutionCommand;
}

export type YuComparable = YuValue & Comparable

/**
 * Result of stepping a sequence.
 */
export interface StepResult {
  readonly head: YuValue;
  readonly tail: YuSequence | null;
}

export type YuStepResult = YuValue & StepResult
