import { Sequence } from "../primitives/capabilities.js";
import { YuBoolean } from "../primitives/scalars/YuBoolean.js";
import { YuValue } from "../primitives/YuValue.js";
import { boolean, isTrue } from "../utils.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "./kernel/commands.js";

/**
 * Utility to perform deep equality checks between YuValues,
 * including lazy sequences, using polymorphic capabilities.
 */
export class EqualityComparer {
  /**
   * Performs a deep equality check between two values.
   * If both are sequences, they are compared element by element lazily.
   */
  public static compare(a: YuValue, b: YuValue): ExecutionCommand {
    const seqA = a.asSequence;
    const seqB = b.asSequence;

    if (seqA && seqB) {
      return this.compareSequences(seqA, seqB);
    }

    const compA = a.asComparable;
    if (compA) return compA.equals(b);

    return boolean(a === b);
  }

  private static compareSequences(
    sA: Sequence | null,
    sB: Sequence | null,
  ): ExecutionCommand {
    if (!sA && !sB) return boolean(true);

    // If one is null, the other must be empty to be equal
    if (!sA) {
      return new BindCommand(sB!.step(), (resB: YuValue) =>
        boolean(resB.isNil),
      );
    }
    if (!sB) {
      return new BindCommand(sA!.step(), (resA: YuValue) =>
        boolean(resA.isNil),
      );
    }

    return new BindCommand(sA.step(), (resA: YuValue) => {
      return new BindCommand(sB.step(), (resB: YuValue) => {
        // Use polymorphism (isNil) instead of instanceof YuNil
        if (resA.isNil && resB.isNil) return boolean(true);

        if (resA.isNil || resB.isNil) return boolean(false);

        // Use polymorphism (asStepResult) instead of instanceof LazyStepResult
        const stepResA = resA.asStepResult;
        const stepResB = resB.asStepResult;

        if (!stepResA || !stepResB) return boolean(false);

        // Compare heads recursively
        return new BindCommand(
          this.compare(stepResA.head as YuValue, stepResB.head as YuValue),
          (headsEqual) => {
            const areHeadsEqual = isTrue(headsEqual);
            if (!areHeadsEqual) return boolean(false);

            // Compare tails
            return this.compareSequences(stepResA.tail, stepResB.tail);
          },
        );
      });
    });
  }
}
