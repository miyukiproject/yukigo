import {
  Exist,
  Expression,
  Findall,
  Forall,
  Goal,
  Pattern,
  PrimitiveValue,
  Query,
  LogicResult,
  Statement,
  Not,
  LogicConstraint,
  Sequence,
  SymbolPrimitive,
  VariablePattern,
  LazyList,
} from "yukigo-ast";
import {
  Substitution,
  unify,
  instantiate,
  solveGoalKernel,
  solveFindallKernel,
  isLogicStepResult,
  LogicStepResult,
} from "./LogicResolver.js";
import { createStream, Evaluator } from "../../utils.js";
import { InterpreterVisitor } from "../Visitor.js";
import { LogicTranslator } from "./LogicTranslator.js";
import { RuntimeContext, LogicSearchMode } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
  ChoiceCommand,
} from "../kernel/commands.js";
import { YukigoKernel } from "../kernel/index.js";
import { InterpreterError } from "../../errors.js";

export type LogicExecutable = Expression | Statement | Goal | Exist | Findall;

export class LogicEngine {
  private translator: LogicTranslator;

  constructor(
    private evaluator: Evaluator,
    private context: RuntimeContext,
  ) {
    this.translator = new LogicTranslator(evaluator, this.context);
  }

  public unifyExpr(left: Expression, right: Expression): ExecutionCommand {
    return this.translator.instantiateExpressionAsPattern(
      left,
      new Map(),
      (p1) => {
        return this.translator.instantiateExpressionAsPattern(
          right,
          new Map(),
          (p2) => {
            return new StepCommand(unify(p1, p2, new Map()) !== null);
          },
        );
      },
    );
  }

  public solveQuery(
    node: Query,
    modeOverride?: LogicSearchMode,
  ): ExecutionCommand {
    const mode = modeOverride || this.context.config.outputMode || "first";
    if (mode === "all") {
      return this.collectAllResults(
        node.expressions,
        new Map(),
        (results) =>
          new StepCommand(results.map((s) => this.formatLogicResult(s))),
      );
    } else if (mode === "stream") {
      return new StepCommand(
        this.createLazyStream(node.expressions, new Map()),
      );
    }

    return new BindCommand(
      this.solveConjunction(node.expressions, new Map()),
      (res: unknown) => {
        if (isLogicStepResult(res)) {
          return new StepCommand(this.formatLogicResult(res.solutions));
        }
        return new StepCommand({
          success: false,
          solutions: new Map(),
        } as LogicResult);
      },
    );
  }

  public solveGoal(
    node: Goal,
    modeOverride?: LogicSearchMode,
  ): ExecutionCommand {
    return this.prepareLogicTargetKernel(
      node,
      new Map(),
      ({ id, patterns }) => {
        const mode = modeOverride || this.context.config.outputMode || "first";
        if (mode === "all") {
          return this.collectAllResultsForGoal(
            id,
            patterns,
            new Map(),
            (results) =>
              new StepCommand(results.map((s) => this.formatLogicResult(s))),
          );
        } else if (mode === "stream") {
          return new StepCommand(
            this.createLazyStreamForGoal(id, patterns, new Map()),
          );
        }
        return new BindCommand(
          solveGoalKernel(
            this.context,
            id,
            patterns,
            (body, s) => this.solveConjunction(body, s),
            new Map(),
          ),
          (res: unknown) => {
            if (isLogicStepResult(res)) {
              return new StepCommand(this.formatLogicResult(res.solutions));
            }
            return new StepCommand({
              success: false,
              solutions: new Map(),
            } as LogicResult);
          },
        );
      },
    );
  }

  public solveNot(node: Not): ExecutionCommand {
    return new ChoiceCommand([
      new BindCommand(
        this.solveConjunction([node.expression], new Map()),
        (res: unknown) => {
          if (isLogicStepResult(res) && res.success) {
            return new FailCommand(
              new InterpreterError("Logic", "Goal succeeded, failing NOT"),
              true,
            );
          }
          const stepRes: LogicStepResult = {
            success: true,
            solutions: new Map(),
          };
          return new StepCommand(stepRes as unknown as PrimitiveValue);
        },
      ),
      new StepCommand({
        success: true,
        solutions: new Map(),
      } as LogicStepResult as unknown as PrimitiveValue),
    ]);
  }

  public solveFindall(node: Findall): ExecutionCommand {
    return solveFindallKernel(
      node,
      new Map(),
      this.evaluator,
      this.context,
      (body, substs) => this.solveConjunction(body, substs),
    );
  }

