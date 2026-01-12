import {
  Expression,
  Fact,
  FunctorPattern,
  ListPattern,
  LiteralPattern,
  Pattern,
  EnvStack,
  Rule,
  VariablePattern,
  WildcardPattern,
  isRuntimePredicate,
  UnguardedBody,
  ConsPattern,
} from "yukigo-ast";
import { lookup } from "../utils.js";
import { InterpreterError } from "../errors.js";

export type Substitution = Map<string, Pattern>;

export type InternalLogicResult = { success: true; substs: Substitution };

export type BodySolver = (
  expressions: Expression[],
  env: Substitution
) => Generator<InternalLogicResult>;

export function success(substs: Substitution): InternalLogicResult {
  return { success: true, substs };
}

function unifyParameters(
  patterns: Pattern[],
  args: Pattern[]
): [Substitution, boolean] {
  const subst: Substitution = new Map();
  for (let i = 0; i < patterns.length; i++) {
    const match = unify(patterns[i], args[i], subst);
    if (!match) return [, false];
    match.forEach((v, k) => subst.set(k, v));
  }
  return [subst, true];
}

export function* solveGoal(
  envs: EnvStack,
  predicateName: string,
  args: Pattern[],
  solveBody: BodySolver
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
      const [substs, matches] = unifyParameters(clause.patterns, args);
      if (!matches) continue;
      yield success(substs);
      continue;
    }
    if (clause instanceof Rule) {
      for (const eq of clause.equations) {
        const [substs, matches] = unifyParameters(eq.patterns, args);
        if (!matches) continue;

        if (eq.body instanceof UnguardedBody) {
          const bodyGenerator = solveBody(eq.body.sequence.statements, substs);
          for (const finalResult of bodyGenerator)
            yield success(finalResult.substs);
        }
      }
      continue;
    }
    throw new InterpreterError(
      "*solveGoal",
      `Unexpected node: ${JSON.stringify(clause)}`
    );
  }
}

function resolve(node: Pattern, env: Substitution): Pattern {
  if (node instanceof VariablePattern) {
    const name = node.name.value;
    if (env.has(name)) return resolve(env.get(name)!, env);
  }
  return node;
}

export function unify(
  t1: Pattern,
  t2: Pattern,
  argEnv?: Substitution
): Substitution | null {
  const env: Substitution = argEnv ?? new Map();
  const r1 = resolve(t1, env);
  const r2 = resolve(t2, env);

  if (r1 === r2) return env;

  if (r1 instanceof WildcardPattern || r2 instanceof WildcardPattern)
    return env;

  if (r1 instanceof VariablePattern) {
    env.set(r1.name.value, r2);
    return env;
  }
  if (r2 instanceof VariablePattern) {
    env.set(r2.name.value, r1);
    return env;
  }

  if (r1 instanceof LiteralPattern && r2 instanceof LiteralPattern)
    return r1.name.equals(r2.name) ? env : null;

  if (r1 instanceof FunctorPattern && r2 instanceof FunctorPattern) {
    if (r1.identifier.value !== r2.identifier.value) return null;
    if (r1.args.length !== r2.args.length) return null;

    for (let i = 0; i < r1.args.length; i++) {
      if (!unify(r1.args[i], r2.args[i], env)) return null;
    }
    return env;
  }

  if (r1 instanceof ListPattern && r2 instanceof ListPattern) {
    if (r1.elements.length !== r2.elements.length) return null;
    for (let i = 0; i < r1.elements.length; i++) {
      if (!unify(r1.elements[i], r2.elements[i], env)) return null;
    }
    return env;
  }

  if (r1 instanceof ConsPattern && r2 instanceof ConsPattern) {
    if (!unify(r1.head, r2.head, env)) return null;
    return unify(r1.tail, r2.tail, env);
  }

  if (r1 instanceof ListPattern && r2 instanceof ConsPattern) {
    if (r1.elements.length === 0) return null;
    const [head, ...tail] = r1.elements;
    if (!unify(head, r2.head, env)) return null;
    return unify(new ListPattern(tail), r2.tail, env);
  }

  if (r1 instanceof ConsPattern && r2 instanceof ListPattern) {
    if (r2.elements.length === 0) return null;
    const [head, ...tail] = r2.elements;
    if (!unify(r1.head, head, env)) return null;
    return unify(r1.tail, new ListPattern(tail), env);
  }

  return null;
}