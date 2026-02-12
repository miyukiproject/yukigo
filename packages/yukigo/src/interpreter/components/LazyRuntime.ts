import {
  PrimitiveValue,
  RangeExpression,
  ConsExpression,
  isLazyList,
  ListBinaryOperation,
} from "yukigo-ast";
import { createStream, ExpressionEvaluator } from "../utils.js";
import { createMemoizedStream, isMemoizedList } from "./PatternMatcher.js";
import { idContinuation, trampoline } from "../trampoline.js";

export class LazyRuntime {
  static realizeList(val: PrimitiveValue): PrimitiveValue[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split("");
    if (isLazyList(val)) {
      const result: PrimitiveValue[] = [];
      const iter = val.generator();
      let next = iter.next();
      while (!next.done) {
        if (next.value === undefined)
          throw new Error("LazyList yielded undefined");
        result.push(next.value);
        next = iter.next();
      }
      return result;
    }
    throw new Error(`Expected List or LazyList, got ${typeof val}`);
  }

  static evaluateRange(
    node: RangeExpression,
    evaluator: ExpressionEvaluator
  ): PrimitiveValue {
    const startVal = trampoline(evaluator.evaluate(node.start, idContinuation));
    if (typeof startVal !== "number")
      throw new Error("Range start must be a number");

    const hasEnd = node.end != null;

    let step = 1;
    if (node.step) {
      const secondVal = trampoline(evaluator.evaluate(node.step, idContinuation));
      if (typeof secondVal !== "number")
        throw new Error("Range step must be a number");
      step = secondVal - startVal;
      if (step === 0) throw new Error("Range step cannot be zero");
    }

    if (!hasEnd) {
      return createMemoizedStream(function* () {
        let current = startVal;
        while (true) {
          yield current;
          current += step;
        }
      });
    }

    // eager eval
    const endVal = trampoline(evaluator.evaluate(node.end, idContinuation));
    if (typeof endVal !== "number")
      throw new Error("Range end must be a number");

    const result: number[] = [];
    let current = startVal;
    const cond = step > 0 ? () => current <= endVal : () => current >= endVal;

    while (cond()) {
      result.push(current);
      current += step;
    }
    return result;
  }

  static evaluateCons(
    node: ConsExpression,
    evaluator: ExpressionEvaluator,
    lazy: boolean
  ): PrimitiveValue {
    const head = trampoline(evaluator.evaluate(node.head, idContinuation));

    if (lazy) {
      return createMemoizedStream(function* () {
        yield head;
        const tail = trampoline(evaluator.evaluate(node.tail, idContinuation));

        if (Array.isArray(tail)) {
          for (const item of tail) yield item;
          return;
        }

        if (typeof tail === "string") {
          for (const char of tail) yield char;
          return;
        }

        if (isLazyList(tail)) {
          yield* tail.generator();
          return;
        }

        throw new Error(`Invalid tail type for Cons: ${typeof tail}`);
      });
    }

    // Eager behavior
    const tail = trampoline(evaluator.evaluate(node.tail, idContinuation));
    if (typeof tail === "string") {
      return (head as string) + tail;
    }
    if (isLazyList(tail) || !Array.isArray(tail))
      throw new Error("Expected Array in eager Cons");
    return [head, ...tail];
  }

  static evaluateConcat(
    left: PrimitiveValue,
    right: PrimitiveValue,
    lazy: boolean
  ): PrimitiveValue {
    if (lazy) {
      return createMemoizedStream(function* () {
        if (Array.isArray(left)) yield* left;
        else if (typeof left === "string") yield* left.split("");
        else if (isLazyList(left)) yield* left.generator();
        else throw new Error("Invalid left operand for lazy Concat");

        if (Array.isArray(right)) yield* right;
        else if (typeof right === "string") yield* right.split("");
        else if (isLazyList(right)) yield* right.generator();
        else throw new Error("Invalid right operand for lazy Concat");
      });
    }

    if (typeof left === "string" && typeof right === "string") return left + right;
    
    const lArr = LazyRuntime.realizeList(left);
    const rArr = LazyRuntime.realizeList(right);
    return lArr.concat(rArr);
  }

  static evaluateConcatLazy(
    node: ListBinaryOperation,
    evaluator: ExpressionEvaluator
  ): PrimitiveValue {
    return createMemoizedStream(function* () {
      const left = trampoline(evaluator.evaluate(node.left, idContinuation));
      if (Array.isArray(left)) yield* left;
      else if (typeof left === "string") yield* left.split("");
      else if (isLazyList(left)) yield* left.generator();

      const right = trampoline(evaluator.evaluate(node.right, idContinuation));
      if (Array.isArray(right)) yield* right;
      else if (typeof right === "string") yield* right.split("");
      else if (isLazyList(right)) yield* right.generator();
    });
  }
}
