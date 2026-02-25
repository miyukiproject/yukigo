import {
  Exist,
  Expression,
  Findall,
  Forall,
  Goal,
  ListPattern,
  LiteralPattern,
  Not,
  Pattern,
  PrimitiveValue,
  Query,
  SymbolPrimitive,
  Variable,
  VariablePattern,
  EnvStack,
  LogicResult,
  ConsPattern,
  isLazyList,
} from "yukigo-ast";
import {
  InternalLogicResult,
  solveGoal,
  Substitution,
  success,
  unify,
} from "./LogicResolver.js";
import { PatternResolver } from "./PatternMatcher.js";
import { InterpreterConfig } from "../index.js";
import { createStream, ExpressionEvaluator, isDefined } from "../utils.js";
import { InterpreterError } from "../errors.js";

class LazyConsPattern extends ConsPattern {
  private tailThunk: () => Pattern;
  private resolvedTail: Pattern | null = null;

  constructor(head: Pattern, tailThunk: () => Pattern) {
    // we pass a empty list pattern to super because we override access to it.
    super(head, new ListPattern([]));
    this.tailThunk = tailThunk;
    // lol
    Object.defineProperty(this, "right", {
      get: () => {
        if (!this.resolvedTail) this.resolvedTail = this.tailThunk();
        return this.resolvedTail;
      },
      configurable: true,
    });
  }
}

export class LogicEngine {
  constructor(
    private env: EnvStack,
    private config: InterpreterConfig,
    private evaluator: ExpressionEvaluator
  ) {}
  public unifyExpr(left: Expression, right: Expression): PrimitiveValue {
    const p1 = this.instantiateExpressionAsPattern(left, new Map());
    const p2 = this.instantiateExpressionAsPattern(right, new Map());
    const resultSubsts = unify(p1, p2, new Map());
    return resultSubsts !== null;
  }
  public solveQuery(node: Query): PrimitiveValue {
    const generator = this.solveConjunction(node.expressions, new Map());
    return this.handleOutputMode(generator);
  }

  public solveGoal(node: Goal): PrimitiveValue {
    const patterns = node.args;
    const generator = solveGoal(
      this.env,
      node.identifier.value,
      patterns,
      (body, substs) => this.solveConjunction(body, substs)
    );
    return this.handleOutputMode(generator);
  }
  public solveNot(node: Not): PrimitiveValue {
    const generator = this.solveConjunction(node.expressions, new Map());
    const result = generator.next();
    return result.done === true;
  }
  public solveFindall(node: Findall): PrimitiveValue {
    if (!(node.goal instanceof Goal))
      throw new InterpreterError("solveFindall", "Findall expects a Goal");

    const goalPatterns = node.goal.args;

    const generator = solveGoal(
      this.env,
      node.goal.identifier.value,
      goalPatterns,
      (b, s) => this.solveConjunction(b, s)
    );

    const results: PrimitiveValue[] = [];
    for (const res of generator)
      results.push(this.instantiateTemplate(node.template, res.substs));

    return results;
  }
  public solveForall(node: Forall): PrimitiveValue {
    const conditionGenerator = this.solveConjunction(
      [node.condition],
      new Map()
    );

    for (const condResult of conditionGenerator) {
      const actionGenerator = this.solveConjunction(
        [node.action],
        condResult.substs
      );
      const actionResult = actionGenerator.next();

      if (actionResult.done) return false;
    }
    return true;
  }
  public solveExist(node: Exist): PrimitiveValue {
    const generator = solveGoal(
      this.env,
      node.identifier.value,
      node.patterns,
      (body, substs) => this.solveConjunction(body, substs)
    );
    return this.handleOutputMode(generator);
  }

