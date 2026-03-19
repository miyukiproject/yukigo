import { Fact, Rule, Pattern, GuardedBody, UnguardedBody } from "yukigo-ast";

export type SuccessLogicResult = {
  success: true;
  solutions: Map<string, PrimitiveValue>;
};
export type FailedLogicResult = {
  success: false;
};
export type LogicResult = SuccessLogicResult | FailedLogicResult;

export type PrimitiveValue =
  | number
  | boolean
  | string
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | null
  | void
  | PrimitiveValue[]
  | RuntimeObject
  | RuntimeClass
  | undefined;

export function isLogicResult(value: PrimitiveValue): value is LogicResult {
  return (
    value &&
    typeof value === "object" &&
    "success" in value &&
    typeof value.success === "boolean" &&
    "solutions" in value &&
    value.solutions instanceof Map
  );
}

export type PrimitiveThunk = () => PrimitiveValue;

export type Environment = Map<string, PrimitiveValue>;
export type EnvStack = {
  head: Environment;
  tail: EnvStack | null;
};

// Runtime Types

type RuntimePredicateKind = "Fact" | "Rule" | "Predicate";
type PredicateEquation = Fact | Rule;

export interface IRuntimePredicate {
  kind: RuntimePredicateKind;
  identifier: string;
  equations: PredicateEquation[];
}

export class RuntimePredicate implements IRuntimePredicate {
  constructor(
    public kind: RuntimePredicateKind,
    public identifier: string,
    public equations: PredicateEquation[],
  ) {}

  public pushEquation<T extends Fact | Rule>(eq: T) {
    this.equations.push(eq);
  }
}

// TODO: Replace with correct polymorphism
export const isRuntimePredicate = (
  prim: PrimitiveValue,
): prim is RuntimePredicate => {
  return prim instanceof RuntimePredicate;
};

type Body = GuardedBody[] | UnguardedBody;

export interface IRuntimeEquation {
  patterns: Pattern[];
  body: Body;
}

export class RuntimeEquation implements IRuntimeEquation {
  constructor(
    public patterns: Pattern[],
    public body: Body,
  ) {}
}

type PendingArg = PrimitiveValue | PrimitiveThunk;

/**
 * Runtime Function used in the Interpreter
 */
export interface IRuntimeFunction {
  arity: number;
  identifier: string;
  equations: RuntimeEquation[];
  pendingArgs: PendingArg[]; // for partial application
  closure?: EnvStack;
}

export class RuntimeFunction implements IRuntimeFunction {
  constructor(
    public arity: number,
    public identifier: string,
    public equations: RuntimeEquation[],
    public pendingArgs: PendingArg[],
    public closure?: EnvStack,
  ) {}

  public setPendingArgs(args: PendingArg[]) {
    this.pendingArgs = args;
  }
}

// TODO: Replace with correct polymorphism
export function isRuntimeFunction(val: PrimitiveValue): val is RuntimeFunction {
  return val instanceof RuntimeFunction;
}

type Fields = Map<string, PrimitiveValue>;
type Methods = Map<string, RuntimeFunction>;

export interface IRuntimeClass {
  identifier: string;
  fields: Fields;
  methods: Methods;
  mixins: string[];
  superclass?: string;
}

export class RuntimeClass implements IRuntimeClass {
  constructor(
    public identifier: string,
    public fields: Fields,
    public methods: Methods,
    public mixins: string[],
    public superclass?: string,
  ) {}
}
// TODO: prev as before
export function isRuntimeClass(val: PrimitiveValue): val is RuntimeClass {
  return val instanceof RuntimeClass;
}

export interface IRuntimeObject {
  identifier: string;
  className: string;
  fields: Map<string, PrimitiveValue>;
  methods: Map<string, RuntimeFunction>;
}

export class RuntimeObject implements IRuntimeObject {
  constructor(
    public identifier: string,
    public className: string,
    public fields: Fields,
    public methods: Methods,
  ) {}
}

export function isRuntimeObject(val: PrimitiveValue): val is RuntimeObject {
  return val instanceof RuntimeObject;
}

export type LazyGenerator = () => Generator<PrimitiveValue, void, unknown>;

export interface ILazyList {
  readonly generator: LazyGenerator;
}

export class LazyList implements ILazyList {
  constructor(public readonly generator: LazyGenerator) {}
}

export function isLazyList(prim: unknown): prim is LazyList {
  return prim instanceof LazyList;
}
