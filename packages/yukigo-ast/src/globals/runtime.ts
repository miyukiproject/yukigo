import { Fact, Rule } from "../paradigms/logic.js";
import { Pattern } from "./patterns.js";
import { GuardedBody, UnguardedBody } from "./statements.js";

export type SuccessLogicResult = {
  success: true;
  solutions: Map<string, PrimitiveValue>;
};
export type FailedLogicResult = {
  success: false;
};
export type LogicResult = SuccessLogicResult | FailedLogicResult;

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | null
  | void
  | PrimitiveValue[]
  | RuntimeObject
  | RuntimeClass
  | undefined;

export function isLogicResult(value: PrimitiveValue): value is LogicResult {
  return (
    value &&
    typeof value === "object" &&
    "success" in value &&
    typeof value.success === "boolean" &&
    "solutions" in value &&
    value.solutions instanceof Map
  );
}

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};

// Runtime Types

export interface RuntimePredicate {
  kind: "Fact" | "Rule" | "Predicate";
  identifier: string;
  equations: (Fact | Rule)[];
}

export const isRuntimePredicate = (
  prim: PrimitiveValue
): prim is RuntimePredicate => {
  return (
    typeof prim === "object" &&
    prim !== null &&
    "kind" in prim &&
    (prim.kind === "Fact" || prim.kind === "Rule" || prim.kind === "Predicate")
  );
};

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody;
}
/**
 * Runtime Function used in the Interpreter
 */
export interface RuntimeFunction {
  type: "Function";
  arity: number;
  identifier?: string;
  equations: EquationRuntime[];
  pendingArgs?: (PrimitiveValue | PrimitiveThunk)[]; // for partial application
  closure?: EnvStack;
}
export function isRuntimeFunction(val: PrimitiveValue): val is RuntimeFunction {
  return (
    typeof val === "object" &&
    val !== null &&
    "type" in val &&
    val.type === "Function"
  );
}

export interface RuntimeClass {
  type: "Class";
  identifier: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
  superclass?: string;
  mixins: string[];
}

export function isRuntimeClass(val: PrimitiveValue): val is RuntimeClass {
  return (
    val && typeof val === "object" && "type" in val && val.type === "Class"
  );
}

export interface RuntimeObject {
  type: "Object";
  identifier: string;
  className: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return (
    val && typeof val === "object" && "type" in val && val.type === "Object"
  );
}

export interface LazyList {
  readonly type: "LazyList";
  readonly generator: () => Generator<PrimitiveValue, void, unknown>;
}

export function isLazyList(prim: PrimitiveValue): prim is LazyList {
  return (
    prim &&
    typeof prim === "object" &&
    "type" in prim &&
    prim.type === "LazyList"
  );
}
