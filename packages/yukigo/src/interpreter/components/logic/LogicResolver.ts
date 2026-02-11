import {
  EnvStack,
  Fact,
  FunctorPattern,
  ListPattern,
  LiteralPattern,
  Pattern,
  Rule,
  VariablePattern,
  WildcardPattern,
  isRuntimePredicate,
  UnguardedBody,
  Findall,
} from "yukigo-ast";
import { lookup } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { LogicExecutable } from "./LogicEngine.js";

/**
 * A Substitution maps variable names to their bound patterns.
 */
export type Substitution = Map<string, Pattern>;

/**
 * Internal result of a logic operation.
 */
export type InternalLogicResult = { success: true; substs: Substitution };

/**
 * A function that can solve a sequence of logic goals/expressions.
 */
export type BodySolver = (
  expressions: LogicExecutable[],
  env: Substitution,
) => Generator<InternalLogicResult>;

/**
 * Creates a successful logic result.
 */
export function success(substs: Substitution): InternalLogicResult {
  return { success: true, substs };
}

/**
 * Unifies two patterns given an existing set of substitutions.
 * Returns the updated substitution map or null if unification fails.
 */
export function unify(
  t1: Pattern,
  t2: Pattern,
  argEnv?: Substitution,
): Substitution | null {
  const env: Substitution = argEnv ? new Map(argEnv) : new Map();
  return unifyInPlace(t1, t2, env) ? env : null;
}

/**
 * Internal unification that modifies the environment in place for efficiency during recursion.
 */
function unifyInPlace(t1: Pattern, t2: Pattern, env: Substitution): boolean {
  const r1 = resolve(t1, env);
  const r2 = resolve(t2, env);

  if (r1 === r2) return true;

  if (r1 instanceof WildcardPattern || r2 instanceof WildcardPattern) {
    return true;
  }

  if (r1 instanceof VariablePattern) {
    env.set(r1.name.value, r2);
    return true;
  }
  if (r2 instanceof VariablePattern) {
    env.set(r2.name.value, r1);
    return true;
  }

  if (r1 instanceof LiteralPattern && r2 instanceof LiteralPattern) {
    return r1.name.equals(r2.name);
  }

  if (r1 instanceof FunctorPattern && r2 instanceof FunctorPattern) {
    if (r1.identifier.value !== r2.identifier.value) return false;
    if (r1.args.length !== r2.args.length) return false;

    for (let i = 0; i < r1.args.length; i++) {
      if (!unifyInPlace(r1.args[i], r2.args[i], env)) return false;
    }
    return true;
  }

  if (r1 instanceof ListPattern && r2 instanceof ListPattern) {
    if (r1.elements.length !== r2.elements.length) return false;
    for (let i = 0; i < r1.elements.length; i++) {
      if (!unifyInPlace(r1.elements[i], r2.elements[i], env)) return false;
    }
    return true;
  }

  return false;
}

/**
 * Follows variable bindings in the substitution map until a non-variable or unbound variable is found.
 */
export function resolve(node: Pattern, env: Substitution): Pattern {
  if (node instanceof VariablePattern) {
    const name = node.name.value;
    const bound = env.get(name);
    if (bound) return resolve(bound, env);
  }
  return node;
}

/**
 * Fully instantiates a pattern by replacing all bound variables with their values.
 */
export function instantiate(pattern: Pattern, substs: Substitution): Pattern {
  if (pattern instanceof VariablePattern) {
    const val = substs.get(pattern.name.value);
    if (val) return instantiate(val, substs);
    return pattern;
  }
  if (pattern instanceof FunctorPattern) {
    return new FunctorPattern(
      pattern.identifier,
      pattern.args.map((arg) => instantiate(arg, substs)),
    );
  }
  if (pattern instanceof ListPattern) {
    return new ListPattern(
      pattern.elements.map((el) => instantiate(el, substs)),
    );
  }
  return pattern;
}

/**
 * Solves a single logic goal (predicate call).
 */
export function* solveGoal(
  envs: EnvStack,
  predicateName: string,
  args: Pattern[],
  solveBody: BodySolver,
): Generator<InternalLogicResult> {
  const pred = lookup(envs, predicateName);
  if (!pred || !isRuntimePredicate(pred)) return;

  for (const clause of pred.equations) {
    const arity =
      clause instanceof Fact
        ? clause.patterns.length
        : clause.equations[0].patterns.length;

    if (arity !== args.length) continue;

    if (clause instanceof Fact) {
      const substs = unifyParameters(clause.patterns, args);
      if (substs) yield success(substs);
      continue;
    }

    if (clause instanceof Rule) {
      for (const eq of clause.equations) {
        const substs = unifyParameters(eq.patterns, args);
        if (!substs) continue;

        if (eq.body instanceof UnguardedBody) {
          yield* solveBody(eq.body.sequence.statements, substs);
        }
      }
      continue;
    }

    throw new InterpreterError("solveGoal", `Unexpected clause type ${clause}`);
  }
}

/**
 * Unifies two lists of parameters. Returns the resulting Substitution or null.
 */
function unifyParameters(
  patterns: Pattern[],
  args: Pattern[],
): Substitution | null {
  let subst: Substitution = new Map();
  for (let i = 0; i < patterns.length; i++) {
    const nextSubst = unify(patterns[i], args[i], subst);
    if (!nextSubst) return null;
    subst = nextSubst;
  }
  return subst;
}

/**
 * Solves a findall/3 goal.
 */
export function* solveFindall(
  node: Findall,
  currentSubsts: Substitution,
  solveBody: BodySolver,
): Generator<InternalLogicResult> {
  const generator = solveBody([node.goal], currentSubsts);
  const gathered: Pattern[] = [];

  for (const result of generator) {
    gathered.push(instantiate(node.template, result.substs));
  }

  const resultList = new ListPattern(gathered);
  const finalSubsts = unify(node.bag, resultList, currentSubsts);

  if (finalSubsts) {
    yield success(finalSubsts);
  }
}
