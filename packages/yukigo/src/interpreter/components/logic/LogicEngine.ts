import {
  Exist,
  Expression,
  Findall,
  Forall,
  Goal,
  Pattern,
  PrimitiveValue,
  Query,
  EnvStack,
  LogicResult,
  Statement,
  Not,
  LogicConstraint,
  Sequence,
  SymbolPrimitive,
  VariablePattern,
} from "yukigo-ast";
import {
  solveFindallCPS,
  solveGoalCPS,
  Substitution,
  unify,
  instantiate,
  SuccessCont,
  FailureCont,
} from "./LogicResolver.js";
import {
  createStream,
  define,
  ExpressionEvaluator,
  pushEnv,
} from "../../utils.js";
import { InterpreterVisitor } from "../Visitor.js";
import { LogicTranslator } from "./LogicTranslator.js";
import { trampoline, Continuation, Thunk } from "../../trampoline.js";
import { RuntimeContext, LogicSearchMode } from "../RuntimeContext.js";

export type LogicExecutable = Expression | Statement | Goal | Exist | Findall;

export class LogicEngine {
  private translator: LogicTranslator;

  constructor(
    private env: EnvStack,
    evaluator: ExpressionEvaluator,
    private context: RuntimeContext,
  ) {
    this.translator = new LogicTranslator(env, evaluator);
  }

  public unifyExpr(
    left: Expression,
    right: Expression,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    return this.translator.instantiateExpressionAsPattern(
      left,
      new Map(),
      (p1) => {
        return () =>
          this.translator.instantiateExpressionAsPattern(
            right,
            new Map(),
            (p2) => {
              return k(unify(p1, p2, new Map()) !== null);
            },
          );
      },
    );
  }

  public solveQuery(
    node: Query,
    k: Continuation<PrimitiveValue>,
    modeOverride?: LogicSearchMode,
  ): Thunk<PrimitiveValue> {
    const mode = modeOverride || this.context.config.outputMode || "first";
    if (mode === "all") {
      return this.collectAllResults(node.expressions, new Map(), (results) =>
        k(results.map((s) => this.formatLogicResult(s))),
      );
    } else if (mode === "stream") {
      return k(this.createLazyStream(node.expressions, new Map()));
    }
    // "first" mode
    return this.solveConjunction(
      node.expressions,
      new Map(),
      (s) => k(this.formatLogicResult(s)),
      () => k(false),
    );
  }

  public solveGoal(
    node: Goal,
    k: Continuation<PrimitiveValue>,
    modeOverride?: LogicSearchMode,
  ): Thunk<PrimitiveValue> {
    return this.prepareLogicTargetCPS(node, new Map(), ({ id, patterns }) => {
      // Goals evaluated as expressions should usually default to "first"
      // to avoid combinatorial explosion when they are part of a sequence.
      const mode = modeOverride || this.context.config.outputMode || "first";
      if (mode === "all") {
        return this.collectAllResultsForGoal(
          id,
          patterns,
          new Map(),
          (results) => k(results.map((s) => this.formatLogicResult(s))),
        );
      } else if (mode === "stream") {
        return k(this.createLazyStreamForGoal(id, patterns, new Map()));
      }
      return solveGoalCPS(
        this.env,
        id,
        patterns,
        (body, s, onSucc, onFail) =>
          this.solveConjunction(body, s, onSucc, onFail),
        new Map(),
        (s) => k(this.formatLogicResult(s)),
        () => k(false),
      );
    });
  }

  public solveNot(
    node: Not,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    return () =>
      this.solveConjunction(
        [node.expression],
        new Map(),
        () => k(false),
        () => k(true),
      );
  }

  public solveFindall(
    node: Findall,
    k: Continuation<PrimitiveValue>,
  ): Thunk<PrimitiveValue> {
    return solveFindallCPS(
      node,
      new Map(),
      (body, substs, onSuccess, onFailure) =>
        this.solveConjunction(body, substs, onSuccess, onFailure),
      (finalSubsts) => {
        const pat = finalSubsts.get((node.bag as any).name.value);
        const val = this.translator.patternToPrimitive(pat!);
        return k(val!);
      },
      () => k([]),
    );
  }

