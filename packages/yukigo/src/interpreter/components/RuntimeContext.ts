import { Environment, EnvStack, PrimitiveValue } from "yukigo-ast";
import { FunctionRuntime } from "./runtimes/FunctionRuntime.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { ObjectRuntime } from "./runtimes/ObjectRuntime.js";
import { createGlobalEnv } from "../utils.js";
import { UnboundVariable } from "../errors.js";
import { inspect } from "util";

export const DefaultConfiguration: Required<InterpreterConfig> = {
  lazyLoading: false,
  debug: false,
  outputMode: "first",
  mutability: true,
};

export type LogicSearchMode = "first" | "all" | "stream";
export interface InterpreterConfig {
  lazyLoading?: boolean;
  debug?: boolean;
  outputMode?: LogicSearchMode;
  mutability?: boolean;
}

export class UninitializedConfig extends Error {
  constructor() {
    super(
      "GlobalConfig was not initialized. You must call initialize() first.",
    );
  }
}
export class ReinitializedConfig extends Error {
  constructor() {
    super(
      "GlobalConfig is already initialized. You cannot change it at execution.",
    );
  }
}

export class RuntimeContext {
  public readonly config: InterpreterConfig | null = null;
  public env: EnvStack;
  public lazyRuntime: LazyRuntime;
  public funcRuntime: FunctionRuntime;
  public objRuntime: ObjectRuntime;
  constructor(config?: InterpreterConfig) {
    this.config = Object.freeze({ ...DefaultConfiguration, ...config });
    this.lazyRuntime = new LazyRuntime(this);
    this.funcRuntime = new FunctionRuntime(this);
    this.objRuntime = new ObjectRuntime(this);
    this.env = createGlobalEnv();
  }

  public setEnv(env: EnvStack) {
    this.env = env;
  }
  public isDefined(name: string): boolean {
    let current: EnvStack | null = this.env;

    while (current !== null) {
      if (current.head.has(name)) return true;
      current = current.tail;
    }

    return false;
  }
  public pushEnv(frame: Environment = new Map()) {
    this.env = {
      head: frame,
      tail: this.env,
    };
  }
  public replace(
    name: string,
    value: PrimitiveValue,
    onReplace?: (env: Environment) => void,
  ): boolean {
    let current: EnvStack | null = this.env;

    while (current !== null) {
      if (current.head.has(name)) {
        current.head.set(name, value);
        if (onReplace) onReplace(current.head);
        return true;
      }
      current = current.tail;
    }

    return false;
  }
  public popEnv(env: EnvStack) {
    if (!env.tail)
      throw new Error(
        "Runtime Error: Cannot pop the global environment scope.",
      );
    this.env = env.tail;
  }
  public lookup(name: string): PrimitiveValue {
    let current: EnvStack | null = this.env;

    while (current !== null) {
      if (current.head.has(name)) return current.head.get(name);
      current = current.tail;
    }

    throw new UnboundVariable(name);
  }
  public remove(name: string): void {
    this.env.head.delete(name);
  }
  public define(name: string, value: PrimitiveValue): void {
    this.env.head.set(name, value);
  }
}
