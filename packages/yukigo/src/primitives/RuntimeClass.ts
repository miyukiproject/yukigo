import { PrimitiveValue } from "./primitives.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

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
    val !== null &&
    typeof val === "object" &&
    "type" in val &&
    val.type === "Class"
  );
}
