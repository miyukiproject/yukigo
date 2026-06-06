import { PrimitiveValue } from "./primitives.js";

/**
 * Interface for logic terms that can be treated as runtime values.
 */
export interface LogicTerm {
  readonly logicTermType: string;
  unify(other: LogicTerm, env: Substitution): boolean;
  resolve(env: Substitution): LogicTerm;
  instantiate(env: Substitution, seen?: Set<number>): LogicTerm;
  toPrimitive(env: Substitution): PrimitiveValue;
  occurs(v: any, env: Substitution): boolean;
  toString(): string;
}

export function isLogicTerm(val: PrimitiveValue): val is LogicTerm {
  return val !== null && typeof val === "object" && "logicTermType" in val;
}

/**
 * Substitution map that supports numeric IDs (internally) and string names (for results).
 */
export type Substitution = Map<string | number, LogicTerm>;

export class LogicAnswer {
  private _success: boolean;
  private _solution: Substitution;
  constructor(success: boolean, solution: Substitution) {
    this._success = success;
    this._solution = solution;
  }
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
}

export class LogicResult {
  private answers: LogicAnswer[];
  constructor(answers: LogicAnswer[]) {
    this.answers = answers;
  }
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
}

export function isLogicResult(value: PrimitiveValue): value is LogicResult {
  return value instanceof LogicResult;
}