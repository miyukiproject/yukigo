import {
  BooleanPrimitive,
  CharPrimitive,
  ListPrimitive,
  NilPrimitive,
  NumberPrimitive,
  PrimitiveVisitor,
  StringPrimitive,
  SymbolPrimitive,
} from "yukigo-ast";
import {
  BindCommand,
  ExecutionCommand,
  FailCommand,
  StepCommand,
} from "../kernel/commands.js";
import { Constructor, EvaluatorBase } from "./BaseEvaluator.js";
import {
  YuArray,
  YuBoolean,
  YuNil,
  YuNumber,
  YuString,
  YuValue,
} from "../../primitives/index.js";
import { InterpreterError } from "../../errors.js";

export function PrimitiveEvaluator<TBase extends Constructor<EvaluatorBase>>(
  Base: TBase,
) {
  return class extends Base implements PrimitiveVisitor<ExecutionCommand> {
    visitStringPrimitive(node: StringPrimitive): ExecutionCommand {
      return new StepCommand(new YuString(node.value));
    }
    visitListPrimitive(node: ListPrimitive): ExecutionCommand {
      if (node.value.length === 0) return new StepCommand(new YuArray([]));

      const results: YuValue[] = [];
      const evaluateNext = (index: number): ExecutionCommand => {
        if (index >= node.value.length)
          return new StepCommand(new YuArray(results));

        return new BindCommand(this.evaluate(node.value[index]), (val) => {
          results.push(val);
          return evaluateNext(index + 1);
        });
      };

      return evaluateNext(0);
    }
    visitNilPrimitive(node: NilPrimitive): ExecutionCommand {
      return new StepCommand(YuNil.getInstance());
    }
    visitSymbolPrimitive(node: SymbolPrimitive): ExecutionCommand {
      try {
        const isLogic = !!this.context.logicState;
        const isVar = /^[A-Z_]/.test(node.value);
        if (isLogic && !isVar && !this.context.isDefined(node.value)) {
          return new StepCommand(new YuString(node.value));
        }
        const val = this.context.lookup(node.value);
        return new StepCommand(val);
      } catch (error) {
        return new FailCommand(
          new InterpreterError("Symbol Lookup", (error as Error).message),
        );
      }
    }
    visitCharPrimitive(node: CharPrimitive): ExecutionCommand {
      return new StepCommand(new YuString(node.value));
    }
    visitNumberPrimitive(node: NumberPrimitive): ExecutionCommand {
      return new StepCommand(new YuNumber(node.value));
    }

    visitBooleanPrimitive(node: BooleanPrimitive): ExecutionCommand {
      return new StepCommand(new YuBoolean(node.value));
    }
  };
}
