import { Fact, Rule } from "yukigo-ast";
import { PrimitiveValue } from "./primitives.js";

export interface RuntimePredicate {
  kind: "Fact" | "Rule" | "Predicate";
  identifier: string;
  equations: (Fact | Rule)[];
}

export const isRuntimePredicate = (
  prim: PrimitiveValue,
): prim is RuntimePredicate => {
  return (
    typeof prim === "object" &&
    prim !== null &&
    "kind" in prim &&
    (prim.kind === "Fact" || prim.kind === "Rule" || prim.kind === "Predicate")
  );
};