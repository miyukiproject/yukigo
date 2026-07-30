import { ExecutionCommand, StepCommand } from "../../components/kernel/commands.js";
import { UnsupportedOperation } from "../../errors.js";
import { boolean } from "../../utils.js";
import { Comparable, YuComparable } from "../capabilities.js";
import { YuValue } from "../YuValue.js";
import { YuBoolean } from "./YuBoolean.js";
import { YuNumber } from "./YuNumber.js";

export class YuNil extends YuValue implements Comparable {
  private static instance: YuNil;
  private constructor() { super(); }
  public static getInstance(): YuNil {
    if (!YuNil.instance) YuNil.instance = new YuNil();
    return YuNil.instance;
  }

  get isNil(): boolean { return true; }

  get asComparable(): YuComparable { return this; }

  public equals(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if(!c) return boolean(false)
    return c.equalsWithNil(this);
  }

  public equalsWithNumber(): ExecutionCommand{ return boolean(false); }
  public equalsWithBoolean(): ExecutionCommand { return boolean(false); }
  public equalsWithString(): ExecutionCommand { return boolean(false); }
  public equalsWithArray(): ExecutionCommand { return boolean(false); }
  public equalsWithNil(left: YuNil): ExecutionCommand { return boolean(true); }

  public compare(other: YuValue): ExecutionCommand {
    const c = other.asComparable;
    if (!c) throw new UnsupportedOperation(other, "compare");
    return c.compareWithNil(this);
  }

  public compareWithNumber(): ExecutionCommand { throw new UnsupportedOperation(this, "compare"); }
  public compareWithBoolean(): ExecutionCommand { throw new UnsupportedOperation(this, "compare"); }
  public compareWithString(): ExecutionCommand { throw new UnsupportedOperation(this, "compare"); }
  public compareWithArray(): ExecutionCommand { throw new UnsupportedOperation(this, "compare"); }
  public compareWithNil(): ExecutionCommand { return new StepCommand(new YuNumber(0)); }

  public toString(): string { return "nil"; }
  public toJSON(): null { return null; }
}