  public solveForall(node: Forall): ExecutionCommand {
    return this.solveNot(
      new Not(
        new Sequence([
          node.condition as Expression,
          new Not(node.action) as Expression,
        ]),
      ),
    );
  }

  public solveExist(
    node: Exist,
    modeOverride?: LogicSearchMode,
  ): ExecutionCommand {
    return this.prepareLogicTargetKernel(
      node,
      new Map(),
      ({ id, patterns }) => {
        const mode = modeOverride || this.context.config.outputMode || "first";
        if (mode === "all") {
          return this.collectAllResultsForGoal(
            id,
            patterns,
            new Map(),
            (results) =>
              new StepCommand(results.map((s) => this.formatLogicResult(s))),
          );
        } else if (mode === "stream") {
          return new StepCommand(
            this.createLazyStreamForGoal(id, patterns, new Map()),
          );
        }
        return new BindCommand(
          solveGoalKernel(
            this.context,
            id,
            patterns,
            (body, s) => this.solveConjunction(body, s),
            new Map(),
          ),
          (res: unknown) => {
            if (isLogicStepResult(res)) {
              return new StepCommand(this.formatLogicResult(res.solutions));
            }
            return new StepCommand({
              success: false,
              solutions: new Map(),
            } as LogicResult);
          },
        );
      },
    );
  }

  private solveConjunction(
    nodes: LogicExecutable[],
    substs: Substitution,
  ): ExecutionCommand {
    if (nodes.length === 0) {
      const res: LogicStepResult = { success: true, solutions: substs };
      return new StepCommand(res as unknown as PrimitiveValue);
    }

    const [head, ...tail] = nodes;

    return new BindCommand(this.solveSingle(head, substs), (res: unknown) => {
      if (isLogicStepResult(res) && res.success) {
        return this.solveConjunction(tail, res.solutions);
      }
      return new FailCommand(
        new InterpreterError("Logic", "Conjunction branch failed"),
        true,
      );
    });
  }

  private solveSingle(
    node: LogicExecutable,
    substs: Substitution,
  ): ExecutionCommand {
    if (this.isLogicGoal(node)) return this.solveLogicGoal(node, substs);
    return this.solveCondition(node, substs);
  }

  private solveLogicGoal(
    goal: Goal | Exist | Findall | LogicConstraint | Sequence,
    substs: Substitution,
  ): ExecutionCommand {
    if (goal instanceof LogicConstraint) {
      return this.solveConjunction([goal.expression], substs);
    }

    if (goal instanceof Sequence) {
      return this.solveConjunction(goal.statements, substs);
    }

    if (goal instanceof Findall) {
      return solveFindallKernel(
        goal,
        substs,
        this.evaluator,
        this.context,
        (body: LogicExecutable[], s: Substitution) =>
          this.solveConjunction(body, s),
      );
    }

    return this.prepareLogicTargetKernel(goal, substs, ({ id, patterns }) => {
      return solveGoalKernel(
        this.context,
        id,
        patterns,
        (body, s) => this.solveConjunction(body, s),
        substs,
      );
    });
  }

  private solveCondition(
    expr: Expression | Statement,
    substs: Substitution,
  ): ExecutionCommand {
    this.createLocalEnv(substs);
    const localEvaluator = new InterpreterVisitor(this.context);

    return new BindCommand(localEvaluator.evaluate(expr), (result: unknown) => {
      if (result !== undefined && result !== false) {
        let currentSubsts = new Map(substs);
        for (const [name, val] of this.context.env.head) {
          const pat = this.translator.primitiveToPattern(val);
          const unified = unify(
            new VariablePattern(new SymbolPrimitive(name)),
            pat,
            currentSubsts,
          );
          if (unified) {
            currentSubsts = unified;
          } else {
            return new FailCommand(
              new InterpreterError("Logic", "Unification failed"),
              true,
            );
          }
        }
        const res: LogicStepResult = {
          success: true,
          solutions: currentSubsts,
        };
        return new StepCommand(res as unknown as PrimitiveValue);
      }
      return new FailCommand(
        new InterpreterError("Logic", "Condition failed"),
        true,
      );
    });
  }

  private isLogicGoal(
    node: LogicExecutable,
  ): node is Goal | Exist | Findall | LogicConstraint | Sequence {
    return (
      node instanceof Goal ||
      node instanceof Exist ||
      node instanceof Findall ||
      node instanceof LogicConstraint ||
      node instanceof Sequence
    );
  }

