import {
  RangeExpression,
  ConsExpression,
} from "yukigo-ast";
import { Evaluator } from "../../utils.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "../kernel/commands.js";
import { EqualityComparer } from "../EqualityComparer.js";
import { YuValue } from "../../primitives/YuValue.js";
import { YuSequence } from "../../primitives/capabilities.js";
import { YuNil } from "../../primitives/scalars/YuNil.js";
import { YuNumber } from "../../primitives/scalars/YuNumber.js";
import { YuArray } from "../../primitives/sequences/YuArray.js";
import { YuString } from "../../primitives/sequences/YuString.js";
import { isLazyList, LazyList, LazyStepResult } from "../../primitives/entities/LazyList.js";

export class LazyRuntime {
  constructor(private context: RuntimeContext) {}

  /**
   * Realizes a list or lazy list into a YuArray.
   */
  public realizeList(val: YuValue): ExecutionCommand {
    if (this.context.config.debug) console.log(`[LazyRuntime] realizeList: input`, val);
    if (val instanceof YuNil) return new StepCommand(new YuArray([]));
    const seq = val.asSequence;
    if (seq) return seq.realize();
    throw new Error(`Expected Sequence, got ${val.getType()}`);
  }

  public evaluateRange(
    node: RangeExpression,
    evaluator: Evaluator,
  ): ExecutionCommand {
    return new BindCommand(evaluator.evaluate(node.start), (startVal) => {
      const startNum = startVal.toJSON();
      if (typeof startNum !== "number")
        throw new Error("Range start must be a number");

      const hasEnd = node.end != null;

      const finishWithStep = (step: number): ExecutionCommand => {
        const cond = (c: number, end: number) =>
          step > 0 ? c <= end : c >= end;

        const createLazyRange = (
          val: number,
          end?: number,
        ): LazyList | null => {
          if (end !== undefined && !cond(val, end)) return null;

          return new LazyList((): ExecutionCommand => {
            const tail = createLazyRange(val + step, end);
            return new StepCommand(new LazyStepResult(new YuNumber(val), tail));
          }, `Range(${val})`);
        };
        // if the list is infinite
        if (!hasEnd) {
          return new StepCommand(createLazyRange(startNum)!);
        }

        return new BindCommand(evaluator.evaluate(node.end!), (endVal) => {
          const endNum = endVal.toJSON();
          if (typeof endNum !== "number")
            throw new Error("Range end must be a number");

          if (this.context.config.lazyLoading) {
            const range = createLazyRange(startNum, endNum);
            return new StepCommand(range || YuNil.getInstance());
          }

          const result: YuValue[] = [];
          let current = startNum;
          while (cond(current, endNum)) {
            result.push(new YuNumber(current));
            current += step;
          }
          return new StepCommand(new YuArray(result));
        });
      };

      if (!node.step) return finishWithStep(1);
      return new BindCommand(evaluator.evaluate(node.step), (secondVal) => {
        const secondNum = secondVal.toJSON();
        if (typeof secondNum !== "number")
          throw new Error("Range step must be a number");
        const step = secondNum - startNum;
        if (step === 0) throw new Error("Range step cannot be zero");
        return finishWithStep(step);
      });
    });
  }

  public evaluateCons(
    node: ConsExpression,
    evaluator: Evaluator,
  ): ExecutionCommand {
    const ctx = this.context;
    if (ctx.config.lazyLoading) {
      const capturedCtx = ctx.clone();
      const conjoinedLazyList = new LazyList(() => {
        if (!capturedCtx.evaluatorFactory)
          throw new Error("EvaluatorFactory not initialized");
        
        const subEvaluator = capturedCtx.evaluatorFactory(capturedCtx);
        
        return new BindCommand(subEvaluator.evaluate(node.head), (head) => {
          return new BindCommand(subEvaluator.evaluate(node.tail), (tailRes) => {
            if (tailRes instanceof YuNil) {
              return new StepCommand(new LazyStepResult(head, null));
            }
            const tailSeq = tailRes.asSequence;
            if (tailSeq) {
                if (isLazyList(tailSeq)) 
                    return new StepCommand(new LazyStepResult(head, tailSeq));
                
                return new StepCommand(
                    new LazyStepResult(head, this.arrayToLazyList([...tailSeq]))
                );
            }
            throw new Error(`Invalid tail in cons: ${tailRes.getType()}`);
          });
        });
      }, "Cons", capturedCtx);

      return new StepCommand(conjoinedLazyList);
    }

    // Eager behavior
    return new BindCommand(evaluator.evaluate(node.head), (head) => {
      return new BindCommand(evaluator.evaluate(node.tail), (tail) => {
        if (tail instanceof YuString) return new StepCommand(new YuString(head.toJSON() + tail.toJSON()));
        const tailSeq = tail.asSequence;
        if (tailSeq instanceof YuArray) {
            return new StepCommand(new YuArray([head, ...tailSeq]));
        }
        throw new Error("Expected Array in eager Cons");
      });
    });
  }
  private arrayToLazyList(
    arr: YuValue[],
    index: number = 0,
  ): LazyList | null {
    if (index >= arr.length) return null;
    return new LazyList(() => {
      return new StepCommand(
        new LazyStepResult(arr[index], this.arrayToLazyList(arr, index + 1)),
      );
    });
  }
  public evaluateConcat(
    left: YuSequence,
    right: YuSequence,
  ): ExecutionCommand {
    if (this.context.config.lazyLoading) {
      const createConcatList = (L: YuSequence, R: YuSequence): LazyList => {
        return new LazyList(() => {
          return new BindCommand(L.step(), (stepRes) => {
            if (stepRes.isNil) return R.step();
            
            const stepResult = stepRes.asStepResult;
            if (!stepResult)
                throw new Error("Concat: step did not return StepResult");

            return new StepCommand(
              new LazyStepResult(
                stepResult.head,
                stepResult.tail && stepResult.tail instanceof YuValue
                  ? createConcatList(stepResult.tail, R)
                  : R,
              ),
            );
          });
        }, "Concat");
      };

      return new StepCommand(createConcatList(left, right));
    }

    return left.concat(right);
  }
}

