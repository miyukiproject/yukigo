import { FunctionRuntime } from "./runtimes/FunctionRuntime.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { ObjectRuntime } from "./runtimes/ObjectRuntime.js";

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
  public lazyRuntime: LazyRuntime;
  public funcRuntime: FunctionRuntime;
  public objRuntime: ObjectRuntime;
  constructor(config?: InterpreterConfig) {
    this.config = Object.freeze({ ...DefaultConfiguration, ...config });
    this.lazyRuntime = new LazyRuntime(this);
    this.funcRuntime = new FunctionRuntime(this);
    this.objRuntime = new ObjectRuntime(this);
  }
}
