import {
  RangeExpression,
  ConsExpression,
  ListBinaryOperation,
} from "yukigo-ast";
import { ExpressionEvaluator } from "../../utils.js";
import {
  createMemoizedStream,
  InternalConsState,
  isMemoizedList,
} from "../PatternMatcher.js";
import {
  Continuation,
  idContinuation,
  Thunk,
  trampoline,
} from "../../trampoline.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { isLazyList, LazyList, PrimitiveValue } from "../../entities.js";

export class LazyRuntime {
  constructor(private context: RuntimeContext) {}

  public realizeList<R = PrimitiveValue[]>(
    val: PrimitiveValue,
    k: Continuation<PrimitiveValue[], R>,
  ): Thunk<R> {
    if (Array.isArray(val)) return k(val);
    if (typeof val === "string") return k(val.split(""));
    if (isLazyList(val)) {
      const result: PrimitiveValue[] = [];
      const iter = val.generator();

      const next = (): Thunk<R> => {
        const step = iter.next();
        if (step.done) return k(result);
        if (step.value === undefined)
          throw new Error("LazyList yielded undefined");
        result.push(step.value);
        return () => next();
      };
      return next();
    }
    throw new Error(`Expected List or LazyList, got ${typeof val}`);
  }

  public evaluateRange(
    node: RangeExpression,
    evaluator: ExpressionEvaluator,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    return evaluator.evaluate(node.start, (startVal) => {
      if (typeof startVal !== "number")
        throw new Error("Range start must be a number");

      const hasEnd = node.end != null;

      const finishWithStep = (step: number): Thunk<PrimitiveValue> => {
        if (!hasEnd) {
          return k(
            createMemoizedStream(function* () {
              let current = startVal;
              while (true) {
                yield current;
                current += step;
              }
            }),
          );
        }

        return evaluator.evaluate(node.end!, (endVal) => {
          if (typeof endVal !== "number")
            throw new Error("Range end must be a number");

          const cond =
            step > 0 ? (c: number) => c <= endVal : (c: number) => c >= endVal;

          if (this.context.config.lazyLoading) {
            return k(
              createMemoizedStream(function* () {
                let current = startVal;
                while (cond(current)) {
                  yield current;
                  current += step;
                }
              }),
            );
          }

          const result: number[] = [];
          let current = startVal;
          while (cond(current)) {
            result.push(current);
            current += step;
          }
          return k(result);
        });
      };

      if (node.step) {
        return evaluator.evaluate(node.step, (secondVal) => {
          if (typeof secondVal !== "number")
            throw new Error("Range step must be a number");
          const step = secondVal - startVal;
          if (step === 0) throw new Error("Range step cannot be zero");
          return finishWithStep(step);
        });
      }

      return finishWithStep(1);
    });
  }

  public evaluateCons(
    node: ConsExpression,
    evaluator: ExpressionEvaluator,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    const capturedEnv = this.context.env;
    const ctx = this.context;
    return evaluator.evaluate(node.head, (head) => {
      if (this.context.config.lazyLoading) {
        const consState: InternalConsState = {
          head,
          tailExpr: node.tail,
          evaluator,
          realizedTail: undefined,
        };

        const generator = function* () {
          let current: any = consState;

          while (current !== undefined && current !== null) {
            if (current.tailExpr !== undefined) {
              yield current.head;

              if (current.realizedTail === undefined) {
                const prevEnv = ctx.env;
                ctx.setEnv(capturedEnv);
                try {
                  current.realizedTail = trampoline(
                    current.evaluator.evaluate(
                      current.tailExpr,
                      idContinuation,
                    ),
                  );
                } finally {
                  ctx.setEnv(prevEnv);
                }
              }
              current = current.realizedTail;
            } else if (isLazyList(current)) {
              const memoized = current;
              if (isMemoizedList(memoized) && memoized._consState) {
                current = memoized._consState;
              } else {
                const iter = current.generator();
                let step = iter.next();
                while (!step.done) {
                  yield step.value;
                  step = iter.next();
                }
                break;
              }
            } else if (Array.isArray(current) || typeof current === "string") {
              for (const x of current) yield x;
              break;
            } else {
              throw new Error(`Invalid tail type for Cons: ${typeof current}`);
            }
          }
        };
        const consList: LazyList = new LazyList(generator);

        const memoized = createMemoizedStream(() => consList.generator());

        memoized._consState = consState;

        return k(memoized);
      }

      // Eager behavior
      return evaluator.evaluate(node.tail, (tail) => {
        if (typeof tail === "string") return k((head as string) + tail);
        if (isLazyList(tail) || !Array.isArray(tail))
          throw new Error("Expected Array in eager Cons");
        return k([head, ...tail]);
      });
    });
  }

  public evaluateConcat(
    left: PrimitiveValue,
    right: PrimitiveValue,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    if (this.context.config.lazyLoading) {
      return k(
        createMemoizedStream(function* () {
          if (Array.isArray(left)) yield* left;
          else if (typeof left === "string") yield* (left as string).split("");
          else if (isLazyList(left)) yield* left.generator();
          else throw new Error("Invalid left operand for lazy Concat");

          if (Array.isArray(right)) yield* right;
          else if (typeof right === "string")
            yield* (right as string).split("");
          else if (isLazyList(right)) yield* right.generator();
          else throw new Error("Invalid right operand for lazy Concat");
        }),
      );
    }

    if (typeof left === "string" && typeof right === "string")
      return k(left + right);

    return this.realizeList(left, (lArr) => {
      return () =>
        this.realizeList(right, (rArr) => {
          return k(lArr.concat(rArr));
        });
    });
  }

  public evaluateConcatLazy(
    node: ListBinaryOperation,
    evaluator: ExpressionEvaluator,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    const capturedEnv = this.context.env;
    const ctx = this.context;
    return k(
      createMemoizedStream(function* () {
        const prevEnv = ctx.env;
        ctx.setEnv(capturedEnv);
        try {
          const left = trampoline(
            evaluator.evaluate(node.left, idContinuation),
          );
          if (Array.isArray(left)) yield* left;
          else if (typeof left === "string") yield* left.split("");
          else if (isLazyList(left)) yield* left.generator();

          const right = trampoline(
            evaluator.evaluate(node.right, idContinuation),
          );
          if (Array.isArray(right)) yield* right;
          else if (typeof right === "string") yield* right.split("");
          else if (isLazyList(right)) yield* right.generator();
        } finally {
          ctx.setEnv(prevEnv);
        }
      }),
    );
  }
  public deepEqual<R = boolean>(
    a: PrimitiveValue,
    b: PrimitiveValue,
    k: Continuation<boolean, R>,
  ): Thunk<R> {
    if (a === b) return k(true);

    const compareValues = (valA: any, valB: any): Thunk<R> => {
      if (typeof valA === "string" && typeof valB === "string")
        return k(valA === valB);

      if (Array.isArray(valA) && Array.isArray(valB)) {
        if (valA.length !== valB.length) return k(false);
        const compareNext = (index: number): Thunk<R> => {
          if (index >= valA.length) return k(true);
          return () =>
            this.deepEqual(valA[index], valB[index], (isEqual) => {
              if (!isEqual) return k(false);
              return () => compareNext(index + 1);
            });
        };
        return compareNext(0);
      }

      return k(valA == valB);
    };

    if (isLazyList(a) || isLazyList(b)) {
      return this.realizeList(a, (valA) => {
        return () =>
          this.realizeList(b, (valB) => {
            return () => compareValues(valA, valB);
          });
      });
    }

    return compareValues(a, b);
  }
}
