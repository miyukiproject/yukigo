import { SourceLocation } from "yukigo-ast";

export interface ErrorFrame {
  nodeType: string;
  loc?: SourceLocation;
}

export class InterpreterError extends Error {
  context: string;
  frames: ErrorFrame[];

  constructor(context: string, message: string, frames: ErrorFrame[] = []) {
    super(`[${context}] ${message}`);
    this.context = context;
    this.frames = frames;
  }

  pushFrame(frame: ErrorFrame) {
    this.frames.push(frame);
  }

  formatStack(): string {
    if (!this.frames.length) return "";
    const formatted = this.frames
      .map((f) => {
        const loc = f.loc ? ` (line ${f.loc.line}, col ${f.loc.column})` : "";
        return `  • ${f.nodeType}${loc}`;
      })
      .join("\n");
    return `\nTrace:\n${formatted}`;
  }

  override toString(): string {
    return `${this.message}${this.formatStack()}`;
  }
}
export class UnexpectedValue extends InterpreterError {
  constructor(ctx: string, expected: string, got: string) {
    super(ctx, `Expected ${expected} but got ${got}`);
  }
}

export class UnboundVariable extends Error {
  constructor(name: string) {
    super(`Unbound variable: ${name}`);
  }
}
