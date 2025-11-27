import { expect } from "chai";
import {
  EquationRuntime,
  UnguardedBody,
  Sequence,
  Return,
  SymbolPrimitive,
  NumberPrimitive,
  LiteralPattern,
  VariablePattern,
  GuardedBody,
} from "@yukigo/ast";
import { FunctionRuntime } from "../../src/interpreter/components/FunctionRuntime.js";

const s = (val: string) => new SymbolPrimitive(val);
const n = (val: number) => new NumberPrimitive(val);
const litPat = (val: number | string) =>
  new LiteralPattern(typeof val === "number" ? n(val) : s(val));
const varPat = (name: string) => new VariablePattern(s(name));
const valExpr = (val: any) => ({ type: "Value", value: val } as any);
const varExpr = (name: string) => ({ type: "Variable", value: name } as any);
const seq = (stmts: any[]) => new Sequence(stmts);
const unguarded = (stmts: any[]) => new UnguardedBody(seq(stmts));
const guarded = (guards: { cond: any; body: any }[]): GuardedBody[] => {
  return guards.map((g) => new GuardedBody(g.cond, valExpr(g.body)));
};

class MockEvaluator {
  constructor(public env: any[]) {}

  evaluate(node: any): any {
    if (node.type === "Value") return node.value;
    if (node.type === "Variable") {
      const val = this.env[0].get(node.value);
      return val !== undefined ? val : `Error: ${node.value} not found`;
    }
    return node;
  }
}

describe("FunctionRuntime", () => {
  let globalEnv: any[];
  let evaluatorFactory: any;

  beforeEach(() => {
    globalEnv = [new Map()];
    evaluatorFactory = (env: any[]) => new MockEvaluator(env);
  });

  describe("Pattern Matching & Dispatch", () => {
    it("should match arguments to literal patterns", () => {
      const eq1: EquationRuntime = {
        patterns: [litPat(10)],
        body: unguarded([valExpr("ten")]),
      };
      const eq2: EquationRuntime = {
        patterns: [litPat(20)],
        body: unguarded([valExpr("twenty")]),
      };

      const result = FunctionRuntime.apply(
        "f",
        [eq1, eq2],
        [20],
        globalEnv,
        evaluatorFactory
      );

      expect(result).to.equal("twenty");
    });

    it("should throw error if no pattern matches (Non-exhaustive)", () => {
      const eq1: EquationRuntime = {
        patterns: [litPat(10)],
        body: unguarded([valExpr("ten")]),
      };

      expect(() => {
        FunctionRuntime.apply("f", [eq1], [99], globalEnv, evaluatorFactory);
      }).to.throw(/Non-exhaustive patterns/);
    });

    it("should skip equations with wrong arity (argument count)", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([valExpr("one arg")]),
      };

      expect(() => {
        FunctionRuntime.apply("f", [eq1], [1, 2], globalEnv, evaluatorFactory);
      }).to.throw(/Non-exhaustive patterns/);
    });
  });

  describe("Scope & Bindings", () => {
    it("should bind variables to a new local scope", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([varExpr("X")]),
      };

      const result = FunctionRuntime.apply(
        "identity",
        [eq1],
        [500],
        globalEnv,
        evaluatorFactory
      );

      expect(result).to.equal(500);
    });

    it("should prioritize local scope over global scope", () => {
      globalEnv[0].set("X", 1);

      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([varExpr("X")]),
      };

      const result = FunctionRuntime.apply(
        "shadow",
        [eq1],
        [999],
        globalEnv,
        evaluatorFactory
      );
      expect(result).to.equal(999);
    });
  });

  describe("Guarded Bodies", () => {
    const guardedEvaluatorFactory = (env: any[]) => ({
      evaluate: (node: any) => {
        if (node.type === "Condition") return node.value;
        if (node.type === "Value") return node.value;
        return null;
      },
    });

    it("should execute the body of the first true guard", () => {
      const guards = [
        { cond: { type: "Condition", value: false }, body: 1 },
        { cond: { type: "Condition", value: true }, body: 2 },
      ];

      const eq: EquationRuntime = {
        patterns: [varPat("_")],
        body: guarded(guards),
      };

      const result = FunctionRuntime.apply(
        "guards",
        [eq],
        [0],
        globalEnv,
        guardedEvaluatorFactory as any
      );
      expect(result).to.equal(2);
    });

    it("should fall through to next equation if no guard matches", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("_")],
        body: guarded([{ cond: { type: "Condition", value: false }, body: 1 }]),
      };

      const eq2: EquationRuntime = {
        patterns: [varPat("_")],
        body: unguarded([valExpr(2)]),
      };

      const result = FunctionRuntime.apply(
        "fallback",
        [eq1, eq2],
        [0],
        globalEnv,
        guardedEvaluatorFactory as any
      );
      expect(result).to.equal(2);
    });
  });

  describe("Imperative Sequences & Returns", () => {
    it("should return the value of the last statement implicitly", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([valExpr(10), valExpr(20), valExpr(30)]),
      };

      const result = FunctionRuntime.apply(
        "seq",
        [eq],
        [],
        globalEnv,
        evaluatorFactory
      );
      expect(result).to.equal(30);
    });

    it("should return early with Return statement", () => {
      const retStmt = new Return(valExpr(99));

      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([valExpr(10), retStmt, valExpr(30)]),
      };

      const result = FunctionRuntime.apply(
        "earlyRet",
        [eq],
        [],
        globalEnv,
        evaluatorFactory
      );
      expect(result).to.equal(99);
    });

    it("should return undefined for empty sequence", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([]),
      };
      const result = FunctionRuntime.apply(
        "empty",
        [eq],
        [],
        globalEnv,
        evaluatorFactory
      );
      expect(result).to.be.undefined;
    });
  });
});
