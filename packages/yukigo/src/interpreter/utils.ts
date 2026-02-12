import {
  Expression,
  LazyList,
  PrimitiveValue,
  Environment,
  EnvStack,
  ASTNode,
} from "yukigo-ast";
import { UnboundVariable } from "./errors.js";
import { Continuation, Thunk } from "./trampoline.js";

export interface ExpressionEvaluator {
  evaluate(node: ASTNode, cont: Continuation<PrimitiveValue>): Thunk<PrimitiveValue>;
}

export function createStream(
  generator: () => Generator<PrimitiveValue, void, unknown>
): LazyList {
  return {
    type: "LazyList",
    generator,
  };
}

export function isArrayOfNumbers(arr: PrimitiveValue[]): arr is number[] {
  for (const item of arr) if (typeof item !== "number") return false;
  return true;
}

export function generateRange(
  start: number,
  end: number,
  step: number
): number[] {
  if (step === 0) throw new Error("Step cannot be zero in range expression");

  const result: number[] = [];
  let current = start;

  if (step > 0) {
    while (current <= end) {
      result.push(current);
      current += step;
    }
  } else {
    while (current >= end) {
      result.push(current);
      current += step;
    }
  }

  return result;
}
export function isDefined(env: EnvStack, name: string): boolean {
  let current: EnvStack | null = env;

  while (current !== null) {
    if (current.head.has(name)) return true;
    current = current.tail;
  }

  return false;
}

export function createEnv(bindings: [string, PrimitiveValue][]): Environment {
  const env = new Map();
  for (const [name, value] of bindings) env.set(name, value);
  return env;
}

export function createGlobalEnv(): EnvStack {
  return {
    head: new Map<string, PrimitiveValue>(),
    tail: null,
  };
}

export function pushEnv(env: EnvStack, frame?: Environment): EnvStack {
  return {
    head: frame ?? new Map(),
    tail: env,
  };
}
export function replace(
  env: EnvStack,
  name: string,
  value: PrimitiveValue,
  onReplace?: (env: Environment) => void
): boolean {
  let current: EnvStack | null = env;

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

export function popEnv(env: EnvStack): EnvStack {
  if (!env.tail)
    throw new Error("Runtime Error: Cannot pop the global environment scope.");
  return env.tail;
}

export function lookup(env: EnvStack, name: string): PrimitiveValue {
  let current: EnvStack | null = env;

  while (current !== null) {
    if (current.head.has(name)) return current.head.get(name);
    current = current.tail;
  }

  throw new UnboundVariable(name);
}

export function define(
  env: EnvStack,
  name: string,
  value: PrimitiveValue
): void {
  env.head.set(name, value);
}

export function remove(env: EnvStack, name: string): void {
  env.head.delete(name);
}
