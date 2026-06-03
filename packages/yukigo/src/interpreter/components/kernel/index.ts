import { EnvStack, PrimitiveValue } from "yukigo-ast";
import {
  Continuation,
  EvalCommand,
  ExecutionCommand,
  StepCommand,
} from "./commands.js";
import { Evaluator } from "../../utils.js";
import { ErrorFrame, InterpreterError } from "../../errors.js";

interface ChoicePoint {
  alternatives: ExecutionCommand[];
  continuationStack: Continuation[];
  envSnapshot: EnvStack;
}

export class YukigoKernel {
  private logicalTrace: ExecutionCommand[] = [];
  private continuationStack: Continuation[] = [];
  private choiceStack: ChoicePoint[] = [];
  private finalResult: PrimitiveValue = undefined;

  constructor(public evaluator: Evaluator) {}

  /**
   * Pushes a continuation to the logical stack.
   */
  public pushContinuation(cont: Continuation): void {
    this.continuationStack.push(cont);
  }

  /**
   * Pops a continuation from the stack and executes it with the provided value.
   * If the stack is empty, sets the final result.
   */
  public popAndExecute(value: PrimitiveValue): ExecutionCommand | void {
    const next = this.continuationStack.pop();
    if (next) {
      return next(value);
    } else {
      this.finalResult = value;
      return;
    }
  }

  /**
   * Handles a choice point by trying the first alternative and saving the others.
   */
  public handleChoice(alternatives: ExecutionCommand[]): ExecutionCommand | void {
    if (alternatives.length === 0) return this.handleBacktrack();

    const [first, ...rest] = alternatives;

    if (rest.length > 0) {
      this.choiceStack.push({
        alternatives: rest,
        continuationStack: [...this.continuationStack],
        envSnapshot: this.evaluator.getContext().clone(),
      });
    }

    return first;
  }

  /**
   * Attempts to backtrack to the last saved choice point.
   */
  public handleBacktrack(): ExecutionCommand {
    const lastChoice = this.choiceStack.pop();

    if (!lastChoice) {
      // No more choices, this is a final logic failure
      return new StepCommand(false);
    }

    // Restore state
    this.continuationStack = lastChoice.continuationStack;
    this.evaluator.getContext().setEnv(lastChoice.envSnapshot);

    const [next, ...remaining] = lastChoice.alternatives;

    if (remaining.length > 0) {
      this.choiceStack.push({
        ...lastChoice,
        alternatives: remaining,
      });
    }

    return next;
  }

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

  public buildSemanticError(baseError: Error): Error {
    if (baseError.name === "FailedAssert") return baseError;

    const frames = this.getStackFromTrace();

    if (baseError instanceof InterpreterError) {
      if (baseError.frames.length === 0) {
        frames.forEach((f) => baseError.pushFrame(f));
      }
      return baseError;
    }

    const message = baseError.message.startsWith("[Yukigo VM Error]")
      ? baseError.message
      : `[Yukigo VM Error] ${baseError.message}`;

    const enhanced = new InterpreterError("Runtime", message, frames);
    enhanced.stack = baseError.stack;
    return enhanced;
  }

  private getStackFromTrace(): ErrorFrame[] {
    const frames: ErrorFrame[] = [];
    const seen = new Set<string>();

    // We traverse backwards to find the most recent EvalCommands
    // that give context to the crash.
    for (let i = this.logicalTrace.length - 1; i >= 0; i--) {
      const cmd = this.logicalTrace[i];
      if (cmd instanceof EvalCommand) {
        const node = cmd.node;
        const key = `${node.constructor.name}-${node.loc?.line}-${node.loc?.column}`;

        if (!seen.has(key)) {
          frames.push({
            nodeType: node.constructor.name,
            loc: node.loc,
          });
          seen.add(key);
        }
      }
      if (frames.length >= 10) break;
    }

    return frames;
  }
}
