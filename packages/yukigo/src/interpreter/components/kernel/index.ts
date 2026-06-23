import { Continuation, ExecutionCommand, StepCommand } from "./commands.js";
import { boolean, EnvStack, Evaluator } from "../../utils.js";
import { ErrorFrame, InterpreterError } from "../../errors.js";
import { YuBoolean, YuNil, YuValue } from "../../primitives/index.js";

export type LogicSearchMode = "first" | "all" | "stream";

export interface ChoicePoint {
  alternatives: ExecutionCommand[];
  continuationStack: Continuation[];
  envSnapshot: EnvStack;
}

export class YukigoKernel {
  private logicalTrace: ExecutionCommand[] = [];
  private continuationStack: Continuation[] = [];
  private choiceStack: ChoicePoint[] = [];
  private finalResult: YuValue | undefined;
  private searchExhausted = false;

  constructor(
    public readonly evaluator: Evaluator,
    private readonly mode: LogicSearchMode = "first",
  ) {}

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
  public popAndExecute(value: YuValue): ExecutionCommand | void {
    const next = this.continuationStack.pop();
    if (!next) {
      this.finalResult = value;
      return;
    }
    return next(value);
  }

  /**
   * Handles a choice point by trying the first alternative and saving the others.
   */
  public handleChoice(
    alternatives: ExecutionCommand[],
  ): ExecutionCommand | void {
    if (alternatives.length === 0) return this.handleBacktrack();

    const [first, ...rest] = alternatives;

    if (rest.length > 0) {
      this.choiceStack.push({
        alternatives: rest,
        continuationStack: [...this.continuationStack],
        envSnapshot: this.evaluator.getContext().cloneEnv(),
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
      // logic tree is empty sooo
      this.searchExhausted = true;
      this.continuationStack = [];
      return boolean(false);
    }

    this.searchExhausted = false;

    // clones the stack and environment
    this.continuationStack = [...lastChoice.continuationStack];
    const clonedEnv = this.evaluator
      .getContext()
      .cloneEnv(lastChoice.envSnapshot);
    this.evaluator.getContext().setEnv(clonedEnv);

    const [next, ...remaining] = lastChoice.alternatives;

    if (remaining.length > 0) {
      this.choiceStack.push({
        ...lastChoice,
        alternatives: remaining,
      });
    }

    return next;
  }
  // TODO: remove this f- any
  public run(initialCommand: ExecutionCommand): any {
    const stream = this.executionStream(initialCommand);

    switch (this.mode) {
      case "stream":
        return stream;
      case "first":
        const result = stream.next();
        return result.done ? undefined : result.value;
      case "all":
        return Array.from(stream);

      default:
        throw new Error(`Output mode "${this.mode}" not supported.`);
    }
  }

  private *executionStream(
    initialCommand: ExecutionCommand,
  ): Generator<YuValue, void, unknown> {
    let current: ExecutionCommand | void = initialCommand;
    this.searchExhausted = false;
    let steps = 0;

    while (current) {
      steps++;
      this.logicalTrace.push(current);
      // cleans the older traces to avoid consuming memory
      if (this.logicalTrace.length > 50) this.logicalTrace.shift();

      current = current.execute(this);

      if (!current) {
        if (this.searchExhausted) break;
        yield this.finalResult || YuNil.getInstance();
        current = this.handleBacktrack();
      }
    }
  }

  public getLogicalTrace() {
    return this.logicalTrace;
  }

  public buildSemanticError(baseError: Error): Error {
    if (baseError.constructor.name === "FailedAssert") return baseError;

    const frames = this.getStackFromTrace();

    if (baseError instanceof InterpreterError) {
      if (baseError.frames.length === 0) {
        frames.forEach((f) => baseError.pushFrame(f));
      }
      return baseError;
    }

    const newErr = new InterpreterError("Yukigo VM Error", baseError.message);
    frames.forEach((f) => newErr.pushFrame(f));
    return newErr;
  }

  private getStackFromTrace(): ErrorFrame[] {
    const frames: ErrorFrame[] = [];
    let index = this.logicalTrace.length - 1;
    // loops through logicalTrace and collects traces
    for (index; index >= 0; index--) {
      const cmd = this.logicalTrace[index];
      const trace = cmd.createTraceEntry();
      // not all commands leave traces
      if (!trace) continue;
      frames.push(trace.frame);
      if (frames.length >= 10) break;
    }
    return frames;
  }
}
