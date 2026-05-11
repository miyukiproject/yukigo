import { PrimitiveValue } from "yukigo-ast";
import { ExecutionCommand } from "./commands.js";
import { Evaluator } from "../../utils.js";

export class YukigoKernel {
  private logicalTrace: ExecutionCommand[] = [];
  private finalResult: PrimitiveValue = undefined;

  constructor(public evaluator: Evaluator) {}

  public run(initialCommand: ExecutionCommand): PrimitiveValue {
    let current: ExecutionCommand | void = initialCommand;
    while (current) {
      this.logicalTrace.push(current);
      current = current.execute(this);
    }
    return this.finalResult;
  }

  public getLogicalTrace() {
    return this.logicalTrace;
  }
  public setFinalResult(value: PrimitiveValue) {
    this.finalResult = value;
  }

  public buildSemanticError(baseError: Error): Error {
    const enhanced = new Error(`[Yukigo VM Error] ${baseError.message}`);
    enhanced.stack = baseError.stack;
    return enhanced;
  }
}
