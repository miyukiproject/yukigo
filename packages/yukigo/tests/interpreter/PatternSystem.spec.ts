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
  LazyList,
} from "@yukigo/ast";
import {
  PatternMatcher,
  PatternResolver,
} from "../../src/interpreter/components/PatternMatcher.js";
import { createStream } from "../../src/interpreter/utils.js";

const s = (v: string) => new SymbolPrimitive(v);
const n = (v: number) => new NumberPrimitive(v);
const lit = (v: string | number) =>
  new LiteralPattern(typeof v === "string" ? s(v) : n(v));
const variable = (v: string) => new VariablePattern(s(v));
const wildcard = () => new WildcardPattern();

describe("Pattern System", () => {
  describe("PatternResolver (Pretty Printing)", () => {
    let resolver: PatternResolver;

    beforeEach(() => {
      resolver = new PatternResolver();
    });

    it("should resolve a variable pattern", () => {
      const p = variable("X");
      expect(p.accept(resolver)).to.equal("X");
    });

    it("should resolve a wildcard pattern", () => {
      const p = wildcard();
      expect(p.accept(resolver)).to.equal("_");
    });

    it("should resolve a literal pattern", () => {
      const p = lit(42);
      expect(p.accept(resolver)).to.equal("42");
    });

    it("should resolve a cons pattern", () => {
      // (1:X)
      const p = new ConsPattern(lit(1), variable("X"));
      expect(p.accept(resolver)).to.equal("(1:X)");
    });

    it("should resolve a constructor pattern", () => {
      // Just(X)
      const p = new ConstructorPattern("Just", [variable("X")]);
      expect(p.accept(resolver)).to.equal("Just X");
    });

    it("should resolve nested patterns", () => {
      // (1:(2:[]))
      const p = new ConsPattern(
        lit(1),
        new ConsPattern(lit(2), new ListPattern([]))
      );
      expect(p.accept(resolver)).to.equal("(1:(2:[]))");
    });
  });

  describe("PatternMatcher (Logic)", () => {
    const match = (
      pattern: any,
      value: any
    ): { success: boolean; bindings: [string, any][] } => {
      const bindings: [string, any][] = [];
      const matcher = new PatternMatcher(value, bindings);

      const success = pattern.accept(matcher);
      return { success, bindings };
    };

    it("should match a variable and bind the value", () => {
      const p = variable("X");
      const { success, bindings } = match(p, 100);

      expect(success).to.be.true;
      expect(bindings).to.deep.equal([["X", 100]]);
    });

    it("should match a wildcard but not bind anything", () => {
      const p = wildcard();
      const { success, bindings } = match(p, 100);

      expect(success).to.be.true;
      expect(bindings).to.be.empty;
    });

    it("should match equal literals", () => {
      const p = lit(42);
      expect(match(p, 42).success).to.be.true;
      expect(match(p, 99).success).to.be.false;
    });

    it("should match a list pattern exactly", () => {
      const p = new ListPattern([lit(1), lit(2)]);
      expect(match(p, [1, 2]).success).to.be.true;
      expect(match(p, [1]).success).to.be.false;
      expect(match(p, [1, 3]).success).to.be.false;
    });

    it("should match a Cons pattern with array input", () => {
      const p = new ConsPattern(variable("H"), variable("T"));
      const { success, bindings } = match(p, [1, 2, 3]);

      expect(success).to.be.true;
      const map = new Map(bindings);
      expect(map.get("H")).to.equal(1);
      expect(map.get("T")).to.deep.equal([2, 3]);
    });

    it("should fail Cons pattern on empty array", () => {
      const p = new ConsPattern(variable("H"), variable("T"));
      expect(match(p, []).success).to.be.false;
    });

    it("should match a Constructor pattern", () => {
      const p = new ConstructorPattern("Just", [variable("X")]);
      const val = ["Just", 10];

      const { success, bindings } = match(p, val);
      expect(success).to.be.true;
      expect(bindings).to.deep.equal([["X", 10]]);
    });

    it("should match an AsPattern (@)", () => {
      const p = new AsPattern(
        variable("List"),
        new ListPattern([variable("X"), wildcard()])
      );
      const { success, bindings } = match(p, [1, 2]);
      expect(success).to.be.true;
      const map = new Map(bindings);
      expect(map.get("List")).to.deep.equal([1, 2]);
      expect(map.get("X")).to.equal(1);
    });

    it("should match a UnionPattern", () => {
      const p = new UnionPattern([lit(1), lit(2)]);
      expect(match(p, 1).success).to.be.true;
      expect(match(p, 2).success).to.be.true;
      expect(match(p, 3).success).to.be.false;
    });

    describe("LazyList Matching", () => {
      const createLazy = (items: number[]): LazyList =>
        createStream(function* () {
          for (const i of items) yield i;
        });

      it("should match Cons pattern against LazyList", () => {
        const p = new ConsPattern(variable("X"), variable("Xs"));
        const lazyVal = createLazy([1, 2, 3]);

        const { success, bindings } = match(p, lazyVal);
        expect(success).to.be.true;

        const map = new Map(bindings);
        expect(map.get("X")).to.equal(1);

        const tail = map.get("Xs") as LazyList;
        expect(tail.type).to.equal("LazyList");

        const gen = tail.generator();
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
        expect(gen.next().done).to.be.true;
      });

      it("should match ListPattern against LazyList (forcing realization)", () => {
        const p = new ListPattern([lit(1), lit(2)]);
        const lazyVal = createLazy([1, 2]);
        expect(match(p, lazyVal).success).to.be.true;
      });
    });
  });
});
