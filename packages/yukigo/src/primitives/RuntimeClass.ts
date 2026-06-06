import { PrimitiveValue } from "./primitives.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

export class RuntimeClass {
  constructor(
    public identifier: string,
    public fields: Map<string, PrimitiveValue>,
    public methods: Map<string, RuntimeFunction>,
    public mixins: string[],
    public superclass?: string,
  ) {}
}

export function isRuntimeClass(val: PrimitiveValue): val is RuntimeClass {
  return val instanceof RuntimeClass;
}
