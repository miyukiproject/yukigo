import { YukigoParser } from "@yukigo/ast";
import { YukigoPrologParser } from "yukigo-prolog-parser";
import { Analyzer } from "../../src/analyzer/index.js";
import { assert } from "chai";

describe("Logic Spec", () => {
  let prologParser: YukigoParser;
  let analyzer: Analyzer;
  beforeEach(() => {
    prologParser = new YukigoPrologParser();
    analyzer = new Analyzer();
  });
  describe("DeclaresFact", () => {
    it("declares fact", () => {
      const inspection = {
        inspection: "DeclaresFact",
        binding: "baz",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(a).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("does not declare fact", () => {
      const inspection = {
        inspection: "DeclaresFact",
        binding: "foo",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(a).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("DeclaresRule", () => {
    it("declares rule", () => {
      const inspection = {
        inspection: "DeclaresRule",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("does not declare rule", () => {
      const inspection = {
        inspection: "DeclaresRule",
        binding: "baz",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("foo(X) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("Uses", () => {
    it("is True when predicate is used, unscoped", () => {
      const inspection = {
        inspection: "Uses",
        args: ["bar"],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when predicate is used", () => {
      const inspection = {
        inspection: "Uses",
        binding: "foo",
        args: ["bar"],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when predicate is used in not, unscoped", () => {
      const inspection = {
        inspection: "Uses",
        args: ["bar"],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- not(bar(X)).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when predicate is used in forall, unscoped", () => {
      const inspections = [
        {
          inspection: "Uses",
          args: ["bar"],
          expected: true,
        },
        {
          inspection: "Uses",
          args: ["baz"],
          expected: true,
        },
      ];
      const ast = prologParser.parse("foo(X) :- forall(bar(X), baz(X)).");
      const result = analyzer.analyze(ast, inspections);
      assert.deepEqual(
        result,
        inspections.map((insp) => ({
          rule: insp,
          passed: true,
          actual: true,
        }))
      );
    });
    it("is False when predicate is not used", () => {
      const inspections = [
        {
          inspection: "Uses",
          binding: "foo",
          args: ["bar"],
          expected: false,
        },
      ];
      const ast = prologParser.parse("foo(X) :- baz(X).");
      const result = analyzer.analyze(ast, inspections);
      assert.deepEqual(
        result,
        inspections.map((insp) => ({
          rule: insp,
          passed: true,
          actual: false,
        }))
      );
    });
  });
  describe("UsesForall", () => {
    it("is True when used, unscuped", () => {
      const inspection = {
        inspection: "UsesForall",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- forall(f(x), y(X)).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when used", () => {
      const inspection = {
        inspection: "UsesForall",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- forall(bar(X), g(X)).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when not used", () => {
      const inspection = {
        inspection: "UsesForall",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("foo(X) :- bar(X), baz(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesNot", () => {
    it("is True when used, unscoped", () => {
      const inspection = {
        inspection: "UsesNot",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- not(f(x)).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when used", () => {
      const inspection = {
        inspection: "UsesNot",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- not(g(X)).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when not used", () => {
      const inspection = {
        inspection: "UsesNot",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("foo(X) :- bar(X), baz(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesAnonymousVariable", () => {
    it("is True when _ is used in rule", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(_) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when _ is used in fact", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(_).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when _ is not used", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("foo(a).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("DeclaresPredicate", () => {
    it("is True when rule is declared", () => {
      const inspection = {
        inspection: "DeclaresPredicate",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(X) :- bar(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when fact is declared", () => {
      const inspection = {
        inspection: "DeclaresPredicate",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("foo(tom).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when predicate is not declared", () => {
      const inspection = {
        inspection: "DeclaresPredicate",
        binding: "foo",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("bar(tom).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("DeclaresComputationWithArity", () => {
    it("is True when fact is declared with given arity", () => {
      const inspection = {
        inspection: "DeclaresComputationWithArity",
        binding: "foo",
        args: ["1"],
        expected: true,
      };
      const ast = prologParser.parse("foo(tom).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when rule is declared with given arity", () => {
      const inspection = {
        inspection: "DeclaresComputationWithArity",
        binding: "foo",
        args: ["1"],
        expected: true,
      };
      const ast = prologParser.parse("foo(tom) :- bar(5), baz(6).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when fact is declared with another arity", () => {
      const inspection = {
        inspection: "DeclaresComputationWithArity",
        binding: "foo",
        args: ["2"],
        expected: false,
      };
      const ast = prologParser.parse("foo(tom).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesUnificationOperator", () => {
    it("is True when equal", () => {
      const inspection = {
        inspection: "UsesUnificationOperator",
        binding: "baz",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(X):- X = 4.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when no equal", () => {
      const inspection = {
        inspection: "UsesUnificationOperator",
        binding: "baz",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- baz(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesCut", () => {
    it("is True when used", () => {
      const inspection = {
        inspection: "UsesCut",
        binding: "baz",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(X):- !.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when not used", () => {
      const inspection = {
        inspection: "UsesCut",
        binding: "baz",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- baz(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesFail", () => {
    it("is True when used", () => {
      const inspection = {
        inspection: "UsesFail",
        binding: "baz",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(X):- fail.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when not used", () => {
      const inspection = {
        inspection: "UsesFail",
        binding: "baz",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- baz(X).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("HasRedundantReduction", () => {
    it("is False when there is no reduction operator", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- X > 5.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is False when there is a reduction of applications", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- X is 5 + Y.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is False when there is a reduction of named function applications", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: false,
      };
      const ast = prologParser.parse("baz(X):- X is abs(Y).");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is True when there is a redundant reduction of parameters", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(X, Y):- X is Y.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there is a redundant reduction of literals", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse("baz(X, Y):- X is 5.");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there is a redundant reduction of functors", () => {
      const inspection = {
        inspection: "HasRedundantReduction",
        args: [],
        expected: true,
      };
      const ast = prologParser.parse(
        "baz(X, Y):- moo(X, Z), Z is aFunctor(5)."
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
  });
});