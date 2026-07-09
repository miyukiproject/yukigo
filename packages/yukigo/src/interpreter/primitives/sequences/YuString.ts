import { YuValue } from "../YuValue.js";
import { YuChar } from "../scalars/YuChar.js";
import {
  ExecutionCommand,
  StepCommand,
} from "../../components/kernel/commands.js";
import { YuNil } from "../scalars/YuNil.js";
import { YuNumber } from "../scalars/YuNumber.js";
import { YuArray } from "./YuArray.js";
import { UnsupportedOperation } from "../../errors.js";
import {
  Comparable,
  Sequence,
  Summable,
  YuComparable,
  YuSequence,
  YuSummable,
} from "../capabilities.js";
import { LazyStepResult, YuBoolean } from "../index.js";
import { boolean, number, raise } from "../../utils.js";

export class YuString
  extends YuValue
  implements Sequence, Summable, Comparable
{
  constructor(
    public readonly value: string,
    public readonly index: number = 0,
  ) {
    super();
  }

  get asSequence(): YuSequence {
    return this;
  }
  get asSummable(): YuSummable {
    return this;
  }
  get asComparable(): YuComparable {
    return this;
  }

  public *[Symbol.iterator](): Iterator<YuChar> {
    for (let i = this.index; i < this.value.length; i++) {
      yield new YuChar(this.value[i]);
    }
  }

  public step(): ExecutionCommand {
    if (this.index >= this.value.length) {
      return new StepCommand(YuNil.getInstance());
    }
    const char = new YuChar(this.value[this.index]);
    const tail = new YuString(this.value, this.index + 1);
    return new StepCommand(new LazyStepResult(char, tail));
  }

  public size(): ExecutionCommand {
    return number(this.value.length)
  }


  public plus(other: YuValue): ExecutionCommand {
    const s = other.asSummable;
    if (!s) return raise(new UnsupportedOperation(other, "plus"));
    return s.plusWithString(this);
  }

  public plusWithNumber(left: YuNumber): ExecutionCommand {
    return new StepCommand(
      new YuString(left.toJSON().toString() + this.toJSON()),
    );
  }

  public plusWithString(left: YuString): ExecutionCommand {
    return new StepCommand(new YuString(left.toJSON() + this.toJSON()));
  }

  public split(): ExecutionCommand {
    const items = this.toJSON()
      .split("")
      .map((char) => new YuChar(char));
    return new StepCommand(new YuArray(items));
  }

  public concat(other: YuValue): ExecutionCommand {
    const seq = other.asSequence
    if (!seq) return raise(new UnsupportedOperation(other, "concat"));
    return seq.concatWithString(this)
  }

  public concatWithString(str: YuString): ExecutionCommand {
    return new StepCommand(new YuString(str.toJSON() + this.toJSON()));
  }
  public concatWithArray(arr: YuArray): ExecutionCommand {
    return new StepCommand(new YuString(arr.toString()));
  }

  public realize(): ExecutionCommand {
    return this.split();
  }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return boolean(false);
    return c.equalsWithString(this);
  }

  public equalsWithNumber(left: YuNumber): ExecutionCommand {
    return new StepCommand(
      new YuBoolean(left.value.toString() === this.toJSON()),
    );
  }
  public equalsWithBoolean(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithString(left: YuString): ExecutionCommand {
    return boolean(left.toJSON() === this.toJSON());
  }
  public equalsWithArray(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithNil(): ExecutionCommand {
    return boolean(false);
  }

  public compare(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return raise(new UnsupportedOperation(other, "compare"));
    return c.compareWithString(this);
  }

  public compareWithNumber(left: YuNumber): ExecutionCommand {
    return new StepCommand(new YuNumber(left.value - Number(this.toJSON())));
  }
  public compareWithBoolean(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithString(left: YuString): ExecutionCommand {
    return new StepCommand(
      new YuNumber(left.toJSON().localeCompare(this.toJSON())),
    );
  }
  public compareWithArray(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithNil(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }

  public toJSON(): string {
    return this.index === 0 ? this.value : this.value.slice(this.index);
  }

  public toString(): string {
    return this.toJSON();
  }
}
