import { Expression, LazyList, PrimitiveValue } from "@yukigo/ast";
import { Environment, EnvStack } from "./index.js";
import { UnboundVariable } from "./errors.js";

export interface ExpressionEvaluator {
  evaluate(node: Expression): PrimitiveValue;
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

export function createEnv(bindings: [string, PrimitiveValue][]): Environment {
  const env = new Map();
  for (const [name, value] of bindings) env.set(name, value);
  return env;
}

export function createGlobalEnv(): EnvStack {
  return [new Map<string, PrimitiveValue>()];
}

export function pushEnv(env: EnvStack, frame?: Environment): EnvStack {
  return [frame ?? new Map(), ...env];
}

export function popEnv(env: EnvStack): EnvStack {
  return env.slice(1);
}

export function lookup(env: EnvStack, name: string): PrimitiveValue {
  for (const frame of env) {
    if (frame.has(name)) return frame.get(name);
  }
  throw new UnboundVariable(name);
}

export function define(
  env: EnvStack,
  name: string,
  value: PrimitiveValue
): void {
  env[0].set(name, value);
}
