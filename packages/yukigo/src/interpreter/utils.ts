import { ASTNode } from "yukigo-ast";
import {
  BindCommand,
  ExecutionCommand,
  RaiseCommand,
  StepCommand,
} from "./components/kernel/commands.js";
import { RuntimeContext } from "./components/RuntimeContext.js";
import { YuValue, YuNumber, LazyList, YuBoolean } from "./primitives/index.js";
import { InterpreterError } from "./errors.js";

export const raise = (err: InterpreterError): RaiseCommand =>
  new RaiseCommand(err);

export const error = (ctx: string, msg: string): InterpreterError =>
  new InterpreterError(ctx, msg);

export const boolean = (condition: boolean) =>
  new StepCommand(new YuBoolean(condition));
export const number = (num: number) => {
  const rounded = Math.round(num * 100000) / 100000;
  return new StepCommand(new YuNumber(rounded));
};

export const not = (command: ExecutionCommand): ExecutionCommand =>
  new BindCommand(command, (res) => res.asLogic?.not() || boolean(false));

export const isTrue = (val: unknown): boolean =>
  val instanceof YuBoolean && val.value;

export const compareResult = (
  command: ExecutionCommand,
  predicate: (num: number) => boolean,
): ExecutionCommand =>
  new BindCommand(command, (res) => boolean(predicate(res.toJSON() as number)));

export type NativeExtension = (
  self: YuValue,
  args: YuValue[],
  ctx: RuntimeContext,
) => ExecutionCommand;

export type PrimitiveThunk = () => YuValue;

export type Environment = Map<string, YuValue>;

export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};

export function isArrayOfNumbers(arr: YuValue): boolean {
  const seq = arr.asSequence;
  if (!seq) return false;
  for (const item of seq) {
    if (!item.asNumeric) return false;
  }
  return true;
}

export function generateRange(
  start: number,
  end: number,
  step: number,
): YuNumber[] {
  if (step === 0) throw new Error("Step cannot be zero in range expression");

  const result: YuNumber[] = [];
  let current = start;

  if (step > 0) {
    while (current <= end) {
      result.push(new YuNumber(current));
      current += step;
    }
  } else {
    while (current >= end) {
      result.push(new YuNumber(current));
      current += step;
    }
  }

  return result;
}

export function createEnv(bindings: [string, YuValue][]): Environment {
  const env = new Map<string, YuValue>();
  for (const [name, value] of bindings) env.set(name, value);
  return env;
}

export function createGlobalEnv(): EnvStack {
  return {
    head: new Map<string, YuValue>(),
    tail: null,
  };
}

export function getYukigoType(val: YuValue): string {
  return val.getType();
}

export function createStream(generator: () => ExecutionCommand): LazyList {
  return new LazyList(() => generator());
}