  public solveForall(
    node: Forall,
    k: Continuation<PrimitiveValue>,
  ): Thunk<any> {
    return this.solveConjunction(
      [node.condition],
      new Map(),
      (condSubsts, nextCond) => {
        return this.solveConjunction(
          [node.action],
          condSubsts,
          () => nextCond,
          () => k(false),
        );
      },
      () => k(true),
    );
  }

  public solveExist(
    node: Exist,
    k: Continuation<PrimitiveValue>,
    modeOverride?: LogicSearchMode,
  ): Thunk<PrimitiveValue> {
    return this.prepareLogicTargetCPS(node, new Map(), ({ id, patterns }) => {
      // Exists evaluated as expressions should usually default to "first"
      const mode = modeOverride || this.context.config.outputMode || "first";
      if (mode === "all") {
        return this.collectAllResultsForGoal(
          id,
          patterns,
          new Map(),
          (results) => k(results.map((s) => this.formatLogicResult(s))),
        );
      } else if (mode === "stream") {
        return k(this.createLazyStreamForGoal(id, patterns, new Map()));
      }
      return solveGoalCPS(
        this.env,
        id,
        patterns,
        (body, s, onSucc, onFail) =>
          this.solveConjunction(body, s, onSucc, onFail),
        new Map(),
        (s) => k(this.formatLogicResult(s)),
        () => k(false),
      );
    });
  }

  private solveConjunction(
    nodes: LogicExecutable[],
    substs: Substitution,
    onSuccess: SuccessCont,
    onFailure: FailureCont,
  ): Thunk<any> {
    if (nodes.length === 0) {
      return onSuccess(substs, onFailure);
    }

    const [head, ...tail] = nodes;

    return () =>
      this.solveSingle(
        head,
        substs,
        (newSubsts, next) => {
          return this.solveConjunction(tail, newSubsts, onSuccess, next);
        },
        onFailure,
      );
  }

  private solveSingle(
    node: LogicExecutable,
    substs: Substitution,
    onSuccess: SuccessCont,
    onFailure: FailureCont,
  ): Thunk<any> {
    if (this.isLogicGoal(node)) {
      return () => this.solveLogicGoal(node, substs, onSuccess, onFailure);
    } else {
      return () =>
        this.solveCondition(
          node as Expression | Statement,
          substs,
          onSuccess,
          onFailure,
        );
    }
  }

  private solveLogicGoal(
    goal: Goal | Exist | Findall | LogicConstraint | Sequence,
    substs: Substitution,
    onSuccess: SuccessCont,
    onFailure: FailureCont,
  ): Thunk<any> {
    if (goal instanceof LogicConstraint) {
      return () =>
        this.solveConjunction([goal.expression], substs, onSuccess, onFailure);
    }

    if (goal instanceof Sequence) {
      return () =>
        this.solveConjunction(goal.statements, substs, onSuccess, onFailure);
    }

    if (goal instanceof Findall) {
      return solveFindallCPS(
        goal,
        substs,
        (body, s, onSucc, onFail) =>
          this.solveConjunction(body, s, onSucc, onFail),
        onSuccess,
        onFailure,
      );
    }

    return this.prepareLogicTargetCPS(goal, substs, ({ id, patterns }) => {
      return solveGoalCPS(
        this.env,
        id,
        patterns,
        (body, s, onSucc, onFail) =>
          this.solveConjunction(body, s, onSucc, onFail),
        substs,
        onSuccess,
        onFailure,
      );
    });
  }