  private *solveConjunction(
    expressions: Expression[],
    substs: Substitution
  ): Generator<InternalLogicResult> {
    if (expressions.length === 0) {
      yield success(substs);
      return;
    }

    const [head, ...tail] = expressions;
    let headGen: Generator<InternalLogicResult> | null = null;

    if (head instanceof Goal) {
      const args = head.args.map((arg) => this.substitutePattern(arg, substs));
      headGen = solveGoal(this.env, head.identifier.value, args, (b, s) =>
        this.solveConjunction(b, s)
      );
    } else if (head instanceof Exist) {
      const patterns = head.patterns.map((pat) =>
        this.substitutePattern(pat, substs)
      );
      headGen = solveGoal(this.env, head.identifier.value, patterns, (b, s) =>
        this.solveConjunction(b, s)
      );
    }

    if (headGen) {
      // backtracking
      for (const headResult of headGen) {
        const newSubsts = new Map([...substs, ...headResult.substs]);
        yield* this.solveConjunction(tail, newSubsts);
      }
    } else {
      // imperative
      const result = this.evaluator.evaluate(head);
      if (result) yield* this.solveConjunction(tail, substs);
    }
  }

  private expressionToPattern(expr: Expression): Pattern {
    if (expr instanceof Variable) {
      const name = expr.identifier.value;
      if (isDefined(this.env, name)) {
        const val = this.evaluator.evaluate(expr);
        return this.primitiveToPattern(val);
      }
      return new VariablePattern(expr.identifier);
    }
    const val = this.evaluator.evaluate(expr);
    return this.primitiveToPattern(val);
  }

  private primitiveToPattern(val: PrimitiveValue): Pattern {
    if (
      typeof val === "number" ||
      typeof val === "string" ||
      typeof val === "boolean"
    )
      return new LiteralPattern(new SymbolPrimitive(String(val)));

    if (Array.isArray(val))
      return new ListPattern(val.map((v) => this.primitiveToPattern(v)));

    if (isLazyList(val)) return this.iteratorToPattern(val.generator());

    throw new InterpreterError(
      "primitiveToPattern",
      `Cannot convert value ${val} to Logic Pattern`
    );
  }

  private iteratorToPattern(
    iter: Generator<PrimitiveValue, void, unknown>
  ): Pattern {
    const next = iter.next();
    if (next.done) return new ListPattern([]);
    return new LazyConsPattern(this.primitiveToPattern(next.value), () =>
      this.iteratorToPattern(iter)
    );
  }

  private instantiateExpressionAsPattern(
    expr: Expression,
    substs: Substitution
  ): Pattern {
    const patternBase = this.expressionToPattern(expr);
    return this.substitutePattern(patternBase, substs);
  }

  private substitutePattern(
    pat: Pattern,
    substs: Substitution,
    visited: Set<string> = new Set()
  ): Pattern {
    if (pat instanceof VariablePattern) {
      const name = pat.name.value;
      if (visited.has(name)) return pat;

      const val = substs.get(name);
      if (val) {
        const newVisited = new Set(visited);
        newVisited.add(name);
        return this.substitutePattern(val, substs, newVisited);
      }
    }
    return pat;
  }

  private instantiateTemplate(
    template: Pattern,
    substs: Substitution
  ): PrimitiveValue {
    const pat = this.substitutePattern(template, substs);
    if (pat instanceof LiteralPattern) return this.evaluator.evaluate(pat.name);

    throw new Error("Complex template instantiation not fully implemented");
  }

  private handleOutputMode(
    gen: Generator<InternalLogicResult>
  ): PrimitiveValue {
    const mode = this.config.outputMode || "first";
    switch (mode) {
      case "stream": {
        const self = this;
        return createStream(function* () {
          for (const res of gen) yield self.formatLogicResult(res.substs);
        });
      }
      case "all": {
        const res: LogicResult[] = [];
        for (const r of gen) res.push(this.formatLogicResult(r.substs));
        return res;
      }
      case "first": {
        const next = gen.next();
        if (next.done) return false;
        return this.formatLogicResult(next.value.substs);
      }

      default:
        throw new InterpreterError(
          "handleOutputMode",
          `Unsupported mode: ${mode}. Supported modes: all | stream | first`
        );
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
