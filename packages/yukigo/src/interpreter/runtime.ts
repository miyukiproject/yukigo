import { Fact, Rule } from "../../../yukigo-ast/src/paradigms/logic.js";
import { Pattern } from "../../../yukigo-ast/src/globals/patterns.js";
import { GuardedBody, UnguardedBody } from "../../../yukigo-ast/src/globals/statements.js";

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

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | LogicTerm
  | null
  | void
  | PrimitiveValue[]
  | RuntimeObject
  | RuntimeClass
  | undefined;

export function isLogicResult(value: PrimitiveValue): value is LogicResult {
  return value instanceof LogicResult;
}

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};

// Runtime Types

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

export interface RuntimePredicate {
  kind: "Fact" | "Rule" | "Predicate";
  identifier: string;
  equations: (Fact | Rule)[];
}

export const isRuntimePredicate = (
  prim: PrimitiveValue,
): prim is RuntimePredicate => {
  return (
    typeof prim === "object" &&
    prim !== null &&
    "kind" in prim &&
    (prim.kind === "Fact" || prim.kind === "Rule" || prim.kind === "Predicate")
  );
};

export interface EquationRuntime {
  patterns: Pattern[];
  body: GuardedBody[] | UnguardedBody;
}
/**
 * Runtime Function used in the Interpreter
 */
export interface RuntimeFunction {
  type: "Function";
  arity: number;
  identifier?: string;
  equations: EquationRuntime[];
  pendingArgs?: (PrimitiveValue | PrimitiveThunk)[]; // for partial application
  closure?: EnvStack;
}
export function isRuntimeFunction(val: PrimitiveValue): val is RuntimeFunction {
  return (
    typeof val === "object" &&
    val !== null &&
    "type" in val &&
    val.type === "Function"
  );
}

export interface RuntimeClass {
  type: "Class";
  identifier: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
  superclass?: string;
  mixins: string[];
}

export function isRuntimeClass(val: PrimitiveValue): val is RuntimeClass {
  return (
    val !== null &&
    typeof val === "object" &&
    "type" in val &&
    val.type === "Class"
  );
}

export interface RuntimeObject {
  type: "Object";
  identifier: string;
  className: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return (
    val !== null &&
    typeof val === "object" &&
    "type" in val &&
    val.type === "Object"
  );
}

export interface LazyList {
  readonly type: "LazyList";
  readonly generator: () => Generator<PrimitiveValue, void, unknown>;
}

export function isLazyList(prim: unknown): prim is LazyList {
  return (
    prim !== null &&
    typeof prim === "object" &&
    "type" in prim &&
    prim.type === "LazyList"
  );
}
