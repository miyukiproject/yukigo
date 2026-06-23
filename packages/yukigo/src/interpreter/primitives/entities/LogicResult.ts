import { ExecutionCommand, StepCommand } from "../../components/kernel/commands.js";
import { boolean } from "../../utils.js";
import { YuBoolean } from "../index.js";
import { YuValue } from "../YuValue.js";

/**
 * Interface for logic terms that can be treated as runtime values.
 */
export interface LogicTerm extends YuValue {
  readonly logicTermType: string;
  unify(other: LogicTerm, env: Substitution): ExecutionCommand;
  resolve(env: Substitution): LogicTerm;
  instantiate(env: Substitution, seen?: Set<number>): LogicTerm;
  toPrimitive(env: Substitution): YuValue;
  occurs(v: any, env: Substitution): boolean;
  toString(): string;
}

export function isLogicTerm(val: YuValue): val is LogicTerm {
  return val !== null && typeof val === "object" && "logicTermType" in val;
}

/**
 * Substitution map that supports numeric IDs (internally) and string names (for results).
 */
export type Substitution = Map<string | number, LogicTerm>;

export class LogicAnswer extends YuValue {
  private _success: boolean;
  private _solution: Substitution;
  constructor(success: boolean, solution: Substitution) {
    super();
    this._success = success;
    this._solution = solution;
  }
  public equals(other: YuValue): ExecutionCommand { return boolean(other === this); }
  public compare(other: YuValue): ExecutionCommand { throw new Error("LogicAnswer is not comparable"); }
  public isSuccessful(): boolean {
    return this._success;
  }
  public getSolution(): Substitution {
    return this._solution;
  }
  public get success(): boolean {
    return this.isSuccessful();
  }
  /**
   * Returns a view of the solutions containing only string-named variables (for the user).
   */
  public get solutions(): Substitution {
    return this._solution;
  }

  public toJSON(): unknown {
    const sol: Record<string, unknown> = {};
    for (const [key, val] of this._solution) {
        if (typeof key === "string") sol[key] = val.toJSON();
    }
    return { success: this._success, solution: sol };
  }
  public toString(): string { return `Answer(${this._success})`; }
}

export class LogicResult extends YuValue {
  private answers: LogicAnswer[];
  constructor(answers: LogicAnswer[]) {
    super();
    this.answers = answers;
  }
  public equals(other: YuValue): ExecutionCommand { return boolean(other === this); }
  public compare(other: YuValue): ExecutionCommand { throw new Error("LogicResult is not comparable"); }
  public get allAnswers(): LogicAnswer[] {
    return this.answers;
  }
  public getAllSuccessful(): LogicAnswer[] {
    return this.answers.filter((answer) => answer.isSuccessful());
  }
  public allSuccessful(): boolean {
    return (
      this.answers.length > 0 &&
      this.answers.every((answer) => answer.isSuccessful())
    );
  }
  public getSuccessfulSolutions(): Substitution[] {
    return this.getAllSuccessful().map((ans) => ans.getSolution());
  }
  public get success(): boolean {
    return (
      this.answers.length > 0 && this.answers.every((a) => a.isSuccessful())
    );
  }
  public get solutions(): Substitution {
    const answers = this.getAllSuccessful();
    if (answers.length === 0) return new Map();
    return answers[0].solutions;
  }

  public toJSON(): unknown {
    return this.answers.map(a => a.toJSON());
  }
  public toString(): string { return `LogicResult(${this.answers.length})`; }
}

export function isLogicResult(value: YuValue): value is LogicResult {
  return value instanceof LogicResult;
}