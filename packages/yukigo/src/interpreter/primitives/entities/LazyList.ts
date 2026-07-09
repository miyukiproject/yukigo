import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "../../components/kernel/commands.js";
import { RuntimeContext } from "../../components/RuntimeContext.js";
import { InterpreterError, NotConcatenable } from "../../errors.js";
import { boolean, error, raise } from "../../utils.js";
import {
  Sequence,
  StepResult,
  YuSequence,
  YuStepResult,
} from "../capabilities.js";
import { YuBoolean } from "../index.js";
import { YuNil } from "../scalars/YuNil.js";
import { YuArray } from "../sequences/YuArray.js";
import { YuValue } from "../YuValue.js";

/**
 * Represents the result of forcing one step of a LazyList.
 * If null, the list is empty.
 */
export class LazyStepResult extends YuValue implements StepResult {
  constructor(
    public readonly head: YuValue,
    public readonly tail: YuSequence | null,
  ) {
    super();
  }

  get asStepResult(): YuStepResult {
    return this;
  }

  public equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  public compare(other: YuValue): ExecutionCommand {
    return raise(error("LazyStepResult", "Step results are not comparable"));
  }
  public toString(): string {
    return `StepResult(${this.head}, ${this.tail})`;
  }
  public toJSON(): unknown {
    return { head: this.head.toJSON(), tail: this.tail?.toJSON() };
  }
}

/**
 * A LazyList represents a potentially infinite sequence of values evaluated on demand.
 */
export class LazyList extends YuValue implements Sequence {
  // Use 'undefined' for un-evaluated, 'null' for empty list.
  private memoized: LazyStepResult | null | undefined = undefined;

  constructor(
    private readonly producer: (ctx?: RuntimeContext) => ExecutionCommand,
    public readonly identifier: string = "lazy",
    public readonly capturedContext?: RuntimeContext,
  ) {
    super();
  }

  public equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  public compare(other: YuValue): ExecutionCommand {
    return raise(error("LazyList.compare", "LazyLists are not comparable"));
  }

  get asSequence(): YuSequence {
    return this;
  }

  public *[Symbol.iterator](): Iterator<YuValue> {
    throw new Error(
      "Cannot synchronously iterate a LazyList. Use realize() or step().",
    );
  }

  /**
   * Evaluates the first element of the list and returns it along with the tail.
   */
  public step(): ExecutionCommand {
    if (this.memoized !== undefined) {
      return new StepCommand(
        this.memoized === null ? YuNil.getInstance() : this.memoized,
      );
    }

    return new BindCommand(
      this.producer(this.capturedContext),
      (result: any) => {
        if (
          result === null ||
          result === undefined ||
          result instanceof YuNil
        ) {
          this.memoized = null;
        } else if (result instanceof LazyStepResult) {
          this.memoized = result;
        } else if (result instanceof YuValue) {
          this.memoized = new LazyStepResult(result, null);
        } else {
          // Fallback for raw JS values if any still exist
          return raise(
            error("LazyList.step", "LazyList producer returned non-YuValue"),
          );
        }
        return new StepCommand(
          this.memoized === null ? YuNil.getInstance() : this.memoized,
        );
      },
    );
  }

  public size(): ExecutionCommand {
    return raise(
      error("[LazyList.size]", "Cannot calculate the length of a LazyList"),
    );
  }

  public realize(): ExecutionCommand {
    const result: YuValue[] = [];

    const next = (list: Sequence): ExecutionCommand => {
      return new BindCommand(list.step(), (stepRes) => {
        if (stepRes instanceof YuNil)
          return new StepCommand(new YuArray(result));

        if (!(stepRes instanceof LazyStepResult))
          return raise(
            error(
              "LazyList.realize",
              "LazyList step did not return LazyStepResult",
            ),
          );

        result.push(stepRes.head);
        if (stepRes.tail) {
          const tailSeq = stepRes.tail.asSequence;
          if (tailSeq) return next(tailSeq);
        }
        return new StepCommand(new YuArray(result));
      });
    };
    return next(this);
  }

  public concat(other: YuValue): ExecutionCommand {
    const rightSeq = other.asSequence;
    if (!rightSeq)
      return raise(
        error("LazyList.concat", "Cannot concatenate with a non-sequence"),
      );
    return new StepCommand(this.createLazyConcat(this, rightSeq));
  }

  public concatWithArray(arr: YuValue): ExecutionCommand {
    const leftSeq = arr.asSequence;
    if (!leftSeq) return raise(new NotConcatenable());

    return new StepCommand(this.createLazyConcat(leftSeq, this));
  }

  public concatWithString(str: YuValue): ExecutionCommand {
    const leftSeq = str.asSequence;
    if (!leftSeq) return raise(new NotConcatenable());
    return new StepCommand(this.createLazyConcat(leftSeq, this));
  }

  private createLazyConcat(left: YuSequence, right: YuSequence): LazyList {
    return new LazyList(
      (ctx) => {
        // Step through the left sequence first
        return new BindCommand(left.step(), (stepRes: YuValue) => {
          // if left is exhausted, fallback immediately to stepping the right sequence
          if (stepRes.isNil) return right.step();

          // ensure we have a valid step result
          const stepResult = stepRes.asStepResult;
          if (!stepResult)
            return raise(
              error(
                "LazyList.createLazyConcat",
                "Invalid sequence step: Expected a StepResult",
              ),
            );

          // recursively and lazily build the tail sequence
          const nextTail =
            stepResult.tail && !stepResult.tail.isNil
              ? this.createLazyConcat(stepResult.tail, right)
              : right;

          return new StepCommand(new LazyStepResult(stepResult.head, nextTail));
        });
      },
      `lazyConcat`,
      this.capturedContext,
    );
  }

  public toJSON() {
    return {
      identifier: this.identifier,
      memoized:
        this.memoized === undefined
          ? "?"
          : this.memoized === null
            ? "[]"
            : this.memoized.toJSON(),
    };
  }
  public toString(): string {
    const state =
      this.memoized === undefined ? "?" : this.memoized === null ? "[]" : "...";
    return `[LazyList ${this.identifier} ${state}]`;
  }
}

export function isLazyList(prim: unknown): prim is LazyList {
  return prim instanceof LazyList;
}
