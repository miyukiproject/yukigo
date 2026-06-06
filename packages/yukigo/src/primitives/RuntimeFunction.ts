import { GuardedBody, Pattern, UnguardedBody } from "yukigo-ast";
import { EnvStack, PrimitiveThunk, PrimitiveValue } from "./primitives.js";

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody;
}
/**
 * Runtime Function used in the Interpreter
 */
export class RuntimeFunction {
  constructor(
    public arity: number,
    public equations: EquationRuntime[],
    public identifier?: string,
    public pendingArgs?: (PrimitiveValue | PrimitiveThunk)[],
    public closure?: EnvStack,
  ) {}

  public get name(): string {
    return this.identifier ?? "<anonymous>";
  }

  public get remainingArity(): number {
    return this.arity - (this.pendingArgs?.length ?? 0);
  }

  public get isFullyApplied(): boolean {
    return this.remainingArity <= 0;
  }

  public get hasPendingArgs(): boolean {
    return (this.pendingArgs?.length ?? 0) > 0;
  }

  /**
   * Partially applies the function with new arguments.
   */
  public bind(...args: (PrimitiveValue | PrimitiveThunk)[]): RuntimeFunction {
    return new RuntimeFunction(
      this.arity,
      this.equations,
      this.identifier,
      [...(this.pendingArgs ?? []), ...args],
      this.closure,
    );
  }

  /**
   * Returns a new RuntimeFunction with the given closure.
   */
  public withClosure(closure: EnvStack): RuntimeFunction {
    return new RuntimeFunction(
      this.arity,
      this.equations,
      this.identifier,
      this.pendingArgs,
      closure,
    );
  }

  /**
   * Evaluates all pending arguments (resolving thunks).
   */
  public getEvaluatedArgs(): PrimitiveValue[] {
    return (this.pendingArgs ?? []).map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );
  }

  public toString(): string {
    const arityInfo = this.arity > 0 ? `/${this.arity}` : "";
    const pendingInfo = this.hasPendingArgs
      ? ` (applied ${this.pendingArgs!.length})`
      : "";
    return `[Function: ${this.name}${arityInfo}${pendingInfo}]`;
  }
}
export function isRuntimeFunction(val: PrimitiveValue): val is RuntimeFunction {
  return val instanceof RuntimeFunction;
}