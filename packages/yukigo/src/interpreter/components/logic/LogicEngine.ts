import {
  Exist,
  Expression,
  Findall,
  Forall,
  Goal,
  Query,
  Statement,
  Not,
  LogicConstraint,
  Sequence,
  UnifyOperation,
  AssignOperation,
} from "yukigo-ast";
import { solveGoalKernel } from "./LogicResolver.js";
import { InterpreterVisitor } from "../Visitor.js";
import { LogicTranslator } from "./LogicTranslator.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  ChoiceCommand,
  NotCommand,
  FindallCommand,
  BacktrackCommand,
} from "../kernel/commands.js";
import { VariableTerm } from "./LogicTerm.js";
import { Evaluator } from "../../utils.js";
import { YuValue } from "../../primitives/YuValue.js";
import {
  Substitution,
  YuArray,
  LogicTerm,
  LogicResult,
  LogicAnswer,
  isLogicTerm,
  YuBoolean,
  isLogicResult,
} from "../../primitives/index.js";

export type LogicExecutable =
  | Expression
  | Statement
  | Goal
  | Exist
  | Findall
  | Forall
  | Not;

export type Scope = Map<string, VariableTerm>;

type NodeSolver = (
  node: LogicExecutable,
  substs: Substitution,
  scope?: Scope,
) => ExecutionCommand;

export class LogicEngine {
  private translator: LogicTranslator;
  private readonly dispatch: Map<Function, NodeSolver>;

  constructor(
    evaluator: Evaluator,
    private context: RuntimeContext,
  ) {
    this.translator = new LogicTranslator(evaluator, this.context);
    this.dispatch = this.buildDispatch();
  }

  private buildDispatch(): Map<Function, NodeSolver> {
    const goalKernel = (
      node: Goal | Exist,
      substs: Substitution,
      scope?: Scope,
    ) =>
      new BindCommand(
        this.resolveTerms(node, substs, scope),
        (termsRes: YuValue) => {
          const terms = termsRes.asSequence;
          if (!terms || !(terms instanceof YuArray))
            throw new Error("Expected array of terms");
          return this.runKernel(
            node,
            terms.items as LogicTerm[],
            substs,
          );
        },
      );

    return new Map<Function, NodeSolver>([
      [
        Sequence,
        (node, substs, scope) =>
          this.solveConjunction((node as Sequence).statements, substs, scope),
      ],
      [
        LogicConstraint,
        (node, substs, scope) =>
          this.solveConjunction(
            [(node as LogicConstraint).expression],
            substs,
            scope,
          ),
      ],
      [
        UnifyOperation,
        (node, substs, scope) => {
          const op = node as UnifyOperation;
          return new BindCommand(
            this.unifyExpr(op.left, op.right, substs, scope),
            (res) => {
              const isMatch = res instanceof YuBoolean && res.value;
              if (isMatch)
                return new StepCommand(
                  new LogicResult([new LogicAnswer(true, substs)]),
                );
              return new BacktrackCommand();
            },
          );
        },
      ],
      [
        AssignOperation,
        (node, substs, scope) =>
          this.solveAssign(node as AssignOperation, substs, scope),
      ],
      [
        Findall,
        (node, substs, scope) =>
          this.solveFindall(node as Findall, substs, scope),
      ],
      [
        Forall,
        (node, substs, scope) =>
          this.solveForall(node as Forall, substs, scope),
      ],
      [Not, (node, substs, scope) => this.solveNot(node as Not, substs, scope)],
      [Goal, (node, substs, scope) => goalKernel(node as Goal, substs, scope)],
      [
        Exist,
        (node, substs, scope) => goalKernel(node as Exist, substs, scope),
      ],
    ]);
  }

  public unifyExpr(
    left: Expression,
    right: Expression,
    substs: Substitution = new Map(),
    scope?: Scope,
  ): ExecutionCommand {
    return new BindCommand(
      this.translator.expressionToTerm(left, scope),
      (leftTerm: YuValue) => {
        if (!isLogicTerm(leftTerm)) return new BacktrackCommand();
        return new BindCommand(
          this.translator.expressionToTerm(right, scope),
          (rightTerm: YuValue) => {
            if (!isLogicTerm(rightTerm)) return new BacktrackCommand();

            return leftTerm.unify(rightTerm, substs);
          },
        );
      },
    );
  }

