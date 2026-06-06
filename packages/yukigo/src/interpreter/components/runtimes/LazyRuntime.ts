import {
  RangeExpression,
  ConsExpression,
  ListBinaryOperation,
} from "yukigo-ast";
import { Evaluator } from "../../utils.js";
import {
  createMemoizedStream,
  InternalConsState,
  isMemoizedList,
} from "../PatternMatcher.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  EvalCommand,
  BindCommand,
} from "../kernel/commands.js";
import { YukigoKernel } from "../kernel/index.js";
import { PrimitiveValue } from "../../../primitives/primitives.js";
import { isLazyList, LazyList } from "../../../primitives/LazyList.js";

export class LazyRuntime {
  constructor(private context: RuntimeContext) {}

  /**
   * Realizes a list or lazy list into an array of PrimitiveValue.
   */
  public realizeList(val: PrimitiveValue): ExecutionCommand {
    if (Array.isArray(val)) return new StepCommand(val);
    if (typeof val === "string") return new StepCommand(val.split(""));
    if (isLazyList(val)) {
      const result: PrimitiveValue[] = [];
      const iter = val.generator();

      const next = (): ExecutionCommand => {
        const step = iter.next();
        if (step.done) return new StepCommand(result);
        if (step.value === undefined)
          throw new Error("LazyList yielded undefined");
        result.push(step.value);
        return next();
      };
      return next();
    }
    throw new Error(`Expected List or LazyList, got ${typeof val}`);
  }

