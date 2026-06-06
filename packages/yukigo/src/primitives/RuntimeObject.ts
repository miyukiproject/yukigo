import { InterpreterError } from "../interpreter/errors.js";
import { PrimitiveValue } from "./primitives.js";
import { RuntimeClass } from "./RuntimeClass.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

type OOPMatch = {
  method: RuntimeFunction;
  holder: RuntimeObject | RuntimeClass;
};

export class RuntimeObject {
  constructor(
    public identifier: string,
    public className: string,
    public fields: Map<string, PrimitiveValue>,
    public methods: Map<string, RuntimeFunction>,
  ) {}

  public hasField(name: string): boolean {
    return this.fields.has(name);
  }

  public getField(name: string): PrimitiveValue {
    if (!this.hasField(name))
      throw new InterpreterError(
        "[ObjectRuntime]",
        `Field '${name}' not found in ${this.className}`,
      );
    return this.fields.get(name);
  }

  public setField(name: string, value: PrimitiveValue): void {
    if (!this.hasField(name))
      throw new InterpreterError(
        "[ObjectRuntime]",
        `Cannot set unknown field '${name}'`,
      );
    this.fields.set(name, value);
  }

  public getMethod(name: string): RuntimeFunction {
    if (!this.hasMethod(name))
      throw new InterpreterError(
        "[ObjectRuntime]",
        `${this.className} does not understand '${name}`,
      );
    return this.methods.get(name)!;
  }
  public hasMethod(name: string): boolean {
    return this.methods.has(name);
  }
  public createDispatchScope(match: OOPMatch, targetName: PrimitiveValue) {
    const objectScope = new Map<string, PrimitiveValue>();

    objectScope.set("self", this);
    objectScope.set("__CONTEXT_CLASS__", match.holder);
    objectScope.set("__METHOD_NAME__", targetName);
    for (const [key, val] of this.fields) objectScope.set(key, val);

    return objectScope;
  }
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return val instanceof RuntimeObject;
}