  public solveQuery(node: Query): ExecutionCommand {
    const scope: Scope = new Map();
    const compiled = this.solveConjunction(node.expressions, new Map(), scope);
    return this.aggregateResults(compiled, scope);
  }

  public solveGoalLike(
    node: Goal | Exist,
    outerSubsts?: Substitution,
    outerScope?: Scope,
  ): ExecutionCommand {
    const scope: Scope = outerScope ?? new Map();
    const substs: Substitution = outerSubsts ?? new Map();
    return new BindCommand(
      this.resolveTerms(node, substs, scope),
      (termsRes: YuValue) => {
        const termsSeq = termsRes.asSequence;
        if (!(termsSeq instanceof YuArray)) return new BacktrackCommand();
        const terms = termsSeq.items;
        if (!terms.every(isLogicTerm)) return new BacktrackCommand();
        return this.runKernel(node, terms, substs);
      },
    );
  }

  public solveNot(
    node: Not,
    substs: Substitution = new Map(),
    scope: Scope = new Map(),
  ): ExecutionCommand {
    const clonedSubsts = new Map(substs);
    const innerGoalCmd = this.solveConjunction(
      [node.expression],
      clonedSubsts,
      scope,
    );
    return new NotCommand(innerGoalCmd, substs);
  }

  public solveFindall(
    node: Findall,
    substs: Substitution = new Map(),
    scope: Scope = new Map(),
  ): ExecutionCommand {
    const clonedSubsts = new Map(substs);
    const innerGoalCmd = this.solveConjunction(
      [node.goal],
      clonedSubsts,
      scope,
    );
    return new FindallCommand(
      node.template,
      node.bag,
      innerGoalCmd,
      substs,
      scope,
      this.translator,
    );
  }

  private solveAssign(
    op: AssignOperation,
    substs: Substitution,
    scope?: Scope,
  ): ExecutionCommand {
    const localEnv = this.createLocalEnv(substs);
    const isolatedContext = new RuntimeContext(this.context.config);
    isolatedContext.setEnv({ head: localEnv, tail: this.context.env });
    const localEvaluator = new InterpreterVisitor(isolatedContext);

    return new BindCommand(localEvaluator.evaluate(op.right), (val) => {
      const resultTerm = this.translator.primitiveToTerm(val);
      return new BindCommand(
        this.translator.expressionToTerm(op.left, scope),
        (leftTerm: YuValue) => {
          if (!isLogicTerm(leftTerm)) return new BacktrackCommand();
          if (leftTerm.unify(resultTerm, substs)) {
            return new StepCommand(
              new LogicResult([new LogicAnswer(true, substs)]),
            );
          }
          return new BacktrackCommand();
        },
      );
    });
  }

  public solveForall(
    node: Forall,
    substs: Substitution = new Map(),
    scope: Scope = new Map(),
  ): ExecutionCommand {
    // a forall(Cond, Action) is equivalent to \+ (Cond, \+ Action)
    return this.solveNot(
      new Not(new Sequence([node.condition, new Not(node.action)])),
      substs,
      scope,
    );
  }

  private aggregateResults(
    command: ExecutionCommand,
    scope: Scope,
  ): ExecutionCommand {
    return new BindCommand(command, (res: YuValue) => {
      if (!isLogicResult(res)) return new StepCommand(res);
      const mappedAnswers = res.allAnswers.map((ans) =>
        this.finalizeUserResult(ans, scope),
      );
      return new StepCommand(new LogicResult(mappedAnswers));
    });
  }

  private branchSolutions(
    solutions: Substitution[],
    tail: LogicExecutable[],
    scope?: Scope,
  ): ExecutionCommand {
    if (solutions.length === 0) return new BacktrackCommand();

    if (solutions.length === 1) {
      return this.solveConjunction(tail, solutions[0], scope);
    }
    return new ChoiceCommand(
      solutions.map((s) => this.solveConjunction(tail, s, scope)),
    );
  }