  private createLocalEnv(substs: Substitution) {
    this.context.pushEnv(new Map());
    for (const [name, pattern] of substs) {
      const resolvedPattern = instantiate(pattern, substs);
      const value = this.translator.patternToPrimitive(resolvedPattern);

      this.context.define(name, value);

      const baseNameMatch = name.match(/^(.*)_\d+$/);
      if (baseNameMatch) {
        const baseName = baseNameMatch[1];
        if (!this.context.env.head.has(baseName)) {
          this.context.define(baseName, value);
        }
      }
    }
  }

  private prepareLogicTargetKernel(
    node: Goal | Exist,
    substs: Substitution,
    k: (res: { id: string; patterns: Pattern[] }) => ExecutionCommand,
  ): ExecutionCommand {
    const id = node.identifier.value;
    if (node instanceof Goal) {
      const patterns: Pattern[] = [];
      const next = (index: number): ExecutionCommand => {
        if (index >= node.args.length) return k({ id, patterns });
        return this.translator.instantiateExpressionAsPattern(
          node.args[index],
          substs,
          (p) => {
            patterns.push(p);
            return next(index + 1);
          },
        );
      };
      return next(0);
    } else {
      const patterns = node.patterns.map((pat) => instantiate(pat, substs));
      return k({ id, patterns });
    }
  }

  private collectAllResults(
    nodes: LogicExecutable[],
    substs: Substitution,
    k: (results: Substitution[]) => ExecutionCommand,
  ): ExecutionCommand {
    const results: Substitution[] = [];
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = this.solveConjunction(nodes, substs);

    while (true) {
      const res: unknown = kernel.run(nextCmd);
      if (isLogicStepResult(res) && res.success) {
        results.push(res.solutions);
        nextCmd = kernel.handleBacktrack();
      } else {
        break;
      }
    }
    return k(results);
  }

  private collectAllResultsForGoal(
    id: string,
    patterns: Pattern[],
    substs: Substitution,
    k: (results: Substitution[]) => ExecutionCommand,
  ): ExecutionCommand {
    const results: Substitution[] = [];
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = solveGoalKernel(
      this.context,
      id,
      patterns,
      (body, s) => this.solveConjunction(body, s),
      substs,
    );

    while (true) {
      const res: unknown = kernel.run(nextCmd);
      if (isLogicStepResult(res) && res.success) {
        results.push(res.solutions);
        nextCmd = kernel.handleBacktrack();
      } else {
        break;
      }
    }
    return k(results);
  }

  private createLazyStream(
    nodes: LogicExecutable[],
    substs: Substitution,
  ): LazyList {
    const formatLogicResult = this.formatLogicResult;

    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = this.solveConjunction(nodes, substs);

    return createStream(
      function* () {
        while (true) {
          const res: unknown = kernel.run(nextCmd);
          if (isLogicStepResult(res) && res.success) {
            yield formatLogicResult(res.solutions);
            nextCmd = kernel.handleBacktrack();
          } else {
            break;
          }
        }
      }.bind(this),
    );
  }

  private createLazyStreamForGoal(
    id: string,
    patterns: Pattern[],
    substs: Substitution,
  ): LazyList {
    const formatLogicResult = this.formatLogicResult;
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = solveGoalKernel(
      this.context,
      id,
      patterns,
      (body, s) => this.solveConjunction(body, s),
      substs,
    );

    return createStream(
      function* () {
        while (true) {
          const res: unknown = kernel.run(nextCmd);
          if (isLogicStepResult(res) && res.success) {
            yield formatLogicResult(res.solutions);
            nextCmd = kernel.handleBacktrack();
          } else {
            break;
          }
        }
      }.bind(this),
    );
  }

  private formatLogicResult(substs: Substitution): LogicResult {
    const solutions = new Map<string, PrimitiveValue>();
    substs.forEach((pattern, key) => {
      const val = this.translator.patternToPrimitive(pattern, substs);
      if (val !== undefined) {
        solutions.set(key, val);

        const baseNameMatch = key.match(/^(.*)_\d+$/);
        if (baseNameMatch) {
          const baseName = baseNameMatch[1];
          if (!solutions.has(baseName)) {
            solutions.set(baseName, val);
          }
        }
      }
    });
    return { success: true, solutions };
  }
}
