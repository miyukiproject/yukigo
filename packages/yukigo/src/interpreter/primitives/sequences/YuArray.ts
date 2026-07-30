import { YuValue } from "../YuValue.js";
import {
  BindCommand,
  ExecutionCommand,
  StepCommand,
} from "../../components/kernel/commands.js";
import { YuNil } from "../scalars/YuNil.js";
import { UnsupportedOperation } from "../../errors.js";
import {
  Comparable,
  Sequence,
  YuComparable,
  YuSequence,
} from "../capabilities.js";
import { LazyStepResult } from "../entities/LazyList.js";
import { YuBoolean, YuNumber, YuString } from "../index.js";
import { boolean, compareResult, number, raise } from "../../utils.js";

export class YuArray extends YuValue implements Sequence, Comparable {
  constructor(
    public readonly items: YuValue[],
    public readonly index: number = 0,
  ) {
    super();
  }

  get asSequence(): YuSequence {
    return this;
  }
  get asComparable(): YuComparable {
    return this;
  }

  public *[Symbol.iterator](): Iterator<YuValue> {
    for (let i = this.index; i < this.items.length; i++) {
      yield this.items[i];
    }
  }

  public size(): ExecutionCommand {
    return number(this.items.length);
  }

  public step(): ExecutionCommand {
    if (this.index >= this.items.length) {
      return new StepCommand(YuNil.getInstance());
    }
    const item = this.items[this.index];
    const tail = new YuArray(this.items, this.index + 1);
    return new StepCommand(new LazyStepResult(item, tail));
  }

  public concat(other: YuValue): ExecutionCommand {
    const seq = other.asSequence;
    if (!seq) return raise(new UnsupportedOperation(other, "concat"));
    return seq.concatWithArray(this);
  }
  public concatWithArray(arr: YuArray): ExecutionCommand {
    return new StepCommand(new YuArray([...arr, ...this]));
  }

  public concatWithString(str: YuString): ExecutionCommand {
    return new StepCommand(new YuString(this.toJSON() + str.toJSON()));
  }

  public at(index: number) {
    return this.items[this.index + index];
  }

  public flat() {
    return new YuArray(
      [...this].flatMap((item) => {
        const seq = item.asSequence;
        return seq instanceof YuArray ? [...seq] : [item];
      }),
    );
  }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return boolean(false);
    return c.equalsWithArray(this);
  }

  public equalsWithNumber(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithBoolean(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithString(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithArray(left: YuArray): ExecutionCommand {
    return new BindCommand(left.size(), (res) => {
      const leftSize = res.asNumeric?.asComparable;
      if (!leftSize || !leftSize.equals(new YuNumber(this.items.length)))
        return boolean(false);
      const compareNext = (index: number): ExecutionCommand => {
        if (
          compareResult(
            leftSize.compare(new YuNumber(index)),
            (res) => res >= 0,
          )
        ) {
          return boolean(true);
        }
        return new BindCommand(left.at(index).equals(this.at(index)), (res) => {
          if (!res.toJSON()) return boolean(false);
          return compareNext(index + 1);
        });
      };

      return compareNext(0);
    });
  }
  public equalsWithNil(): ExecutionCommand {
    return boolean(false);
  }

  public compare(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return raise(new UnsupportedOperation(other, "compare"));
    return c.compareWithArray(this);
  }

  public compareWithNumber(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithBoolean(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithString(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithArray(left: YuArray): ExecutionCommand {
    const a = [...left];
    const b = [...this];
    const minLen = Math.min(a.length, b.length);

    const compareNext = (index: number): ExecutionCommand => {
      if (index >= minLen) {
        return new StepCommand(new YuNumber(a.length - b.length));
      }
      return new BindCommand(a[index].compare(b[index]), (res) => {
        const cmp = res.toJSON() as number;
        if (cmp !== 0) {
          return new StepCommand(res);
        }
        return compareNext(index + 1);
      });
    };

    return compareNext(0);
  }
  public compareWithNil(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }

  public toJSON(keyOrSeen?: string | Set<YuValue>): unknown {
    const seen = keyOrSeen instanceof Set ? keyOrSeen : new Set<YuValue>();
    if (seen.has(this)) return "[Circular]";
    seen.add(this);
    const result = this.index === 0
      ? this.items.map((i) => i.toJSON(seen))
      : this.items.slice(this.index).map((i) => i.toJSON(seen));
    seen.delete(this);
    return result;
  }

  public toString(seen = new Set<YuValue>()): string {
    if (seen.has(this)) return "[Circular]";
    seen.add(this);
    const result = `[${[...this].map((i) => i.toString(seen)).join(", ")}]`;
    seen.delete(this);
    return result;
  }
}
