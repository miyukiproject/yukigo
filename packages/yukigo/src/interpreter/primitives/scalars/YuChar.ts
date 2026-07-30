import { ExecutionCommand, StepCommand } from "../../components/kernel/commands.js";
import { UnsupportedOperation } from "../../errors.js";
import { boolean } from "../../utils.js";
import { Comparable, Summable, YuComparable, YuSummable } from "../capabilities.js";
import { YuString } from "../sequences/YuString.js";
import { YuValue } from "../YuValue.js";
import { YuBoolean } from "./YuBoolean.js";
import { YuNumber } from "./YuNumber.js";

export class YuChar extends YuValue implements Comparable, Summable {
  constructor(public readonly value: string) {
    super();
    if (value.length !== 1)
      throw new Error("YuChar must be a single character");
  }

  get asSummable(): YuSummable {
    return this;
  }
  get asComparable(): YuComparable {
    return this;
  }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if(!c) return boolean(false)
    return c.equalsWithString(this);
  }

  public equalsWithNumber(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithBoolean(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithString(left: YuString): ExecutionCommand {
    return boolean(left.toJSON() === this.value);
  }
  public equalsWithArray(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithNil(): ExecutionCommand {
    return boolean(false);
  }

  public compare(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) throw new UnsupportedOperation(other, "compare");
    return c.compareWithString(new YuString(this.value));
  }

  public compareWithNumber(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithBoolean(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithString(left: YuString): ExecutionCommand {
    return new StepCommand(new YuNumber(left.toJSON().localeCompare(this.value)));
  }
  public compareWithArray(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithNil(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }

  public plus(other: YuValue): ExecutionCommand {
    return new StepCommand(new YuString(this.value + other.toString()));
  }
  public plusWithNumber(left: YuNumber): ExecutionCommand {
    return new StepCommand(new YuString(left.toJSON().toString() + this.value));
  }
  public plusWithString(left: YuString): ExecutionCommand {
    return new StepCommand(new YuString(left.toJSON() + this.value));
  }

  public toString(): string {
    return this.value;
  }
  public toJSON(): string {
    return this.value;
  }
}
