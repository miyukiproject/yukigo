import {
  ExecutionCommand,
  StepCommand,
} from "../../components/kernel/commands.js";
import { UnsupportedOperation } from "../../errors.js";
import { boolean } from "../../utils.js";
import { Comparable, Logic, YuComparable, YuLogic } from "../capabilities.js";
import { YuValue } from "../YuValue.js";
import { YuNumber } from "./YuNumber.js";

export class YuBoolean extends YuValue implements Logic, Comparable {
  constructor(public readonly value: boolean) {
    super();
  }

  get asLogic(): YuLogic {
    return this;
  }
  get asComparable(): YuComparable {
    return this;
  }

  public not(): ExecutionCommand {
    return boolean(!this.value);
  }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return boolean(false);
    return c.equalsWithBoolean(this);
  }

  public equalsWithNumber(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithBoolean(left: YuBoolean): ExecutionCommand {
    return boolean(left.value === this.value);
  }
  public equalsWithString(): ExecutionCommand {
    return boolean(false);
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
    return c.compareWithBoolean(this);
  }

  public compareWithNumber(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithBoolean(left: YuBoolean): ExecutionCommand {
    return new StepCommand(
      new YuNumber((left.value ? 1 : 0) - (this.value ? 1 : 0)),
    );
  }
  public compareWithString(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithArray(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }
  public compareWithNil(): ExecutionCommand {
    throw new UnsupportedOperation(this, "compare");
  }

  public toString(): string {
    return this.value.toString();
  }
  public toJSON(): boolean {
    return this.value;
  }
}
