import { PrimitiveValue } from "./primitives.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

export interface RuntimeObject {
  type: "Object";
  identifier: string;
  className: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return (
    val !== null &&
    typeof val === "object" &&
    "type" in val &&
    val.type === "Object"
  );
}