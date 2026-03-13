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
  EnvStack,
  RuntimeFunction,
  StringPrimitive,
  Variable,
  Expression,
  BooleanPrimitive,
  Equation,
} from "yukigo-ast";
import { FunctionRuntime } from "../../src/interpreter/components/runtimes/FunctionRuntime.js";
import { createGlobalEnv } from "../../src/interpreter/utils.js";
import {
  idContinuation,
  trampoline,
} from "../../src/interpreter/trampoline.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";

const symbol = (val: string) => new SymbolPrimitive(val);
const num = (val: number) => new NumberPrimitive(val);
const str = (val: string) => new StringPrimitive(val);
const litPat = (val: number | string) =>
  new LiteralPattern(typeof val === "number" ? num(val) : symbol(val));
const varPat = (name: string) => new VariablePattern(symbol(name));
const varExpr = (name: string, expr: Expression) =>
  new Variable(symbol(name), expr);
const seq = (stmts: any[]) => new Sequence(stmts);
const unguarded = (stmts: any[]) => new UnguardedBody(seq(stmts));
const guarded = (guards: { cond: any; body: Expression }[]): GuardedBody[] => {
  return guards.map((g) => new GuardedBody(g.cond, g.body));
};

const makeRunFunc = (
  identifier: string,
  arity: number,
  equations: EquationRuntime[],
): RuntimeFunction => ({ type: "Function", identifier, arity, equations });

describe("FunctionRuntime", () => {
  let globalEnv: EnvStack;

  let funcRuntime: FunctionRuntime;
  beforeEach(() => {
    globalEnv = createGlobalEnv();
    const context = new RuntimeContext();
    context.setEnv(globalEnv);
    funcRuntime = new FunctionRuntime(context);
  });

  describe("Pattern Matching & Dispatch", () => {
    it("should match arguments to literal patterns", () => {
      const eq1: EquationRuntime = {
        patterns: [litPat(10)],
        body: unguarded([str("ten")]),
      };
      const eq2: EquationRuntime = {
        patterns: [litPat(20)],
        body: unguarded([str("twenty")]),
      };

      const resultThunk = funcRuntime.apply(
        makeRunFunc("f", 1, [eq1, eq2]),
        [20],
        idContinuation,
      );
      const result = trampoline(resultThunk);

      expect(result).to.equal("twenty");
    });

    it("should throw error if no pattern matches (Non-exhaustive)", () => {
      const eq1: EquationRuntime = {
        patterns: [litPat(10)],
        body: unguarded([str("ten")]),
      };

      expect(() => {
        trampoline(
          funcRuntime.apply(makeRunFunc("f", 1, [eq1]), [99], idContinuation),
        );
      }).to.throw(/Non-exhaustive patterns/);
    });

    it("should skip equations with wrong arity (argument count)", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([str("one arg")]),
      };

      expect(() => {
        trampoline(
          funcRuntime.apply(makeRunFunc("f", 2, [eq1]), [1, 2], idContinuation),
        );
      }).to.throw(/Non-exhaustive patterns/);
    });
  });

  describe("Scope & Bindings", () => {
    it("should bind variables to a new local scope", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([num(500)]),
      };

      const result = trampoline(
        funcRuntime.apply(
          makeRunFunc("identity", 1, [eq1]),
          [500],
          idContinuation,
        ),
      );

      expect(result).to.equal(500);
    });

    it("should prioritize local scope over global scope", () => {
      globalEnv.head.set("X", 1);

      const eq1: EquationRuntime = new Equation(
        [new VariablePattern(new SymbolPrimitive("X"))],
        new UnguardedBody(new Sequence([new Return(new SymbolPrimitive("X"))])),
        new Return(new SymbolPrimitive("X")),
      );

      const result = trampoline(
        funcRuntime.apply(
          makeRunFunc("shadow", 1, [eq1]),
          [999],
          idContinuation,
        ),
      );
      expect(result).to.equal(999);
    });
  });

  describe("Guarded Bodies", () => {
    it("should execute the body of the first true guard", () => {
      const guards = [
        new GuardedBody(new BooleanPrimitive(false), num(1)),
        new GuardedBody(new BooleanPrimitive(true), num(2)),
      ];

      const eq: EquationRuntime = {
        patterns: [varPat("_")],
        body: guards,
      };

      const result = trampoline(
        funcRuntime.apply(makeRunFunc("guards", 1, [eq]), [0], idContinuation),
      );
      expect(result).to.equal(2);
    });

    it("should fall through to next equation if no guard matches", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("_")],
        body: [new GuardedBody(new BooleanPrimitive(false), num(1))],
      };

      const eq2: EquationRuntime = {
        patterns: [varPat("_")],
        body: unguarded([num(2)]),
      };

      const result = trampoline(
        funcRuntime.apply(
          makeRunFunc("fallback", 1, [eq1, eq2]),
          [0],
          idContinuation,
        ),
      );
      expect(result).to.equal(2);
    });
  });

  describe("Imperative Sequences & Returns", () => {
    it("should return the value of the last statement implicitly", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([num(10), num(20), num(30)]),
      };

      const result = trampoline(
        funcRuntime.apply(makeRunFunc("seq", 1, [eq]), [], idContinuation),
      );
      expect(result).to.equal(30);
    });

    it("should return early with Return statement", () => {
      const retStmt = new Return(num(99));

      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([num(10), retStmt, num(30)]),
      };

      const result = trampoline(
        funcRuntime.apply(makeRunFunc("earlyRet", 1, [eq]), [], idContinuation),
      );
      expect(result).to.equal(99);
    });

    it("should return undefined for empty sequence", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([]),
      };
      const result = trampoline(
        funcRuntime.apply(makeRunFunc("empty", 1, [eq]), [], idContinuation),
      );
      expect(result).to.be.undefined;
    });
  });
});
