import { InterpreterError } from "../interpreter/errors.js";
import { PrimitiveValue } from "./primitives.js";
import { RuntimeFunction } from "./RuntimeFunction.js";
import { RuntimeObject } from "./RuntimeObject.js";

export class RuntimeClass {
  constructor(
    public identifier: string,
    public fields: Map<string, PrimitiveValue>,
    public methods: Map<string, RuntimeFunction>,
    public mixins: string[],
    public superclass?: string,
    private isAbstract: boolean = false,
  ) {}

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
}

export function isRuntimeClass(val: PrimitiveValue): val is RuntimeClass {
  return val instanceof RuntimeClass;
}
