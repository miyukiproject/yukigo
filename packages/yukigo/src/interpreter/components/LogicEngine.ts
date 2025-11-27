import {
  Exist,
  Expression,
  Findall,
  Goal,
  isYukigoPrimitive,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  Query,
  SymbolPrimitive,
  Variable,
  VariablePattern,
} from "@yukigo/ast";
import {
  InternalLogicResult,
  solveGoal,
  Substitution,
} from "./LogicResolver.js";
import { PatternResolver } from "./PatternMatcher.js";
import { EnvStack, InterpreterConfig } from "../index.js";
import { createStream, ExpressionEvaluator } from "../utils.js";

export class LogicEngine {
  constructor(
    private env: EnvStack,
    private config: InterpreterConfig,
    private evaluator: ExpressionEvaluator
  ) {}

  public solveQuery(node: Query): PrimitiveValue {
    return this.evaluator.evaluate(node.expression);
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

  public solveFindall(node: Findall): PrimitiveValue {
    if (!(node.goal instanceof Goal)) throw new Error("Findall expects a Goal");

    const goalPatterns = node.goal.args.map((arg) => {
      return this.expressionToPattern(arg);
    });

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
      yield { success: true, substs };
      return;
    }

    const [head, ...tail] = expressions;
    let headGen: Generator<InternalLogicResult> | null = null;

    if (head instanceof Goal) {
      const args = head.args.map((arg) =>
        this.instantiateExpressionAsPattern(arg, substs)
      );
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
    if (expr instanceof VariablePattern) return expr;

    if (expr instanceof Variable) {
      const name = expr.identifier.value;
      if (/^[A-Z_]/.test(name)) return new VariablePattern(expr.identifier);
    }

    try {
      const val = this.evaluator.evaluate(expr);
      return this.primitiveToPattern(val);
    } catch (e) {
      if (expr instanceof Variable) return new VariablePattern(expr.identifier);
      throw e;
    }
  }

  private primitiveToPattern(val: PrimitiveValue): Pattern {
    if (
      typeof val === "number" ||
      typeof val === "string" ||
      typeof val === "boolean"
    )
      return new LiteralPattern(new SymbolPrimitive(String(val)));

    // TODO: Manejar arrays/listas complejas si es necesario
    throw new Error(`Cannot convert value ${val} to Logic Pattern`);
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
    template: Expression,
    substs: Substitution
  ): PrimitiveValue {
    const pat = this.instantiateExpressionAsPattern(template, substs);
    if (pat instanceof LiteralPattern) return this.evaluator.evaluate(pat.name);

    throw new Error("Complex template instantiation not fully implemented");
  }

  private handleOutputMode(
    gen: Generator<InternalLogicResult>
  ): PrimitiveValue {
    const mode = this.config.outputMode || "first";

    if (mode === "stream") {
      const self = this;
      return createStream(
        (function* () {
          for (const res of gen) yield self.formatLogicResult(res.substs);
        })()
      );
    }

    if (mode === "all") {
      const res = [];
      for (const r of gen) res.push(this.formatLogicResult(r.substs));
      return res;
    }

    const next = gen.next();
    if (next.done) return false;
    return this.formatLogicResult(next.value.substs);
  }

  private formatLogicResult(substs: Substitution): any {
    const solutions = new Map<string, string>();
    const resolver = new PatternResolver();
    substs.forEach((pattern, key) => {
      solutions.set(key, pattern.accept(resolver));
    });
    return { success: true, solutions };
  }
}
