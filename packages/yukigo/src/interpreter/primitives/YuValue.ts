import {
  ExecutionCommand,
  StepCommand,
} from "../components/kernel/commands.js";
import { boolean } from "../utils.js";
import {
  YuNumeric,
  YuSummable,
  YuSequence,
  YuLogic,
  YuComparable,
  YuStepResult,
} from "./capabilities.js";
import { YuBoolean } from "./scalars/YuBoolean.js";

/**
 * Base class for all Yukigo values.
 */
export abstract class YuValue {
  abstract toString(seen?: Set<YuValue>): string;
  abstract toJSON(keyOrSeen?: string | Set<YuValue>): unknown;

  public getType(): string {
    return this.constructor.name.replace("Yu", "");
  }

  public realize(): ExecutionCommand {
    return new StepCommand(this);
  }

  // Capability Accessors (Delegation)
  get asSummable(): YuSummable | undefined {
    return undefined;
  }
  get asNumeric(): YuNumeric | undefined {
    return undefined;
  }
  get asSequence(): YuSequence | undefined {
    return undefined;
  }
  get asLogic(): YuLogic | undefined {
    return undefined;
  }
  get asComparable(): YuComparable | undefined {
    return undefined;
  }
  get asStepResult(): YuStepResult | undefined {
    return undefined;
  }

  get isNil(): boolean {
    return false;
  }

  // Comparison
  public abstract equals(other: YuValue): ExecutionCommand;
  public abstract compare(other: YuValue): ExecutionCommand;

  public isSame(other: YuValue): ExecutionCommand {
    if (this.getType() !== other.getType())
      return boolean(false);
    return this.equals(other);
  }
}