  private solveCondition(
    expr: Expression | Statement,
    substs: Substitution,
    onSuccess: SuccessCont,
    onFailure: FailureCont,
  ): Thunk<any> {
    const localEnv = this.createLocalEnv(substs);
    const localEvaluator = new InterpreterVisitor(localEnv, this.context);

    return localEvaluator.evaluate(expr, (result) => {
      if (result !== undefined && result !== false) {
        let currentSubsts = new Map(substs);
        for (const [name, val] of localEnv.head) {
          const pat = this.translator.primitiveToPattern(val);
          const unified = unify(
            new VariablePattern(new SymbolPrimitive(name)),
            pat,
            currentSubsts,
          );
          if (unified) {
            currentSubsts = unified;
          } else {
            return onFailure();
          }
        }
        return onSuccess(currentSubsts, onFailure);
      }
      return onFailure();
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

  private createLocalEnv(substs: Substitution): EnvStack {
    const localEnv = pushEnv(this.env, new Map());
    for (const [name, pattern] of substs) {
      const resolvedPattern = instantiate(pattern, substs);
      const value = this.translator.patternToPrimitive(resolvedPattern);

      define(localEnv, name, value);

      // Also map base name if it was standardized apart (e.g., "X_1" -> "X")
      const baseNameMatch = name.match(/^(.*)_\d+$/);
      if (baseNameMatch) {
        const baseName = baseNameMatch[1];
        if (!localEnv.head.has(baseName)) {
          define(localEnv, baseName, value);
        }
      }
    }
    return localEnv;
  }

  private prepareLogicTargetCPS(
    node: Goal | Exist,
    substs: Substitution,
    k: (res: { id: string; patterns: Pattern[] }) => Thunk<any>,
  ): Thunk<any> {
    const id = node.identifier.value;
    if (node instanceof Goal) {
      const patterns: Pattern[] = [];
      const next = (index: number): Thunk<any> => {
        if (index >= node.args.length) return k({ id, patterns });
        return this.translator.instantiateExpressionAsPattern(
          node.args[index],
          substs,
          (p) => {
            patterns.push(p);
            return () => next(index + 1);
          },
        );
      };
      return () => next(0);
    } else {
      const patterns = node.patterns.map((pat) => instantiate(pat, substs));
      return k({ id, patterns });
    }
  }

  private collectAllResults(
    nodes: LogicExecutable[],
    substs: Substitution,
    k: (results: Substitution[]) => Thunk<any>,
  ): Thunk<any> {
    const results: Substitution[] = [];
    return this.solveConjunction(
      nodes,
      substs,
      (s, next) => {
        results.push(s);
        return next;
      },
      () => k(results),
    );
  }

  private collectAllResultsForGoal(
    id: string,
    patterns: Pattern[],
    substs: Substitution,
    k: (results: Substitution[]) => Thunk<any>,
  ): Thunk<any> {
    const results: Substitution[] = [];
    return solveGoalCPS(
      this.env,
      id,
      patterns,
      (body, s, onSucc, onFail) =>
        this.solveConjunction(body, s, onSucc, onFail),
      substs,
      (s, next) => {
        results.push(s);
        return next;
      },
      () => k(results),
    );
  }

  private createLazyStream(
    nodes: LogicExecutable[],
    substs: Substitution,
  ): any {
    let currentSubst: Substitution | null = null;
    let currentNext: (() => Thunk<any>) | null = null;

    let thunk = this.solveConjunction(
      nodes,
      substs,
      (s, next) => {
        currentSubst = s;
        currentNext = next;
        return null;
      },
      () => {
        currentSubst = null;
        return null;
      },
    );

    return createStream(() => {
      return {
        next: () => {
          trampoline(thunk);
          if (currentSubst) {
            const res = this.formatLogicResult(currentSubst);
            thunk = currentNext!();
            return { value: res, done: false };
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
    let currentSubst: Substitution | null = null;
    let currentNext: (() => Thunk<any>) | null = null;

    let thunk = solveGoalCPS(
      this.env,
      id,
      patterns,
      (body, s, onSucc, onFail) =>
        this.solveConjunction(body, s, onSucc, onFail),
      substs,
      (s, next) => {
        currentSubst = s;
        currentNext = next;
        return null;
      },
      () => {
        currentSubst = null;
        return null;
      },
    );

    return createStream(() => {
      return {
        next: () => {
          trampoline(thunk);
          if (currentSubst) {
            const res = this.formatLogicResult(currentSubst);
            thunk = currentNext!();
            return { value: res, done: false };
          }
          return { value: undefined, done: true };
        },
      } as any;
    });
  }

  private formatLogicResult(substs: Substitution): LogicResult {
    const solutions = new Map<string, PrimitiveValue>();
    substs.forEach((pattern, key) => {
      const val = this.translator.patternToPrimitive(pattern);
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
