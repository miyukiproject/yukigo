import {
  Expression,
  Fact,
  FunctorPattern,
  Goal,
  ListPattern,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  Rule,
  VariablePattern,
  WildcardPattern,
  isRuntimePredicate,
} from "@yukigo/ast";
import { EnvStack } from "../index.js";
import { lookup } from "../utils.js";
import { InterpreterError } from "../errors.js";

export type Substitution = Map<string, Pattern>;

export type InternalLogicResult = { success: true; substs: Substitution };

export type BodySolver = (
  expressions: Expression[],
  env: Substitution
) => Generator<InternalLogicResult>;

export function* solveGoal(
  envs: EnvStack,
  predicateName: string,
  args: Pattern[],
  solveBody: BodySolver
): Generator<InternalLogicResult> {
  const pred = lookup(envs, predicateName);
  if (!pred || !isRuntimePredicate(pred)) return;

  for (const clause of pred.equations) {
    if (clause.patterns.length !== args.length) continue;

    let currentSubsts: Substitution = new Map();
    let headMatches = true;

    for (let i = 0; i < clause.patterns.length; i++) {
      const match = unify(clause.patterns[i], args[i], new Map(currentSubsts));
      console.log("In *solveGoal, match: ", match);

      if (!match) {
        headMatches = false;
        break;
      }
      match.forEach((v, k) => currentSubsts.set(k, v));
    }

    if (!headMatches) continue;

    if (clause instanceof Fact) {
      yield { success: true, substs: currentSubsts };
      continue;
    }
    if (clause instanceof Rule) {
      const rule = clause as Rule;
      const bodyGenerator = solveBody(rule.expressions, currentSubsts);

      for (const finalResult of bodyGenerator)
        yield { success: true, substs: finalResult.substs };

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
    const name = node.name.toString();
    if (env.has(name)) return resolve(env.get(name), env);
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

  return null;
}
