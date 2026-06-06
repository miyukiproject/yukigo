import { LazyList } from "./LazyList.js";
import { LogicResult, LogicTerm } from "./LogicResult.js";
import { RuntimeClass } from "./RuntimeClass.js";
import { RuntimeFunction } from "./RuntimeFunction.js";
import { RuntimeObject } from "./RuntimeObject.js";
import { RuntimePredicate } from "./RuntimePredicate.js";

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | LogicTerm
  | null
  | void
  | PrimitiveValue[]
  | RuntimeObject
  | RuntimeClass
  | undefined;

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};
