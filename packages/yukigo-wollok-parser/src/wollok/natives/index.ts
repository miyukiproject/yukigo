import {
  BindCommand,
  ExecutionCommand,
  StepCommand,
} from "../../../../yukigo/dist/interpreter/components/kernel/commands.js";
import { RuntimeContext } from "../../../../yukigo/dist/interpreter/components/RuntimeContext.js";
import { InterpreterError } from "../../../../yukigo/dist/interpreter/errors.js";
import {
  isRuntimeObject,
  RuntimeFunction,
  YuArray,
  YuBoolean,
  YuNumber,
  YuString,
} from "../../../../yukigo/dist/interpreter/primitives/index.js";
import { YuValue } from "../../../../yukigo/dist/interpreter/primitives/YuValue.js";
import game from "./game.js";
import lang from "./lang.js";
import lib from "./lib.js";
import mirror from "./mirror.js";

export const nativeSpecs = {
  ...game,
  ...lang,
  ...lib,
  ...mirror,
};

export const CorePrimitiveExtensions: Record<
  string,
  (receiver: any, args: YuValue[], ctx: RuntimeContext) => any
> = {
  // ==================== YUARRAY EXTENSIONS ====================
  "YuArray.add": (receiver: YuArray, args) => {
    receiver.items.push(args[0]);
    return new StepCommand(receiver);
  },

  "YuArray.size": (receiver: YuArray) => {
    return new StepCommand(new YuNumber(receiver.items.length));
  },

  "YuArray.isEmpty": (receiver: YuArray) => {
    return new StepCommand(new YuBoolean(receiver.items.length === 0));
  },

  "YuArray.first": (receiver: YuArray) => {
    if (receiver.items.length === 0)
      throw new InterpreterError(
        "[ObjectRuntime.first]",
        "Collection is empty",
      );
    return new StepCommand(receiver.items[0]);
  },

  "YuArray.last": (receiver: YuArray) => {
    if (receiver.items.length === 0)
      throw new InterpreterError("[ObjectRuntime.last]", "Collection is empty");
    return new StepCommand(receiver.items[receiver.items.length - 1]);
  },

  "YuArray.remove": (receiver: YuArray, args) => {
    const removeNext = (idx: number): ExecutionCommand => {
      if (idx >= receiver.items.length) return new StepCommand(receiver);
      return new BindCommand(receiver.items[idx].equals(args[0]), (eq) => {
        if (eq instanceof YuBoolean && eq.value) {
          receiver.items.splice(idx, 1);
          return new StepCommand(receiver);
        }
        return removeNext(idx + 1);
      });
    };
    return removeNext(0);
  },

  "YuArray.contains": (receiver: YuArray, args) => {
    const checkNext = (idx: number): ExecutionCommand => {
      if (idx >= receiver.items.length)
        return new StepCommand(new YuBoolean(false));
      return new BindCommand(receiver.items[idx].equals(args[0]), (eq) => {
        if (eq instanceof YuBoolean && eq.value)
          return new StepCommand(new YuBoolean(true));
        return checkNext(idx + 1);
      });
    };
    return checkNext(0);
  },

  "YuArray.sum": (receiver: YuArray, args, ctx) => {
    const mapAndSum = (idx: number, currentSum: number): ExecutionCommand => {
      if (idx >= receiver.items.length) {
        return new StepCommand(new YuNumber(currentSum));
      }

      const item = receiver.items[idx];
      const applyCmd = isRuntimeObject(args[0])
        ? ctx.objRuntime.dispatch(args[0], "apply", [item])
        : ctx.funcRuntime.apply(args[0] as RuntimeFunction, [item]);

      // Pasamos la ejecución actual y la continuación que procesa el resultado acumulado
      return new BindCommand(applyCmd, (res) => {
        if (res instanceof YuNumber) {
          return mapAndSum(idx + 1, currentSum + res.value);
        }
        throw new Error("sum expected a number from closure");
      });
    };

    return mapAndSum(0, 0);
  },

  "YuArray.forEach": (receiver: YuArray, args, ctx) => {
    const loop = (idx: number): ExecutionCommand => {
      if (idx >= receiver.items.length) return new StepCommand(receiver);
      const item = receiver.items[idx];
      const applyCmd = isRuntimeObject(args[0])
        ? ctx.objRuntime.dispatch(args[0], "apply", [item])
        : ctx.funcRuntime.apply(args[0] as RuntimeFunction, [item]);
      return new BindCommand(applyCmd, () => loop(idx + 1));
    };
    return loop(0);
  },

  "YuArray.filter": (receiver: YuArray, args, ctx) => {
    const loop = (idx: number, filteredItems: YuValue[]): ExecutionCommand => {
      if (idx >= receiver.items.length)
        return new StepCommand(new YuArray(filteredItems));
      const item = receiver.items[idx];
      const applyCmd = isRuntimeObject(args[0])
        ? ctx.objRuntime.dispatch(args[0], "apply", [item])
        : ctx.funcRuntime.apply(args[0] as RuntimeFunction, [item]);
      return new BindCommand(applyCmd, (res) => {
        if (res instanceof YuBoolean && res.value) filteredItems.push(item);
        return loop(idx + 1, filteredItems);
      });
    };
    return loop(0, []);
  },

  "YuArray.map": (receiver: YuArray, args, ctx) => {
    const loop = (idx: number, mappedItems: YuValue[]): ExecutionCommand => {
      if (idx >= receiver.items.length)
        return new StepCommand(new YuArray(mappedItems));
      const item = receiver.items[idx];
      const applyCmd = isRuntimeObject(args[0])
        ? ctx.objRuntime.dispatch(args[0], "apply", [item])
        : ctx.funcRuntime.apply(args[0] as RuntimeFunction, [item]);
      return new BindCommand(applyCmd, (res) => {
        mappedItems.push(res);
        return loop(idx + 1, mappedItems);
      });
    };
    return loop(0, []);
  },

  // ==================== YUNUMBER EXTENSIONS ====================
  "YuNumber.abs": (receiver: YuNumber) => {
    return new StepCommand(new YuNumber(Math.abs(receiver.value)));
  },

  "YuNumber.max": (receiver: YuNumber, args) => {
    if (args[0] instanceof YuNumber) {
      return new StepCommand(
        new YuNumber(Math.max(receiver.value, args[0].value)),
      );
    }
    throw new Error("max expects a YuNumber");
  },

  "YuNumber.min": (receiver: YuNumber, args) => {
    if (args[0] instanceof YuNumber) {
      return new StepCommand(
        new YuNumber(Math.min(receiver.value, args[0].value)),
      );
    }
    throw new Error("min expects a YuNumber");
  },

  "YuNumber.times": (receiver: YuNumber, args, ctx) => {
    const loop = (countVal: number): ExecutionCommand => {
      if (countVal >= receiver.value) return new StepCommand(receiver);
      const applyCmd = isRuntimeObject(args[0])
        ? ctx.objRuntime.dispatch(args[0], "apply", [new YuNumber(countVal)])
        : ctx.funcRuntime.apply(args[0] as RuntimeFunction, [
            new YuNumber(countVal),
          ]);
      return new BindCommand(applyCmd, () => loop(countVal + 1));
    };
    return loop(0);
  },

  // ==================== YUSTRING EXTENSIONS ====================
  "YuString.contains": (receiver: YuString, args) => {
    return new StepCommand(
      new YuBoolean(receiver.value.includes(args[0].toString())),
    );
  },

  "YuString.length": (receiver: YuString) => {
    return new StepCommand(new YuNumber(receiver.value.length));
  },

  "YuString.size": (receiver: YuString) => {
    return new StepCommand(new YuNumber(receiver.value.length));
  },

  "YuString.startsWith": (receiver: YuString, args) => {
    return new StepCommand(
      new YuBoolean(receiver.value.startsWith(args[0].toString())),
    );
  },

  "YuString.endsWith": (receiver: YuString, args) => {
    return new StepCommand(
      new YuBoolean(receiver.value.endsWith(args[0].toString())),
    );
  },

  // ==================== RUNTIMEFUNCTION EXTENSIONS ====================
  "RuntimeFunction.apply": (receiver: RuntimeFunction, args, ctx) => {
    return ctx.funcRuntime.apply(receiver, args);
  },
};

export default nativeSpecs;
