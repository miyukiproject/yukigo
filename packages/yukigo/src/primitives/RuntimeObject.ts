import { PrimitiveValue } from "./primitives.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

export class RuntimeObject {
  constructor(
    public identifier: string,
    public className: string,
    public fields: Map<string, PrimitiveValue>,
    public methods: Map<string, RuntimeFunction>,
  ) {}
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return val instanceof RuntimeObject;
}
