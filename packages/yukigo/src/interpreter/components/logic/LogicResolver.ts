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
  LogicTerm,
  Substitution,
  isLogicResult,
  LogicResult,
  LogicAnswer,
  isRuntimePredicate,
  YuBoolean,
} from "../../primitives/index.js";

/**
 * Unified parameter list unification.
 */
function unifyParameters(
  patterns: Pattern[],
  args: LogicTerm[],
  baseSubst: Substitution,
  translator: LogicTranslator,
  scope: Map<string, VariableTerm>,
  onSuccess: (subst: Substitution) => ExecutionCommand,
  onFailure: () => ExecutionCommand,
): ExecutionCommand {
  const next = (index: number, currentSubst: Substitution): ExecutionCommand => {
    if (index >= patterns.length) {
      return onSuccess(currentSubst);
    }
    const term = translator.patternToTerm(patterns[index], scope);
    return new BindCommand(term.unify(args[index], currentSubst), (res) => {
      if (res instanceof YuBoolean && res.value) {
        return next(index + 1, currentSubst);
      }
      return onFailure();
    });
  };
  return next(0, new Map(baseSubst));
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
    return unifyParameters(
      fact.patterns,
      this.args,
      this.baseSubst,
      this.translator,
      scope,
      (substs) => new StepCommand(new LogicResult([new LogicAnswer(true, substs)])),
      () => new BacktrackCommand(),
    );
  }

  public visitRule(rule: Rule): ExecutionCommand {
    const tryEquation = (eqIndex: number): ExecutionCommand => {
      if (eqIndex >= rule.equations.length) {
        return new BacktrackCommand();
      }

      const eq = rule.equations[eqIndex];
      const scope = new Map<string, VariableTerm>();

      return unifyParameters(
        eq.patterns,
        this.args,
        this.baseSubst,
        this.translator,
        scope,
        (substs) => {
          const bodyVisitor = new KernelBodyVisitor(this.solveBody, substs, scope);
          let currentCmd: ExecutionCommand;
          if (isUnguardedBody(eq.body)) {
            currentCmd = eq.body.accept(bodyVisitor);
          } else {
            const branches = eq.body.map((b) => b.accept(bodyVisitor));
            currentCmd = branches.length === 1 ? branches[0] : new ChoiceCommand(branches);
          }

          return new ChoiceCommand([
            currentCmd,
            tryEquation(eqIndex + 1),
          ]);
        },
        () => tryEquation(eqIndex + 1),
      );
    };

    return tryEquation(0);
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
    !!pred && isRuntimePredicate(pred) && pred.validateArity(args.length);

  if (!validPredicate) return new BacktrackCommand();

  const visitor = new GoalKernelVisitor(args, baseSubst, solveBody, translator);

  const choices = pred
    .apply(visitor)
    .filter((c) => !(c instanceof FailCommand));

  if (choices.length === 0) return new BacktrackCommand();
  return choices.length === 1 ? choices[0] : new ChoiceCommand(choices);
}
