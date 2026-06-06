import {
  Fact,
  Rule,
  UnguardedBody,
  Visitor,
  isUnguardedBody,
  GuardedBody,
  ASTNode,
  Pattern,
} from "yukigo-ast";
import { LogicExecutable } from "./LogicEngine.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { InterpreterError } from "../../errors.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
  ChoiceCommand,
  BacktrackCommand,
} from "../kernel/commands.js";
import { LogicTranslator } from "./LogicTranslator.js";
import { VariableTerm } from "./LogicTerm.js";
import {
  isLogicResult,
  LogicAnswer,
  LogicResult,
  LogicTerm,
  Substitution,
} from "../../../primitives/LogicResult.js";
import { isRuntimePredicate } from "../../../primitives/RuntimePredicate.js";

/**
 * Unified parameter list unification.
 */
function unifyParameters(
  patterns: Pattern[],
  args: LogicTerm[],
  baseSubst: Substitution,
  translator: LogicTranslator,
  scope: Map<string, VariableTerm>,
): Substitution | null {
  let subst: Substitution = new Map(baseSubst);
  for (let i = 0; i < patterns.length; i++) {
    const term = translator.patternToTerm(patterns[i], scope);
    if (!term.unify(args[i], subst)) return null;
  }
  return subst;
}

class KernelBodyVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private readonly solveBody: Solver,
    private readonly substs: Substitution,
    private readonly scope: Map<string, VariableTerm>,
  ) {}

  public visitUnguardedBody(body: UnguardedBody): ExecutionCommand {
    return this.solveBody(body.sequence.statements, this.substs, this.scope);
  }

  public visitGuardedBody(body: GuardedBody): ExecutionCommand {
    return new BindCommand(
      this.solveBody([body.condition], this.substs, this.scope),
      (res) => {
        if (isLogicResult(res) && res.allSuccessful()) {
          const solutions = res.getSuccessfulSolutions();
          if (solutions.length === 1) {
            return this.solveBody([body.body], solutions[0], this.scope);
          }
          return new ChoiceCommand(
            solutions.map((s) => this.solveBody([body.body], s, this.scope)),
          );
        }
        return new BacktrackCommand();
      },
    );
  }

  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new InterpreterError(
        "Logic",
        `Unexpected node ${node.constructor.name} in equation body`,
      ),
    );
  }
}

type Solver = (
  expressions: LogicExecutable[],
  env: Substitution,
  scope?: Map<string, VariableTerm>,
) => ExecutionCommand;

export class GoalKernelVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private readonly args: LogicTerm[],
    private readonly baseSubst: Substitution,
    private readonly solveBody: Solver,
    private readonly translator: LogicTranslator,
  ) {}

  public visitFact(fact: Fact): ExecutionCommand {
    const scope = new Map<string, VariableTerm>();
    const substs = unifyParameters(
      fact.patterns,
      this.args,
      this.baseSubst,
      this.translator,
      scope,
    );

    if (!substs) return new BacktrackCommand();
    return new StepCommand(new LogicResult([new LogicAnswer(true, substs)]));
  }

  public visitRule(rule: Rule): ExecutionCommand {
    const alternatives: ExecutionCommand[] = [];

    for (const eq of rule.equations) {
      const scope = new Map<string, VariableTerm>();
      const substs = unifyParameters(
        eq.patterns,
        this.args,
        this.baseSubst,
        this.translator,
        scope,
      );
      if (!substs) continue;
      const bodyVisitor = new KernelBodyVisitor(this.solveBody, substs, scope);

      if (isUnguardedBody(eq.body)) {
        alternatives.push(eq.body.accept(bodyVisitor));
      } else {
        const branches = eq.body.map((b) => b.accept(bodyVisitor));
        alternatives.push(new ChoiceCommand(branches));
      }
    }

    if (alternatives.length === 0) return new BacktrackCommand();
    return alternatives.length === 1
      ? alternatives[0]
      : new ChoiceCommand(alternatives);
  }

  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new InterpreterError(
        "Logic",
        `Unexpected node ${node.constructor.name} in predicate definition`,
      ),
    );
  }
}

/**
 * Solves a single logic goal (predicate call) using the Kernel.
 * Returns a non-deterministic command. Aggregation should happen at top-level.
 */
export function solveGoalKernel(
  ctx: RuntimeContext,
  predicateName: string,
  args: LogicTerm[],
  solveBody: Solver,
  baseSubst: Substitution,
  translator: LogicTranslator,
): ExecutionCommand {
  const pred = ctx.isDefined(predicateName) ? ctx.lookup(predicateName) : null;

  const validPredicate =
    isRuntimePredicate(pred) && pred.validateArity(args.length);

  if (!validPredicate) return new BacktrackCommand();

  const visitor = new GoalKernelVisitor(args, baseSubst, solveBody, translator);

  const choices = pred
    .apply(visitor)
    .filter((c) => !(c instanceof FailCommand));

  if (choices.length === 0) return new BacktrackCommand();
  return choices.length === 1 ? choices[0] : new ChoiceCommand(choices);
}
