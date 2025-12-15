import { GuardedBody, PrimitiveValue, UnguardedBody } from "./generics.js";
import { Pattern } from "./patterns.js";

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody;
}

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};

/**
 * Runtime Function used in the Interpreter
 */
export interface RuntimeFunction {
  arity: number;
  identifier?: string;
  equations: EquationRuntime[];
  pendingArgs?: (PrimitiveValue | PrimitiveThunk)[]; // for partial application
  closure?: EnvStack;
}

export interface RuntimeClass {
  type: "Class";
  identifier: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
  superclass?: string;
  mixins: string[];
}

export function isRuntimeClass(val: any): val is RuntimeClass {
  return val && typeof val === "object" && val.type === "Class";
}

export interface RuntimeObject {
  type: "Object";
  className: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
}

export function isRuntimeObject(val: any): val is RuntimeObject {
  return val && typeof val === "object" && val.type === "Object";
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
