import { PrimitiveValue } from "./primitives.js";

export interface LazyList {
  readonly type: "LazyList";
  readonly generator: () => Generator<PrimitiveValue, void, unknown>;
}

export function isLazyList(prim: unknown): prim is LazyList {
  return (
    prim !== null &&
    typeof prim === "object" &&
    "type" in prim &&
    prim.type === "LazyList"
  );
}