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
  evaluate<R = PrimitiveValue>(node: ASTNode, cont: Continuation<PrimitiveValue, R>): Thunk<R>;
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
  return {
    head: new Map<string, PrimitiveValue>(),
    tail: null,
  };
}