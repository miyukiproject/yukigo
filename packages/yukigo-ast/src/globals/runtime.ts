import { GuardedBody, PrimitiveValue, UnguardedBody } from "./generics.js";
import { Pattern } from "./patterns.js";

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody;
}

export type PrimitiveThunk = () => PrimitiveValue;

/**
 * Runtime Function used in the Interpreter
 */
export interface RuntimeFunction {
  arity: number;
  identifier?: string;
  equations: EquationRuntime[];
  pendingArgs?: (PrimitiveValue | PrimitiveThunk)[]; // for partial application
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
