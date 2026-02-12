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
} from "yukigo-ast";
import {
  InternalLogicResult,
  solveFindall,
  solveGoal,
  Substitution,
  success,
  unify,
  instantiate,
} from "./LogicResolver.js";
import { PatternResolver } from "../PatternMatcher.js";
import { InterpreterConfig } from "../../index.js";
import {
  createStream,
  define,
  ExpressionEvaluator,
  pushEnv,
} from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { InterpreterVisitor } from "../Visitor.js";
import { LogicTranslator } from "./LogicTranslator.js";
import { idContinuation, trampoline } from "../../trampoline.js";

export type LogicExecutable = Expression | Statement | Goal | Exist | Findall;

export class LogicEngine {
  private translator: LogicTranslator;

  constructor(
    private env: EnvStack,
    private config: InterpreterConfig,
    private evaluator: ExpressionEvaluator,
  ) {
    this.translator = new LogicTranslator(env, evaluator);
  }

  public unifyExpr(left: Expression, right: Expression): PrimitiveValue {
    const p1 = this.translator.instantiateExpressionAsPattern(left, new Map());
    const p2 = this.translator.instantiateExpressionAsPattern(right, new Map());
    return unify(p1, p2, new Map()) !== null;
  }

  public solveQuery(node: Query): PrimitiveValue {
    const generator = this.solveConjunction(node.expressions, new Map());
    return this.handleOutputMode(generator);
  }

  public solveGoal(node: Goal): PrimitiveValue {
    const patterns = node.args.map((arg) => this.translator.expressionToPattern(arg));
    const generator = solveGoal(
      this.env,
      node.identifier.value,
      patterns,
      (body, substs) => this.solveConjunction(body, substs),
    );
    return this.handleOutputMode(generator);
  }

  public solveNot(node: Not): PrimitiveValue {
    const generator = this.solveConjunction([node.expression], new Map());
    const result = generator.next();
    return result.done === true;
  }

  public solveFindall(node: Findall): PrimitiveValue {
    const generator = this.solveConjunction([node.goal], new Map());
    const results: PrimitiveValue[] = [];
    for (const res of generator) {
      results.push(this.instantiateTemplate(node.template, res.substs));
    }
    return results;
  }

  public solveForall(node: Forall): PrimitiveValue {
    const conditionGenerator = this.solveConjunction([node.condition], new Map());

    for (const condResult of conditionGenerator) {
      const actionGenerator = this.solveConjunction([node.action], condResult.substs);
      if (actionGenerator.next().done) return false;
    }
    return true;
  }

  public solveExist(node: Exist): PrimitiveValue {
    const generator = solveGoal(
      this.env,
      node.identifier.value,
      node.patterns,
      (body, substs) => this.solveConjunction(body, substs),
    );
    return this.handleOutputMode(generator);
  }

  private *solveConjunction(
    nodes: LogicExecutable[],
    substs: Substitution,
  ): Generator<InternalLogicResult> {
    if (nodes.length === 0) {
      yield success(substs);
      return;
    }

    const [head, ...tail] = nodes;

    if (this.isLogicGoal(head)) {
      yield* this.solveLogicGoal(head, tail, substs);
    } else {
      yield* this.solveCondition(head as Expression | Statement, tail, substs);
    }
  }

  private isLogicGoal(node: LogicExecutable): node is Goal | Exist | Findall {
    return node instanceof Goal || node instanceof Exist || node instanceof Findall;
  }

  private *solveLogicGoal(
    goal: Goal | Exist | Findall,
    tail: LogicExecutable[],
    substs: Substitution,
  ): Generator<InternalLogicResult> {
    let generator: Generator<InternalLogicResult>;

    if (goal instanceof Findall) {
      generator = solveFindall(goal, substs, (body, s) => this.solveConjunction(body, s));
    } else {
      const { id, patterns } = this.prepareLogicTarget(goal, substs);
      generator = solveGoal(this.env, id, patterns, (body, s) => this.solveConjunction(body, s));
    }

    for (const result of generator) {
      const combinedSubsts = new Map([...substs, ...result.substs]);
      if (tail.length === 0) {
        yield success(combinedSubsts);
      } else {
        yield* this.solveConjunction(tail, combinedSubsts);
      }
    }
  }

  private *solveCondition(
    expr: Expression | Statement,
    tail: LogicExecutable[],
    substs: Substitution,
  ): Generator<InternalLogicResult> {
    const localEnv = this.createLocalEnv(substs);
    const localEvaluator = new InterpreterVisitor(localEnv, {});

    try {
      const evaluationThunk = localEvaluator.evaluate(expr, idContinuation);
      const result = trampoline(evaluationThunk);
      if (result) {
        if (tail.length === 0) {
          yield success(substs);
        } else {
          yield* this.solveConjunction(tail, substs);
        }
      }
    } catch (e) {
      // Expression failed or errored, this branch of logic fails
    }
  }

  private createLocalEnv(substs: Substitution): EnvStack {
    const localEnv = pushEnv(this.env, new Map());
    for (const [name, pattern] of substs) {
      const resolvedPattern = instantiate(pattern, substs);
      const value = this.translator.patternToPrimitive(resolvedPattern);
      if (value !== undefined) {
        define(localEnv, name, value);
      }
    }
    return localEnv;
  }

  private prepareLogicTarget(
    node: Goal | Exist,
    substs: Substitution,
  ): { id: string; patterns: Pattern[] } {
    const id = node.identifier.value;
    const patterns = (node instanceof Goal)
      ? node.args.map((arg) => this.translator.instantiateExpressionAsPattern(arg, substs))
      : node.patterns.map((pat) => this.translator.substitutePattern(pat, substs));
    
    return { id, patterns };
  }

  private instantiateTemplate(
    template: Expression,
    substs: Substitution,
  ): PrimitiveValue {
    const pat = this.translator.instantiateExpressionAsPattern(template, substs);
    const val = this.translator.patternToPrimitive(pat);
    if (val !== undefined) return val;
    throw new Error("Complex template instantiation not fully implemented");
  }

  private handleOutputMode(gen: Generator<InternalLogicResult>): PrimitiveValue {
    const mode = this.config.outputMode || "first";
    const self = this;

    switch (mode) {
      case "stream":
        return createStream(function* () {
          for (const res of gen) yield self.formatLogicResult(res.substs);
        });
      case "all": {
        const results: LogicResult[] = [];
        for (const res of gen) results.push(this.formatLogicResult(res.substs));
        return results;
      }
      case "first": {
        const next = gen.next();
        return next.done ? false : this.formatLogicResult(next.value.substs);
      }
      default:
        throw new InterpreterError("handleOutputMode", `Unsupported mode: ${mode}`);
    }
  }

  private formatLogicResult(substs: Substitution): LogicResult {
    const solutions = new Map<string, string>();
    const resolver = new PatternResolver();
    substs.forEach((pattern, key) => {
      solutions.set(key, pattern.accept(resolver));
    });
    return { success: true, solutions };
  }
}
