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
} from "yukigo-ast";
import {
  Substitution,
  unify,
  instantiate,
  solveGoalKernel,
  solveFindallKernel,
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

export type LogicExecutable = Expression | Statement | Goal | Exist | Findall;

export class LogicEngine {
  private translator: LogicTranslator;

  constructor(
    private evaluator: Evaluator,
    private context: RuntimeContext,
  ) {
    this.translator = new LogicTranslator(evaluator, this.context);
  }

  public unifyExpr(
    left: Expression,
    right: Expression,
  ): ExecutionCommand {
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
      return this.collectAllResults(node.expressions, new Map(), (results) =>
        new StepCommand(results.map((s) => this.formatLogicResult(s))),
      );
    } else if (mode === "stream") {
      return new StepCommand(this.createLazyStream(node.expressions, new Map()));
    }
    // "first" mode
    return this.solveConjunction(
      node.expressions,
      new Map(),
    );
  }

  public solveGoal(
    node: Goal,
    modeOverride?: LogicSearchMode,
  ): ExecutionCommand {
    return this.prepareLogicTargetKernel(node, new Map(), ({ id, patterns }) => {
      const mode = modeOverride || this.context.config.outputMode || "first";
      if (mode === "all") {
        return this.collectAllResultsForGoal(
          id,
          patterns,
          new Map(),
          (results) => new StepCommand(results.map((s) => this.formatLogicResult(s))),
        );
      } else if (mode === "stream") {
        return new StepCommand(this.createLazyStreamForGoal(id, patterns, new Map()));
      }
      return solveGoalKernel(
        this.context,
        id,
        patterns,
        (body, s) => this.solveConjunction(body, s),
        new Map(),
      );
    });
  }

  public solveNot(
    node: Not,
  ): ExecutionCommand {
    return new ChoiceCommand([
       new BindCommand(this.solveConjunction([node.expression], new Map()), (res: any) => {
          if (res && res.success === true) return new FailCommand(new InterpreterError("Logic", "Goal succeeded, failing NOT"), true);
          return new StepCommand({ success: true });
       }),
       new StepCommand({ success: true })
    ]);
  }

  public solveFindall(
    node: Findall,
  ): ExecutionCommand {
    return solveFindallKernel(
      node,
      new Map(),
      this.evaluator,
      this.context,
      (body, substs) => this.solveConjunction(body, substs),
      (finalSubsts) => {
        const pat = finalSubsts.get((node.bag as any).name.value);
        const val = this.translator.patternToPrimitive(pat!, finalSubsts);
        return new StepCommand(val!);
      }
    );
  }

  public solveForall(
    node: Forall,
  ): ExecutionCommand {
    // forall(Cond, Action) is \+ (Cond, \+ Action)
    return this.solveNot(new Not(
       new Sequence([
          node.condition as any,
          new Not(node.action) as any
       ])
    ));
  }

  public solveExist(
    node: Exist,
    modeOverride?: LogicSearchMode,
  ): ExecutionCommand {
    return this.prepareLogicTargetKernel(node, new Map(), ({ id, patterns }) => {
      const mode = modeOverride || this.context.config.outputMode || "first";
      if (mode === "all") {
        return this.collectAllResultsForGoal(
          id,
          patterns,
          new Map(),
          (results) => new StepCommand(results.map((s) => this.formatLogicResult(s))),
        );
      } else if (mode === "stream") {
        return new StepCommand(this.createLazyStreamForGoal(id, patterns, new Map()));
      }
      return solveGoalKernel(
        this.context,
        id,
        patterns,
        (body, s) => this.solveConjunction(body, s),
        new Map(),
      );
    });
  }

  private solveConjunction(
    nodes: LogicExecutable[],
    substs: Substitution,
  ): ExecutionCommand {
    if (nodes.length === 0) {
      return new StepCommand(this.formatLogicResult(substs));
    }

    const [head, ...tail] = nodes;

    return new BindCommand(this.solveSingle(head, substs), (res: any) => {
      // Check if result indicates success
      if (res && (res.success === true || res.success === undefined)) {
         // res.solutions_internal should contain the substitution map from this goal
         const newSubsts = res.solutions_internal || substs;
         return this.solveConjunction(tail, newSubsts);
      }
      // If a goal in a conjunction fails, the WHOLE conjunction fails for THIS branch
      return new FailCommand(new InterpreterError("Logic", "Conjunction branch failed"), true);
    });
  }

  private solveSingle(
    node: LogicExecutable,
    substs: Substitution,
  ): ExecutionCommand {
    if (this.isLogicGoal(node))
      return this.solveLogicGoal(node, substs);
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
        (body, s) => this.solveConjunction(body, s),
        (finalSubsts) => new StepCommand(this.formatLogicResult(finalSubsts))
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

    return new BindCommand(localEvaluator.evaluate(expr), (result) => {
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
            return new FailCommand(new Error("Unification failed"), true);
          }
        }
        const res = this.formatLogicResult(currentSubsts);
        (res as any).solutions_internal = currentSubsts;
        return new StepCommand(res);
      }
      return new FailCommand(new Error("Condition failed"), true);
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

      // map base name if it was standardized apart ("X_1" -> "X")
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
    
    // This part is tricky: we want ALL results. 
    // We can use a loop that manually calls backtrack or a special collector.
    // For simplicity, let's keep a mini-loop here for now.
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = this.solveConjunction(nodes, substs);

    while(true) {
        const res = kernel.run(nextCmd);
        if (res && (res as any).success) {
            results.push((res as any).solutions_internal || new Map());
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
    let nextCmd = solveGoalKernel(this.context, id, patterns, (body, s) => this.solveConjunction(body, s), substs);

    while(true) {
        const res = kernel.run(nextCmd);
        if (res && (res as any).success) {
            results.push((res as any).solutions_internal || new Map());
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
  ): any {
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = this.solveConjunction(nodes, substs);

    return createStream(() => {
      return {
        next: () => {
          const res = kernel.run(nextCmd);
          if (res && (res as any).success) {
            const formatted = this.formatLogicResult((res as any).solutions_internal || new Map());
            nextCmd = kernel.handleBacktrack();
            return { value: formatted, done: false };
          }
          return { value: undefined, done: true };
        },
      } as any;
    });
  }

  private createLazyStreamForGoal(
    id: string,
    patterns: Pattern[],
    substs: Substitution,
  ): any {
    const kernel = new YukigoKernel(this.evaluator);
    let nextCmd = solveGoalKernel(this.context, id, patterns, (body, s) => this.solveConjunction(body, s), substs);

    return createStream(() => {
      return {
        next: () => {
          const res = kernel.run(nextCmd);
          if (res && (res as any).success) {
            const formatted = this.formatLogicResult((res as any).solutions_internal || new Map());
            nextCmd = kernel.handleBacktrack();
            return { value: formatted, done: false };
          }
          return { value: undefined, done: true };
        },
      } as any;
    });
  }

  private formatLogicResult(substs: Substitution): LogicResult {
    const solutions = new Map<string, PrimitiveValue>();
    substs.forEach((pattern, key) => {
      const val = this.translator.patternToPrimitive(pattern, substs);
      if (val !== undefined) {
        solutions.set(key, val);

        // Also map base name if it was standardized apart (e.g., "X_1" -> "X")
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
