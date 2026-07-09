import { GuardedBody, NativeBody, Pattern, UnguardedBody } from "yukigo-ast";
import { YuValue } from "../YuValue.js";
import {
  boolean,
  EnvStack,
  error,
  PrimitiveThunk,
  raise,
} from "../../utils.js";
import { ExecutionCommand } from "../../components/kernel/commands.js";

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody | NativeBody;
}
/**
 * Runtime Function used in the Interpreter
 */
export class RuntimeFunction extends YuValue {
  constructor(
    public arity: number,
    public equations: EquationRuntime[],
    public identifier?: string,
    public pendingArgs?: (YuValue | PrimitiveThunk)[],
    public closure?: EnvStack,
  ) {
    super();
  }

  public equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  public compare(other: YuValue): ExecutionCommand {
    return raise(
      error("RuntimeFunction.compare", "Functions are not comparable"),
    );
  }

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
  public bind(...args: (YuValue | PrimitiveThunk)[]): RuntimeFunction {
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
  public getEvaluatedArgs(): YuValue[] {
    return (this.pendingArgs ?? []).map((arg) =>
      typeof arg === "function" ? arg() : arg,
    );
  }

  public toJSON(): unknown {
    return {
      name: this.name,
      arity: this.arity,
      remainingArity: this.remainingArity,
    };
  }

  public toString(): string {
    const arityInfo = this.arity > 0 ? `/${this.arity}` : "";
    const pendingInfo = this.hasPendingArgs
      ? ` (applied ${this.pendingArgs!.length})`
      : "";
    return `[Function: ${this.name}${arityInfo}${pendingInfo}]`;
  }
}
export function isRuntimeFunction(val: YuValue): val is RuntimeFunction {
  return val instanceof RuntimeFunction;
}
