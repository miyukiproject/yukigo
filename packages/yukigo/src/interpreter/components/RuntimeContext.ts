import { FunctionRuntime } from "./runtimes/FunctionRuntime.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { ObjectRuntime } from "./runtimes/ObjectRuntime.js";
import {
  createGlobalEnv,
  Environment,
  EnvStack,
  Evaluator,
  NativeExtension,
} from "../utils.js";
import { UnboundVariable } from "../errors.js";
import { YuValue } from "../primitives/YuValue.js";
import { YukigoHook } from "./hooks/YukigoHook.js";

export const DefaultConfiguration: InterpreterConfig = {
  nativeProviders: new Map(),
  lazyLoading: false,
  debug: false,
  outputMode: "first",
  mutability: true,
};

export type LogicSearchMode = "first" | "all" | "stream";
export interface InterpreterConfig {
  nativeProviders: Map<string, NativeExtension>;
  lazyLoading: boolean;
  debug: boolean;
  outputMode: LogicSearchMode;
  mutability: boolean;
  wrapException?: (error: any, ctx: RuntimeContext) => YuValue; // @deprecated
  hooks?: YukigoHook[];
}

export type EvaluatorFactory = (ctx: RuntimeContext) => Evaluator;

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

export interface LogicState {
  variableCounter: number;
  idToName: Map<number, string>;
}

export class RuntimeContext {
  public readonly config: InterpreterConfig = DefaultConfiguration;
  public env: EnvStack;
  public lazyRuntime: LazyRuntime;
  public funcRuntime: FunctionRuntime;
  public objRuntime: ObjectRuntime;
  public evaluatorFactory?: EvaluatorFactory;
  public logicState?: LogicState;

  public dispatchHook<K extends keyof YukigoHook>(
    eventName: K,
    ...args: Parameters<NonNullable<YukigoHook[K]>>
  ): ReturnType<NonNullable<YukigoHook[K]>>[] {
    const results: any[] = [];
    if (this.config.hooks) {
      for (const hook of this.config.hooks) {
        if (hook[eventName]) {
          results.push((hook[eventName] as Function)(...args));
        }
      }
    }
    return results;
  }

  constructor(config?: Partial<InterpreterConfig>) {
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
    value: YuValue,
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
  public popEnv() {
    if (!this.env.tail)
      throw new Error(
        "Runtime Error: Cannot pop the global environment scope.",
      );
    this.env = this.env.tail;
  }
  public lookup(name: string): YuValue {
    let current: EnvStack | null = this.env;

    while (current !== null) {
      if (current.head.has(name)) return current.head.get(name) as YuValue;
      current = current.tail;
    }

    throw new UnboundVariable(name);
  }
  public remove(name: string): void {
    this.env.head.delete(name);
  }
  public define(name: string, value: YuValue): void {
    this.env.head.set(name, value);
  }
  public defineGlobal(name: string, value: YuValue): void {
    let current = this.env;
    while (current.tail !== null) {
      current = current.tail;
    }
    current.head.set(name, value);
  }

  public cloneEnv(env?: EnvStack): EnvStack {
    const target = env ?? this.env;
    return {
      head: new Map(target.head),
      tail: target.tail ? this.cloneEnv(target.tail) : null,
    };
  }

  public clone(env?: EnvStack): RuntimeContext {
    const target = env ?? this.env;
    const newCtx = new RuntimeContext(this.config);
    newCtx.setEnv(this.cloneEnv(target));
    newCtx.logicState = this.logicState; // share logic state
    newCtx.evaluatorFactory = this.evaluatorFactory;
    return newCtx;
  }
}
