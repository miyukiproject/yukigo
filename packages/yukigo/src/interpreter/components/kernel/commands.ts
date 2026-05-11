import { ASTNode, PrimitiveValue } from "yukigo-ast";
import { YukigoKernel } from "./index.js";

/**
 * A Continuation is a function that receives a value and decides what is the next Command to execute
 */
export type Continuation = (result: PrimitiveValue) => ExecutionCommand;

export type CommandType = "EVAL" | "STEP" | "FAIL";

export interface ExecutionCommand {
  readonly name: string;
  execute(kernel: YukigoKernel): ExecutionCommand | void;
}

export class EvalCommand implements ExecutionCommand {
  readonly name = 'EVAL';

  constructor(
    private node: ASTNode, 
    private next: Continuation
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand {
    return kernel.evaluator.evaluate(this.node, this.next);
  }
}

export class StepCommand implements ExecutionCommand {
  readonly name = 'STEP';

  constructor(
    private value: PrimitiveValue, 
    private next?: Continuation
  ) {}

  execute(kernel: YukigoKernel): ExecutionCommand | void {
    if (this.next) {
      return this.next(this.value);
    } else {
      kernel.setFinalResult(this.value);
      return; 
    }
  }
}

export class FailCommand implements ExecutionCommand {
  readonly name = 'FAIL';

  constructor(private error: Error) {}

  execute(kernel: YukigoKernel): never {
    throw kernel.buildSemanticError(this.error);
  }
}

