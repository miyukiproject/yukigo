import { ExecutionCommand, StepCommand } from "../../components/kernel/commands.js";
import { InterpreterError } from "../../errors.js";
import { boolean } from "../../utils.js";
import { YuBoolean } from "../index.js";
import { YuValue } from "../YuValue.js";
import { RuntimeFunction } from "./RuntimeFunction.js";
import { RuntimeObject } from "./RuntimeObject.js";


export class RuntimeClass extends YuValue {
  constructor(
    public identifier: string,
    public fields: Map<string, YuValue>,
    public methods: Map<string, RuntimeFunction>,
    public mixins: string[],
    public superclass?: string,
    private isAbstract: boolean = false,
  ) { super(); }

  public equals(other: YuValue): ExecutionCommand { return boolean(other === this); }
  public compare(other: YuValue): ExecutionCommand { throw new Error("Classes are not comparable"); }

  public getHierarchy(): string[] {
    const hierarchy = [...this.mixins.reverse()];
    if (this.superclass) hierarchy.push(this.superclass);
    return hierarchy;
  }
  /**
   * Creates a new instance of an Object.
   */
  public instantiate(identifier: string): RuntimeObject {
    if (this.isAbstract)
      throw new InterpreterError(
        "[ObjectRuntime]",
        `Cannot instantiate abstract class ${this.identifier}`,
      );
    return new RuntimeObject(
      identifier,
      this.identifier,
      new Map(this.fields),
      new Map(),
    );
  }

  public toJSON(): unknown {
    return {
      identifier: this.identifier,
      superclass: this.superclass,
      mixins: this.mixins,
      isAbstract: this.isAbstract,
    };
  }

  public toString(): string {
    return `[Class: ${this.identifier}]`;
  }
}

export function isRuntimeClass(val: YuValue): val is RuntimeClass {
  return val instanceof RuntimeClass;
}

