import { ASTNode } from "yukigo-ast";
import { Continuation, Thunk } from "./trampoline.js";
import {
  Environment,
  EnvStack,
  isLazyList,
  isRuntimeClass,
  isRuntimeFunction,
  isRuntimeObject,
  isRuntimePredicate,
  LazyGenerator,
  LazyList,
  PrimitiveValue,
} from "./entities.js";

export interface ExpressionEvaluator {
  evaluate<R = PrimitiveValue>(
    node: ASTNode,
    cont: Continuation<PrimitiveValue, R>,
  ): Thunk<R>;
}

export function createStream(generator: LazyGenerator): LazyList {
  return new LazyList(generator);
}

export function isArrayOfNumbers(arr: PrimitiveValue[]): arr is number[] {
  for (const item of arr) if (typeof item !== "number") return false;
  return true;
}

export function generateRange(
  start: number,
  end: number,
  step: number,
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
  return {
    head: new Map<string, PrimitiveValue>(),
    tail: null,
  };
}

export function getYukigoType(val: PrimitiveValue): string {
  if (val === null || val === undefined) return "YuNil";
  if (typeof val === "number") return "YuNumber";
  if (typeof val === "boolean") return "YuBoolean";
  if (typeof val === "string") return val.length === 1 ? "YuChar" : "YuString";
  if (Array.isArray(val) || isLazyList(val)) return "YuList";
  if (isRuntimeFunction(val)) return "YuFunction";
  if (isRuntimeObject(val)) return "YuObject";
  if (isRuntimeClass(val)) return "YuClass";
  if (isRuntimePredicate(val)) return "YuPredicate";
  return "YuUnknown";
}
