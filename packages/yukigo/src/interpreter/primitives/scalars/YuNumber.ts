import {
  ExecutionCommand,
  StepCommand,
} from "../../components/kernel/commands.js";
import { UnsupportedOperation } from "../../errors.js";
import { boolean, number, raise } from "../../utils.js";
import {
  Comparable,
  Numeric,
  Summable,
  YuComparable,
  YuNumeric,
  YuSummable,
} from "../capabilities.js";
import { YuString } from "../sequences/YuString.js";
import { YuValue } from "../YuValue.js";

export class YuNumber extends YuValue implements Summable, Numeric, Comparable {
  constructor(public readonly value: number) {
    super();
  }

  get asSummable(): YuSummable {
    return this;
  }
  get asNumeric(): YuNumeric {
    return this;
  }
  get asComparable(): YuComparable {
    return this;
  }

  public round(): ExecutionCommand {
    return number(Math.round(this.value));
  }
  public abs(): ExecutionCommand {
    return number(Math.abs(this.value));
  }
  public ceil(): ExecutionCommand {
    return number(Math.ceil(this.value));
  }
  public floor(): ExecutionCommand {
    return number(Math.floor(this.value));
  }
  public negation(): ExecutionCommand {
    return number(this.value * -1);
  }
  public sqrt(): ExecutionCommand {
    return number(Math.sqrt(this.value));
  }

  public plus(other: YuValue): ExecutionCommand {
    const s = other.asSummable;
    if (!s) return raise(new UnsupportedOperation(other, "plus"));
    return s.plusWithNumber(this);
  }

  public plusWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value + this.value);
  }

  public plusWithString(left: YuString): ExecutionCommand {
    return new StepCommand(new YuString(left.toJSON() + this.value.toString()));
  }

  public realize(): ExecutionCommand {
    return new StepCommand(this);
  }

  public minus(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "minus"));
    return n.minusWithNumber(this);
  }

  public minusWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value - this.value);
  }

  public multiply(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "multiply"));
    return n.multiplyWithNumber(this);
  }

  public multiplyWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value * this.value);
  }

  public divide(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "divide"));
    return n.divideWithNumber(this);
  }

  public divideWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value / this.value);
  }

  public modulo(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "modulo"));
    return n.moduloWithNumber(this);
  }

  public moduloWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value % this.value);
  }
  public power(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "power"));
    return n.powerWithNumber(this);
  }

  public powerWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value ** this.value);
  }
  public min(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "power"));
    return n.minWithNumber(this);
  }

  public minWithNumber(left: YuNumber): ExecutionCommand {
    return number(Math.min(left.value, this.value));
  }
  public max(other: YuValue): ExecutionCommand {
    const n = other.asNumeric;
    if (!n) return raise(new UnsupportedOperation(other, "power"));
    return n.maxWithNumber(this);
  }

  public maxWithNumber(left: YuNumber): ExecutionCommand {
    return number(Math.max(left.value, this.value));
  }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) return boolean(false);
    return c.equalsWithNumber(this);
  }

  public equalsWithNumber(left: YuNumber): ExecutionCommand {
    return boolean(left.value === this.value);
  }
  public equalsWithBoolean(): ExecutionCommand {
    return boolean(false);
  }
  public equalsWithString(left: YuString): ExecutionCommand {
    return boolean(left.toJSON() === this.value.toString());
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
    return c.compareWithNumber(this);
  }

  public compareWithNumber(left: YuNumber): ExecutionCommand {
    return number(left.value - this.value);
  }
  public compareWithBoolean(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithString(left: YuString): ExecutionCommand {
    return number(Number(left.toJSON()) - this.value);
  }
  public compareWithArray(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }
  public compareWithNil(): ExecutionCommand {
    return raise(new UnsupportedOperation(this, "compare"));
  }

  public toString(): string {
    return this.value.toString();
  }
  public toJSON(): number {
    return this.value;
  }
}
