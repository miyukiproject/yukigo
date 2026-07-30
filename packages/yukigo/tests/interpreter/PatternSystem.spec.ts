import { expect } from "chai";
import {
  VariablePattern,
  LiteralPattern,
  SymbolPrimitive,
  NumberPrimitive,
  WildcardPattern,
  ConsPattern,
  ListPattern,
  ConstructorPattern,
  UnionPattern,
  AsPattern,
} from "yukigo-ast";
import { PatternMatcher } from "../../src/interpreter/components/PatternMatcher.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { StepCommand } from "../../src/interpreter/components/kernel/commands.js";
import {
  YuValue,
  YuNumber,
  YuArray,
  YuString,
  LazyList,
  YuNil,
  LazyStepResult,
  isLazyList,
  YuSequence,
} from "../../src/interpreter/primitives/index.js";
import { InterpreterVisitor } from "../../src/interpreter/components/evaluators/index.js";

const s = (v: string) => new SymbolPrimitive(v);
const n = (v: number) => new NumberPrimitive(v);
const lit = (v: string | number) =>
  new LiteralPattern(typeof v === "string" ? s(v) : n(v));
const variable = (v: string) => new VariablePattern(s(v));
const wildcard = () => new WildcardPattern();

describe("Pattern System", () => {
  describe("PatternResolver (Pretty Printing)", () => {
    it("should resolve a variable pattern", () => {
      const p = variable("X");
      expect(p.toString()).to.equal("X");
    });

    it("should resolve a wildcard pattern", () => {
      const p = wildcard();
      expect(p.toString()).to.equal("_");
    });

    it("should resolve a literal pattern", () => {
      const p = lit(42);
      expect(p.toString()).to.equal("42");
    });

    it("should resolve a cons pattern", () => {
      // (1:X)
      const p = new ConsPattern(lit(1), variable("X"));
      expect(p.toString()).to.equal("(1:X)");
    });

    it("should resolve a constructor pattern", () => {
      // Just(X)
      const p = new ConstructorPattern(new SymbolPrimitive("Just"), [
        variable("X"),
      ]);
      expect(p.toString()).to.equal("Just X");
    });

    it("should resolve nested patterns", () => {
      // (1:(2:[]))
      const p = new ConsPattern(
        lit(1),
        new ConsPattern(lit(2), new ListPattern([])),
      );
      expect(p.toString()).to.equal("(1:(2:[]))");
    });
  });

  describe("PatternMatcher (Logic)", () => {
    const match = (
      pattern: any,
      yuValue: YuValue,
    ): { success: boolean; bindings: [string, any][] } => {
      const bindings: [string, any][] = [];
      const ctx = new RuntimeContext({ lazyLoading: false });
      const matcher = new PatternMatcher(yuValue, bindings, ctx);
      const kernel = new YukigoKernel(new InterpreterVisitor(ctx));

      const res = kernel.run(pattern.accept(matcher)) as YuValue;
      return { success: res.toJSON() === true, bindings };
    };

    it("should match a variable and bind the value", () => {
      const p = variable("X");
      const { success, bindings } = match(p, new YuNumber(100));

      expect(success).to.be.true;
      expect(bindings[0][0]).to.equal("X");
      expect((bindings[0][1] as YuValue).toJSON()).to.equal(100);
    });

    it("should match a wildcard but not bind anything", () => {
      const p = wildcard();
      const { success, bindings } = match(p, new YuNumber(100));

      expect(success).to.be.true;
      expect(bindings).to.be.empty;
    });

    it("should match equal literals", () => {
      const p = lit(42);
      expect(match(p, new YuNumber(42)).success).to.be.true;
      expect(match(p, new YuNumber(99)).success).to.be.false;
    });

    it("should match a list pattern exactly", () => {
      const p = new ListPattern([lit(1), lit(2)]);
      expect(match(p, new YuArray([new YuNumber(1), new YuNumber(2)])).success)
        .to.be.true;
      expect(match(p, new YuArray([new YuNumber(1)])).success).to.be.false;
      expect(match(p, new YuArray([new YuNumber(1), new YuNumber(3)])).success)
        .to.be.false;
    });

    it("should match a Cons pattern with array input", () => {
      const p = new ConsPattern(variable("H"), variable("T"));
      const { success, bindings } = match(
        p,
        new YuArray([new YuNumber(1), new YuNumber(2), new YuNumber(3)]),
      );

      expect(success).to.be.true;
      const map = new Map(
        bindings.map(([k, v]) => [k, (v as YuValue).toJSON()]),
      );
      expect(map.get("H")).to.equal(1);
      expect(map.get("T")).to.deep.equal([2, 3]);
    });

    it("should fail Cons pattern on empty array", () => {
      const p = new ConsPattern(variable("H"), variable("T"));
      expect(match(p, new YuArray([])).success).to.be.false;
    });

    it("should match a Constructor pattern", () => {
      const p = new ConstructorPattern(new SymbolPrimitive("Just"), [
        variable("X"),
      ]);
      const val = new YuArray([new YuString("Just"), new YuNumber(10)]);

      const { success, bindings } = match(p, val);
      expect(success).to.be.true;
      expect(bindings[0][0]).to.equal("X");
      expect((bindings[0][1] as YuValue).toJSON()).to.equal(10);
    });

    it("should match an AsPattern (@)", () => {
      const p = new AsPattern(
        variable("List"),
        new ListPattern([variable("X"), wildcard()]),
      );
      const { success, bindings } = match(
        p,
        new YuArray([new YuNumber(1), new YuNumber(2)]),
      );
      expect(success).to.be.true;
      const map = new Map(
        bindings.map(([k, v]) => [k, (v as YuValue).toJSON()]),
      );
      expect(map.get("List")).to.deep.equal([1, 2]);
      expect(map.get("X")).to.equal(1);
    });

    it("should match a UnionPattern", () => {
      const p = new UnionPattern([lit(1), lit(2)]);
      expect(match(p, new YuNumber(1)).success).to.be.true;
      expect(match(p, new YuNumber(2)).success).to.be.true;
      expect(match(p, new YuNumber(3)).success).to.be.false;
    });

    describe("String Matching as List", () => {
      it("should match an empty string against an empty list pattern", () => {
        const p = new ListPattern([]);
        expect(match(p, new YuString("")).success).to.be.true;
      });

      it("should match a string against a cons pattern", () => {
        const p = new ConsPattern(variable("H"), variable("T"));
        const { success, bindings } = match(p, new YuString("abc"));

        expect(success).to.be.true;
        const map = new Map(
          bindings.map(([k, v]) => [k, (v as YuValue).toJSON()]),
        );
        expect(map.get("H")).to.equal("a");
        expect(map.get("T")).to.equal("bc");
      });

      it("should fail to match an empty string against a cons pattern", () => {
        const p = new ConsPattern(variable("H"), variable("T"));
        expect(match(p, new YuString("")).success).to.be.false;
      });
    });

    describe("LazyList Matching", () => {
      const createLazy = (items: number[]): LazyList => {
        const next = (idx: number): YuValue => {
          if (idx >= items.length) return YuNil.getInstance();
          return new LazyList(
            () =>
              new StepCommand(
                new LazyStepResult(
                  new YuNumber(items[idx]),
                  next(idx + 1) as YuSequence,
                ),
              ),
          );
        };
        return next(0) as LazyList;
      };

      it("should match Cons pattern against LazyList", () => {
        const p = new ConsPattern(variable("X"), variable("Xs"));
        const lazyVal = createLazy([1, 2, 3]);

        const { success, bindings } = match(p, lazyVal);
        expect(success).to.be.true;

        const map = new Map(bindings);
        expect((map.get("X") as YuValue).toJSON()).to.equal(1);

        const tail = map.get("Xs") as LazyList;
        expect(isLazyList(tail)).to.be.true;

        const ctx = new RuntimeContext({ lazyLoading: false });
        const kernel = new YukigoKernel(new InterpreterVisitor(ctx));

        const step1 = kernel.run(tail.step()) as LazyStepResult;
        expect((step1.head as YuValue).toJSON()).to.equal(2);
        const step2 = kernel.run(
          (step1.tail as LazyList).step(),
        ) as LazyStepResult;
        expect((step2.head as YuValue).toJSON()).to.equal(3);
        expect(step2.tail).to.be.instanceOf(YuNil);
      });

      it("should match ListPattern against LazyList (forcing realization)", () => {
        const p = new ListPattern([lit(1), lit(2)]);
        const lazyVal = createLazy([1, 2]);
        expect(match(p, lazyVal).success).to.be.true;
      });
    });
  });
});
