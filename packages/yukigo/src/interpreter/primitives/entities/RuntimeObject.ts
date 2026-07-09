import {
  ExecutionCommand,
  StepCommand,
} from "../../components/kernel/commands.js";
import { InterpreterError } from "../../errors.js";
import { boolean, error, raise } from "../../utils.js";
import { YuBoolean } from "../index.js";
import { YuValue } from "../YuValue.js";
import { RuntimeClass } from "./RuntimeClass.js";
import { RuntimeFunction } from "./RuntimeFunction.js";

type OOPMatch = {
  method: RuntimeFunction;
  holder: RuntimeObject | RuntimeClass;
};

export class RuntimeObject extends YuValue {
  constructor(
    public identifier: string,
    public className: string,
    public fields: Map<string, YuValue>,
    public methods: Map<string, RuntimeFunction>,
  ) {
    super();
  }

  public equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  public compare(other: YuValue): ExecutionCommand {
    return raise(error("RuntimeClass.compare", "Objects are not comparable"));
  }

  public hasField(name: string): boolean {
    return this.fields.has(name);
  }

  public getField(name: string): YuValue {
    if (!this.hasField(name))
      throw new InterpreterError(
        "[ObjectRuntime]",
        `Field '${name}' not found in ${this.className}`,
      );
    return this.fields.get(name)!;
  }

  public setField(name: string, value: YuValue): void {
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
  public createDispatchScope(match: OOPMatch, targetName: YuValue) {
    const objectScope = new Map<string, YuValue>();

    objectScope.set("self", this);
    objectScope.set("__CONTEXT_CLASS__", match.holder);
    objectScope.set("__METHOD_NAME__", targetName);
    for (const [key, val] of this.fields) objectScope.set(key, val);

    return objectScope;
  }

  public toJSON(): unknown {
    const fieldsJSON: Record<string, unknown> = {};
    for (const [key, val] of this.fields) fieldsJSON[key] = val.toJSON();
    return {
      identifier: this.identifier,
      className: this.className,
      fields: fieldsJSON,
    };
  }

  public toString(): string {
    const fieldsArray: string[] = [];
    for (const [k, v] of this.fields.entries()) {
      fieldsArray.push(`${k}=${v ? v.toString() : "nil"}`);
    }
    const name = this.identifier || this.className || "object";
    return `${name}[${fieldsArray.join(", ")}]`;
  }
}

export function isRuntimeObject(val: YuValue): val is RuntimeObject {
  return val instanceof RuntimeObject;
}