  private solveConjunction(
    nodes: LogicExecutable[],
    substs: Substitution,
    scope?: Scope,
  ): ExecutionCommand {
    if (nodes.length === 0) {
      return new StepCommand(new LogicResult([new LogicAnswer(true, substs)]));
    }

    const [head, ...tail] = nodes;
    const solver: NodeSolver =
      this.dispatch.get(head.constructor) ??
      ((node, s) => this.solveCondition(node as Expression | Statement, s));

    const currentSubst = new Map(substs);

    return new BindCommand(
      solver(head, currentSubst, scope),
      (res: YuValue) => {
        // fail if result not a LogicResult or if some conditionfail
        if (!isLogicResult(res) || !res.allSuccessful())
          return new BacktrackCommand();

        return this.branchSolutions(res.getSuccessfulSolutions(), tail, scope);
      },
    );
  }

  private solveCondition(
    expr: Expression | Statement,
    substs: Substitution,
  ): ExecutionCommand {
    const localEnv = this.createLocalEnv(substs);
    const isolatedContext = new RuntimeContext(this.context.config);
    isolatedContext.setEnv({ head: localEnv, tail: this.context.env });
    const localEvaluator = new InterpreterVisitor(isolatedContext);

    return new BindCommand(localEvaluator.evaluate(expr), (result: YuValue) => {
      // fail if result is falsy
      const isTrue =
        (result instanceof YuBoolean && result.value) ||
        (result instanceof LogicResult && result.success);
      if (!isTrue) return new BacktrackCommand();

      return new StepCommand(new LogicResult([new LogicAnswer(true, substs)]));
    });
  }

  private createLocalEnv(substs: Substitution): Map<string, YuValue> {
    const env = new Map<string, YuValue>();
    for (const [id, term] of substs) {
      const name = typeof id === "string" ? id : this.translator.getName(id);
      if (name) env.set(name, term.instantiate(substs).toPrimitive(substs));
    }
    return env;
  }

  private finalizeUserResult(ans: LogicAnswer, scope: Scope): LogicAnswer {
    const solution = ans.getSolution();

    const fromScope: [string, LogicTerm][] = Array.from(scope.entries()).map(
      ([name, term]) => [name, term.instantiate(solution)],
    );

    const fromSolution: [string, LogicTerm][] = Array.from(
      solution.entries(),
    ).map(([id, term]) => [
      typeof id === "number" ? this.translator.getName(id)! : (id as string),
      term.instantiate(solution),
    ]);

    const userMapped: Substitution = new Map(
      [fromSolution, fromScope].flatMap((s) => [...s]),
    );

    return new LogicAnswer(ans.isSuccessful(), userMapped);
  }

  private resolveTerms(
    node: Goal | Exist,
    substs: Substitution,
    scope?: Scope,
  ): ExecutionCommand {
    if (node.is(Goal))
      return this.resolveArgSequentially(node.args, substs, scope);

    const terms = node.patterns.map((pat) =>
      this.translator.patternToTerm(pat, scope).instantiate(substs),
    );
    return new StepCommand(new YuArray(terms));
  }
  private resolveArgSequentially(
    args: Expression[],
    substs: Substitution,
    scope?: Scope,
  ): ExecutionCommand {
    const terms: LogicTerm[] = [];
    const next = (index: number): ExecutionCommand => {
      if (index >= args.length) {
        return new StepCommand(new YuArray(terms));
      }
      return new BindCommand(
        this.translator.instantiateExpressionAsTerm(args[index], substs, scope),
        (t) => {
          if (isLogicTerm(t)) terms.push(t);
          return next(index + 1);
        },
      );
    };
    return next(0);
  }

  private runKernel(
    node: Goal | Exist,
    terms: LogicTerm[],
    substs: Substitution,
  ): ExecutionCommand {
    return solveGoalKernel(
      this.context,
      node.identifier.value,
      terms,
      (body, s, scp) => this.solveConjunction(body, s, scp),
      substs,
      this.translator,
    );
  }
}
