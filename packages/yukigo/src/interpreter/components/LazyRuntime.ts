import {
  PrimitiveValue,
  RangeExpression,
  ConsExpression,
  isLazyList,
} from "@yukigo/ast";
import { ExpressionEvaluator } from "../utils.js";

export class LazyRuntime {
  static realizeList(val: PrimitiveValue): PrimitiveValue[] {
    if (Array.isArray(val)) return val;
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
    evaluator: ExpressionEvaluator,
    config: any
  ): PrimitiveValue {
    const startVal = evaluator.evaluate(node.start);
    if (typeof startVal !== "number")
      throw new Error("Range start must be a number");

    const hasEnd = node.end != null;

    let step = 1;
    if (node.step) {
      const secondVal = evaluator.evaluate(node.step);
      if (typeof secondVal !== "number")
        throw new Error("Range step must be a number");
      step = secondVal - startVal;
      if (step === 0) throw new Error("Range step cannot be zero");
    }

    if (!hasEnd) {
      if (!config.lazyLoading)
        throw new Error("Infinite range requires lazyLoading enabled");
      return {
        type: "LazyList",
        generator: function* () {
          let current = startVal;
          while (true) {
            yield current;
            current += step;
          }
        },
      };
    }

    const endVal = evaluator.evaluate(node.end);
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
    const head = evaluator.evaluate(node.head);
    if (lazy) {
      const tail = evaluator.evaluate(node.tail);
      if (Array.isArray(tail)) return [head, ...tail];
      if (isLazyList(tail)) {
        return {
          type: "LazyList",
          generator: function* () {
            yield head;
            yield* tail.generator();
          },
        };
      }
      throw new Error(`Invalid tail type for Cons: ${typeof tail}`);
    }

    // Eager behavior
    const tail = evaluator.evaluate(node.tail);
    if (isLazyList(tail) || !Array.isArray(tail))
      throw new Error("Expected Array in eager Cons");
    return [head, ...tail];
  }
}