  public evaluateRange(
    node: RangeExpression,
    evaluator: Evaluator,
  ): ExecutionCommand {
    return new BindCommand(evaluator.evaluate(node.start), (startVal) => {
      if (typeof startVal !== "number")
        throw new Error("Range start must be a number");

      const hasEnd = node.end != null;

      const finishWithStep = (step: number): ExecutionCommand => {
        if (!hasEnd) {
          return new StepCommand(
            createMemoizedStream(function* () {
              let current = startVal;
              while (true) {
                yield current;
                current += step;
              }
            }),
          );
        }

        return new BindCommand(evaluator.evaluate(node.end!), (endVal) => {
          if (typeof endVal !== "number")
            throw new Error("Range end must be a number");

          const cond =
            step > 0 ? (c: number) => c <= endVal : (c: number) => c >= endVal;

          if (this.context.config.lazyLoading) {
            return new StepCommand(
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
          return new StepCommand(result);
        });
      };

      if (node.step) {
        return new BindCommand(evaluator.evaluate(node.step), (secondVal) => {
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
    evaluator: Evaluator,
  ): ExecutionCommand {
    const ctx = this.context;
    const capturedEnv = ctx.clone().env;
    return new BindCommand(evaluator.evaluate(node.head), (head) => {
      if (ctx.config.lazyLoading) {
        const consState: InternalConsState = {
          head,
          tailExpr: node.tail,
          evaluator,
          capturedEnv,
          realizedTail: undefined,
        };

        const consList: LazyList = {
          type: "LazyList",
          generator: function* () {
            let current: any = consState;

            while (current !== undefined && current !== null) {
              if (current.tailExpr !== undefined) {
                yield current.head;

                if (current.realizedTail === undefined) {
                  const prevEnv = ctx.env;
                  ctx.setEnv(current.capturedEnv);
                  try {
                    current.realizedTail = new YukigoKernel(
                      current.evaluator,
                    ).run(new EvalCommand(current.tailExpr));
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
              } else if (
                Array.isArray(current) ||
                typeof current === "string"
              ) {
                for (const x of current) yield x;
                break;
              } else {
                throw new Error(
                  `Invalid tail type for Cons: ${typeof current}`,
                );
              }
            }
          },
        };

        const memoized = createMemoizedStream(() => consList.generator());

        memoized._consState = consState;

        return new StepCommand(memoized);
      }

      // Eager behavior
      return new BindCommand(evaluator.evaluate(node.tail), (tail) => {
        if (typeof tail === "string")
          return new StepCommand((head as string) + tail);
        if (isLazyList(tail) || !Array.isArray(tail))
          throw new Error("Expected Array in eager Cons");
        return new StepCommand([head, ...tail]);
      });
    });
  }

  public evaluateConcat(
    left: PrimitiveValue,
    right: PrimitiveValue,
  ): ExecutionCommand {
    if (this.context.config.lazyLoading) {
      return new StepCommand(
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
      return new StepCommand(left + right);

    return new BindCommand(this.realizeList(left), (lArr) => {
      return new BindCommand(this.realizeList(right), (rArr) => {
        if (!Array.isArray(lArr) || !Array.isArray(rArr))
          throw new Error(
            "[LazyRuntime] realizeList returned non-array result for Concat",
          );
        return new StepCommand(lArr.concat(rArr));
      });
    });
  }

  public evaluateConcatLazy(
    node: ListBinaryOperation,
    evaluator: Evaluator,
  ): ExecutionCommand {
    const ctx = this.context;

    return new BindCommand(evaluator.evaluate(node.left), (left) => {
      const capturedEnv = ctx.clone().env;
      return new StepCommand(
        createMemoizedStream(function* () {
          if (Array.isArray(left)) yield* left;
          else if (typeof left === "string") yield* left.split("");
          else if (isLazyList(left)) yield* left.generator();
          else throw new Error("Invalid left operand for lazy Concat");

          // right evaluates lazily on demand
          const prevEnv = ctx.env;
          ctx.setEnv(capturedEnv);
          let right: PrimitiveValue;
          try {
            const subKernel = new YukigoKernel(evaluator);
            right = subKernel.run(new EvalCommand(node.right));
          } finally {
            ctx.setEnv(prevEnv);
          }

          if (Array.isArray(right)) yield* right;
          else if (typeof right === "string") yield* right.split("");
          else if (isLazyList(right)) yield* right.generator();
          else throw new Error("Invalid right operand for lazy Concat");
        }),
      );
    });
  }

  public deepEqual(a: PrimitiveValue, b: PrimitiveValue): ExecutionCommand {
    if (a === b) return new StepCommand(true);

    const aIsListLike = this.isListLike(a);
    const bIsListLike = this.isListLike(b);
    const eitherIsCollection = this.isCollection(a) || this.isCollection(b);

    if (eitherIsCollection && aIsListLike && bIsListLike) {
      return new BindCommand(
        this.realizeList(a),
        (valA) =>
          new BindCommand(this.realizeList(b), (valB) => {
            if (!Array.isArray(valA) || !Array.isArray(valB))
              throw new Error(
                "[LazyRuntime] realizeList returned non-array result for deepEqual",
              );
            if (valA.length !== valB.length) return new StepCommand(false);
            return this.deepEqualCollection(valA, valB, 0);
          }),
      );
    }

    if (eitherIsCollection) return new StepCommand(false); // colección vs número → false

    if (this.isPlainObject(a) && this.isPlainObject(b))
      return this.deepEqualObject(a, b);

    return new StepCommand(a == b); // primitivos: number, boolean, string==number
  }
  private isPlainObject(val: unknown): val is Record<string, any> {
    return (
      val !== null &&
      typeof val === "object" &&
      !isLazyList(val) &&
      !Array.isArray(val)
    );
  }
  private isCollection(val: unknown): val is PrimitiveValue[] | LazyList {
    return Array.isArray(val) || isLazyList(val);
  }

  private isListLike(
    val: unknown,
  ): val is string | PrimitiveValue[] | LazyList {
    return Array.isArray(val) || isLazyList(val) || typeof val === "string";
  }
  private deepEqualCollection(
    a: PrimitiveValue[],
    b: PrimitiveValue[],
    index: number,
  ): ExecutionCommand {
    if (index >= a.length) return new StepCommand(true);
    return new BindCommand(this.deepEqual(a[index], b[index]), (eq) => {
      if (!eq) return new StepCommand(false);
      return this.deepEqualCollection(a, b, index + 1);
    });
  }

  private deepEqualObject(
    a: Record<string, any>,
    b: Record<string, any>,
  ): ExecutionCommand {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return new StepCommand(false);
    const checkNext = (index: number): ExecutionCommand => {
      if (index >= keys.length) return new StepCommand(true);
      const key = keys[index];
      return new BindCommand(this.deepEqual(a[key], b[key]), (eq) => {
        if (!eq) return new StepCommand(false);
        return checkNext(index + 1);
      });
    };
    return checkNext(0);
  }
}
