import { expect } from "chai";
import {
  UnguardedBody,
  Sequence,
  Return,
  SymbolPrimitive,
  NumberPrimitive,
  LiteralPattern,
  VariablePattern,
  GuardedExpression,
  StringPrimitive,
  BooleanPrimitive,
  Equation,
  Guard,
} from "yukigo-ast";
import { FunctionRuntime } from "../../src/interpreter/components/runtimes/FunctionRuntime.js";
import { createGlobalEnv, EnvStack } from "../../src/interpreter/utils.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import {
  YuValue,
  EquationRuntime,
  RuntimeFunction,
  YuNumber,
} from "../../src/interpreter/primitives/index.js";

const symbol = (val: string) => new SymbolPrimitive(val);
const num = (val: number) => new NumberPrimitive(val);
const str = (val: string) => new StringPrimitive(val);
const litPat = (val: number | string) =>
  new LiteralPattern(typeof val === "number" ? num(val) : symbol(val));
const varPat = (name: string) => new VariablePattern(symbol(name));

const seq = (stmts: any[]) => new Sequence(stmts);
const unguarded = (stmts: any[]) => new UnguardedBody(seq(stmts));

const makeRunFunc = (
  identifier: string,
  arity: number,
  equations: EquationRuntime[],
) => new RuntimeFunction(arity, equations, identifier);

describe("FunctionRuntime", () => {
  let globalEnv: EnvStack;
  let context: RuntimeContext;
  let funcRuntime: FunctionRuntime;
  let kernel: YukigoKernel;

  beforeEach(() => {
    globalEnv = createGlobalEnv();
    context = new RuntimeContext();
    context.setEnv(globalEnv);
    funcRuntime = new FunctionRuntime(context);
    kernel = new YukigoKernel(new InterpreterVisitor(context));
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

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("f", 1, [eq1, eq2]), [new YuNumber(20)]),
      ) as YuValue;

      expect(result.toJSON()).to.equal("twenty");
    });

    it("should throw error if no pattern matches (Non-exhaustive)", () => {
      const eq1: EquationRuntime = {
        patterns: [litPat(10)],
        body: unguarded([str("ten")]),
      };

      expect(() => {
        kernel.run(
          funcRuntime.apply(makeRunFunc("f", 1, [eq1]), [new YuNumber(99)]),
        );
      }).to.throw(/Non-exhaustive patterns/);
    });

    it("should skip equations with wrong arity (argument count)", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("X")],
        body: unguarded([str("one arg")]),
      };

      expect(() => {
        kernel.run(
          funcRuntime.apply(makeRunFunc("f", 2, [eq1]), [
            new YuNumber(1),
            new YuNumber(2),
          ]),
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

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("identity", 1, [eq1]), [
          new YuNumber(500),
        ]),
      ) as YuValue;

      expect(result.toJSON()).to.equal(500);
    });

    it("should prioritize local scope over global scope", () => {
      globalEnv.head.set("X", new YuNumber(1));

      const eq1: EquationRuntime = new Equation(
        [new VariablePattern(new SymbolPrimitive("X"))],
        new UnguardedBody(new Sequence([new Return(new SymbolPrimitive("X"))])),
        new Return(new SymbolPrimitive("X")),
      );

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("shadow", 1, [eq1]), [new YuNumber(999)]),
      ) as YuValue;
      expect(result.toJSON()).to.equal(999);
    });
  });

  describe("Guarded Bodies", () => {
    it("should execute the body of the first true guard", () => {
      const guards = [
        new Guard(new BooleanPrimitive(false), num(1)),
        new Guard(new BooleanPrimitive(true), num(2)),
      ];

      const eq: EquationRuntime = {
        patterns: [varPat("_")],
        body: new UnguardedBody(
          new Sequence([new Return(new GuardedExpression(guards))]),
        ),
      };

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("guards", 1, [eq]), [new YuNumber(0)]),
      ) as YuValue;
      expect(result.toJSON()).to.equal(2);
    });

    it("should fall through to next equation if no guard matches", () => {
      const eq1: EquationRuntime = {
        patterns: [varPat("_")],
        body: new UnguardedBody(
          new Sequence([
            new Return(
              new GuardedExpression([
                new Guard(new BooleanPrimitive(false), num(1)),
              ]),
            ),
          ]),
        ),
      };

      const eq2: EquationRuntime = {
        patterns: [varPat("_")],
        body: unguarded([num(2)]),
      };

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("fallback", 1, [eq1, eq2]), [
          new YuNumber(0),
        ]),
      ) as YuValue;
      expect(result.toJSON()).to.equal(2);
    });
  });

  describe("Imperative Sequences & Returns", () => {
    it("should return the value of the last statement implicitly", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([num(10), num(20), num(30)]),
      };

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("seq", 1, [eq]), []),
      ) as YuValue;
      expect(result.toJSON()).to.equal(30);
    });

    it("should return early with Return statement", () => {
      const retStmt = new Return(num(99));

      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([num(10), retStmt, num(30)]),
      };

      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("earlyRet", 1, [eq]), []),
      ) as YuValue;
      expect(result.toJSON()).to.equal(99);
    });

    it("should return undefined for empty sequence", () => {
      const eq: EquationRuntime = {
        patterns: [],
        body: unguarded([]),
      };
      const result = kernel.run(
        funcRuntime.apply(makeRunFunc("empty", 1, [eq]), []),
      ) as YuValue;
      expect(result.toJSON()).to.be.null; // YuNil.toJSON() is null
    });
  });
});
