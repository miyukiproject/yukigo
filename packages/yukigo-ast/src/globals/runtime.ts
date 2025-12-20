import { GuardedBody, PrimitiveValue, UnguardedBody } from "./generics.js";
import { Pattern } from "./patterns.js";

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
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
  identifier: string,
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
