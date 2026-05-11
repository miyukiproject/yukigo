import { ASTNode, PrimitiveValue } from "yukigo-ast";

/**
 * A Continuation is a function that receives a value and decides what is the next Command to execute
 */
export type Continuation = (result: PrimitiveValue) => ExecutionCommand;

export type CommandType = "EVAL" | "STEP" | "FAIL";

export interface EvalCommand {
  readonly type: "EVAL";
  readonly node: ASTNode;
  readonly next: Continuation;
}

export interface StepCommand {
  readonly type: "STEP";
  readonly value: PrimitiveValue;
  readonly next?: Continuation;
}

export interface FailCommand {
  readonly type: "FAIL";
  readonly error: Error;
}

export type ExecutionCommand = EvalCommand | StepCommand | FailCommand;

export const Kernel = {
  eval: (node: ASTNode, next: Continuation): EvalCommand => ({
    type: "EVAL",
    node,
    next,
  }),

  step: (value: PrimitiveValue, next?: Continuation): StepCommand => ({
    type: "STEP",
    value,
    next,
  }),

  fail: (error: Error): FailCommand => ({
    type: "FAIL",
    error,
  }),
};
