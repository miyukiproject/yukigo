import {
  BindCommand,
  ExecutionCommand,
  RaiseCommand,
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
import { error } from "../../../../yukigo/dist/interpreter/utils.js";
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
  "YuArray.find": (receiver: YuArray, args, ctx) => {
    const condition = args[0] as RuntimeFunction;
    const loop = (idx: number): ExecutionCommand => {
      const element = receiver.items[idx];
      const command = ctx.funcRuntime.apply(condition, [element]);
      return new BindCommand(command, (result) => {
        const bool = result.asLogic;
        if (!bool)
          return new RaiseCommand(
            error("YuArray.find", "condition did not return a boolean value."),
          );
        if (bool.value === true) return new StepCommand(element);

        return loop(idx + 1);
      });
    };
    return loop(0);
  },
  "YuArray.all": (receiver: YuArray, args, ctx) => {
    const condition = args[0] as RuntimeFunction;
    const loop = (idx: number): ExecutionCommand => {
      if (idx === receiver.items.length)
        return new StepCommand(new YuBoolean(true));
      const element = receiver.items[idx];
      const command = ctx.funcRuntime.apply(condition, [element]);
      return new BindCommand(command, (result) => {
        const bool = result.asLogic;
        if (!bool)
          return new RaiseCommand(
            error("YuArray.all", "condition did not return a boolean value."),
          );
        if (bool.value === false) return new StepCommand(new YuBoolean(false));

        return loop(idx + 1);
      });
    };
    return loop(0);
  },
  "YuArray.any": (receiver: YuArray, args, ctx) => {
    const condition = args[0] as RuntimeFunction;
    const loop = (idx: number): ExecutionCommand => {
      if (idx === receiver.items.length)
        return new StepCommand(new YuBoolean(false));

      const element = receiver.items[idx];
      const command = ctx.funcRuntime.apply(condition, [element]);
      return new BindCommand(command, (result) => {
        const bool = result.asLogic;
        if (!bool)
          return new RaiseCommand(
            error("YuArray.any", "condition did not return a boolean value."),
          );
        if (bool.value === true) return new StepCommand(new YuBoolean(true));

        return loop(idx + 1);
      });
    };
    return loop(0);
  },
  "YuArray.count": (receiver: YuArray, args, ctx) => {
    let count = 0;
    const condition = args[0] as RuntimeFunction;
    const loop = (idx: number): ExecutionCommand => {
      if (idx === receiver.items.length)
        return new StepCommand(new YuNumber(count));

      const element = receiver.items[idx];
      const command = ctx.funcRuntime.apply(condition, [element]);
      return new BindCommand(command, (result) => {
        const bool = result.asLogic;
        if (!bool)
          return new RaiseCommand(
            error("YuArray.any", "condition did not return a boolean value."),
          );
        if (bool.value === true) count++;

        return loop(idx + 1);
      });
    };
    return loop(0);
  },
  "YuArray.head": (receiver: YuArray, args, ctx) => {
    return new StepCommand(receiver.items[0]);
  },

  "YuArray.asSet": (receiver: YuArray) => {
    const uniqueItems: YuValue[] = [];
    const checkUnique = (itemIdx: number): ExecutionCommand => {
      if (itemIdx >= receiver.items.length) {
        return new StepCommand(new YuArray(uniqueItems));
      }
      const item = receiver.items[itemIdx];
      const checkContains = (uniqueIdx: number): ExecutionCommand => {
        if (uniqueIdx >= uniqueItems.length) {
          uniqueItems.push(item);
          return checkUnique(itemIdx + 1);
        }
        return new BindCommand(uniqueItems[uniqueIdx].equals(item), (eq) => {
          if (eq instanceof YuBoolean && eq.value) {
            return checkUnique(itemIdx + 1);
          }
          return checkContains(uniqueIdx + 1);
        });
      };
      return checkContains(0);
    };
    return checkUnique(0);
  },

  "YuArray.max": (receiver: YuArray, args, ctx) => {
    if (receiver.items.length === 0)
      throw new InterpreterError("YuArray.max", "Collection is empty");
    
    if (args.length === 1 && (args[0] instanceof RuntimeFunction || isRuntimeObject(args[0]))) {
      const closure = args[0];
      let currentMaxElement = receiver.items[0];
      let currentMaxValue: number = -Infinity;
      
      const mapAndCompare = (idx: number): ExecutionCommand => {
        if (idx >= receiver.items.length) return new StepCommand(currentMaxElement);
        
        const item = receiver.items[idx];
        const applyCmd = isRuntimeObject(closure)
          ? ctx.objRuntime.dispatch(closure, "apply", [item])
          : ctx.funcRuntime.apply(closure as RuntimeFunction, [item]);

        return new BindCommand(applyCmd, (res) => {
          if (res instanceof YuNumber) {
            if (idx === 0 || res.value > currentMaxValue) {
              currentMaxValue = res.value;
              currentMaxElement = item;
            }
            return mapAndCompare(idx + 1);
          }
          throw new InterpreterError("YuArray.max", "Closure must return a number");
        });
      };
      return mapAndCompare(0);
    } else if (args.length === 0) {
      let maxItem = receiver.items[0];
      const compareNext = (idx: number): ExecutionCommand => {
         if (idx >= receiver.items.length) return new StepCommand(maxItem);
         const item = receiver.items[idx];
         return new BindCommand(item.compare(maxItem), (cmp) => {
            if (cmp instanceof YuNumber && cmp.value > 0) {
               maxItem = item;
            }
            return compareNext(idx + 1);
         });
      };
      return compareNext(1);
    }
    throw new InterpreterError("YuArray.max", "Invalid arguments");
  },

  "YuArray.min": (receiver: YuArray, args, ctx) => {
    if (receiver.items.length === 0)
      throw new InterpreterError("YuArray.min", "Collection is empty");
    
    if (args.length === 1 && (args[0] instanceof RuntimeFunction || isRuntimeObject(args[0]))) {
      const closure = args[0];
      let currentMinElement = receiver.items[0];
      let currentMinValue: number = Infinity;
      
      const mapAndCompare = (idx: number): ExecutionCommand => {
        if (idx >= receiver.items.length) return new StepCommand(currentMinElement);
        
        const item = receiver.items[idx];
        const applyCmd = isRuntimeObject(closure)
          ? ctx.objRuntime.dispatch(closure, "apply", [item])
          : ctx.funcRuntime.apply(closure as RuntimeFunction, [item]);

        return new BindCommand(applyCmd, (res) => {
          if (res instanceof YuNumber) {
            if (idx === 0 || res.value < currentMinValue) {
              currentMinValue = res.value;
              currentMinElement = item;
            }
            return mapAndCompare(idx + 1);
          }
          throw new InterpreterError("YuArray.min", "Closure must return a number");
        });
      };
      return mapAndCompare(0);
    } else if (args.length === 0) {
      let minItem = receiver.items[0];
      const compareNext = (idx: number): ExecutionCommand => {
         if (idx >= receiver.items.length) return new StepCommand(minItem);
         const item = receiver.items[idx];
         return new BindCommand(item.compare(minItem), (cmp) => {
            if (cmp instanceof YuNumber && cmp.value < 0) {
               minItem = item;
            }
            return compareNext(idx + 1);
         });
      };
      return compareNext(1);
    }
    throw new InterpreterError("YuArray.min", "Invalid arguments");
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

  "YuString.toLowerCase": (receiver: YuString) => {
    return new StepCommand(new YuString(receiver.value.toLowerCase()));
  },

  "YuString.toUpperCase": (receiver: YuString) => {
    return new StepCommand(new YuString(receiver.value.toUpperCase()));
  },

  // ==================== RUNTIMEFUNCTION EXTENSIONS ====================
  "RuntimeFunction.apply": (receiver: RuntimeFunction, args, ctx) => {
    return ctx.funcRuntime.apply(receiver, args);
  },
};

export default nativeSpecs;
