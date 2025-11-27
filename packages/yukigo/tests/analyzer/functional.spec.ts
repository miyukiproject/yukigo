import { YukigoParser } from "@yukigo/ast";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Analyzer } from "../../src/analyzer/index.js";
import { assert } from "chai";
import { inspect } from "util";

describe("Functional Spec", () => {
  let haskellParser: YukigoParser;
  let analyzer: Analyzer;
  beforeEach(() => {
    haskellParser = new YukigoHaskellParser("");
    analyzer = new Analyzer();
  });
  describe("UsesGuards", () => {
    it("detects guards when are present", () => {
      const inspection = {
        inspection: "UsesGuards",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "f x \r\n\t| c x = 2\r\n\t| otherwise = 4"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("detects guards when are not present", () => {
      const inspection = {
        inspection: "UsesGuards",
        binding: "f",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("f x = c x == 2");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesComposition", () => {
    it("is True when composition is present on top level", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "x",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = y . z");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present inside lambda", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "x",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = (\\m -> y . z)");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present inside application", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "x",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = f (g.h) x");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present within if", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("f x = if True then (g . f) x else 5");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present within list", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("f x = [(g.h x), m]");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present within comprehension", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("f x = [ (g.h x) m | m <- [1..20]]");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present within where", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("f x = m\r\n\twhere m = (f.g) ");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present on top level, guarded body", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "f x \r\n\t| c x = g . f $ x\r\n\t| otherwise = 4"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when composition is present on guard, guarded body", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "f x \r\n\t| (c . g) x = g x\r\n\t| otherwise = 4"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when composition not present, guarded body", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "f",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse(
        "f x \r\n\t| c x = f x\r\n\t| otherwise = 4"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is False when composition not present", () => {
      const inspection = {
        inspection: "UsesComposition",
        binding: "x",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("x = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesPatternMatching", () => {
    it("is True when there Pattern Matching with Literal, unscoped", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "factorial 0 = 1\r\nfactorial n = n * factorial (n - 1)"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there Pattern Matching with Literal", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        binding: "factorial",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "factorial 0 = 1\r\nfactorial n = n * factorial (n - 1)"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there Pattern Matching on List", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo [] = 0\nfoo (x:xs) = 1 + foo xs");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there Pattern Matching on Maybe", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo Nothing = 0\nfoo (Just x) = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when there there Pattern Matching on anonymous variable", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        binding: "baz",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("baz _ = 5 + 8");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when there not Pattern Matching", () => {
      const inspection = {
        inspection: "UsesPatternMatching",
        binding: "foo",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("foo x = 2");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesLambda", () => {
    it("detects lambda when is present", () => {
      const inspection = {
        inspection: "UsesLambda",
        binding: "f",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("f x = (\\y -> 4) x");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("detects lambda when is not present", () => {
      const inspection = {
        inspection: "UsesLambda",
        binding: "f",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("f x = 4");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  describe("UsesAnonymousVariable", () => {
    it("is True if _ is present in paramenters", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo _ = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True if _ is present in nested list patterns", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo [3, _] = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True if _ is present in nested infix application patterns", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo (x:_) = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True if _ is present in nested application patterns", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo (F _ 1) = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True if _ is present in nested tuple patterns", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo (_, 1) = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True if _ is present in nested at patterns", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("foo x@(_, 1) = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False if _ is not present in parameters", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("foo x = 1");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is True if _ is present only in second equation", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse(
        "foo False bool = bool\r\nfoo True _ = True"
      );
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False if there is no _ but a comment", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        binding: "foo",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("foo x = 1\n--");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is False if there is only a comment", () => {
      const inspection = {
        inspection: "UsesAnonymousVariable",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("--");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
  /*   describe("UsesForComprehension", () => {
    it("is True when list comprehension exists, unscoped", () => {
      const inspection = {
        inspection: "UsesForComprehension",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = [m|m<-t]");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is True when list comprehension exists", () => {
      const inspection = {
        inspection: "UsesForComprehension",
        binding: "x",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = [m|m<-t]");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when comprehension does not exists", () => {
      const inspection = {
        inspection: "UsesForComprehension",
        binding: "x",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("x = []");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
    it("is True when do syntax is used", () => {
      const inspection = {
        inspection: "UsesForComprehension",
        binding: "y",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("y = do { x <- xs; return x }");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
  }); */
  describe("UsesComprehension, in hs", () => {
    it("is True when list comprehension exists", () => {
      const inspection = {
        inspection: "UsesComprehension",
        args: [],
        expected: true,
      };
      const ast = haskellParser.parse("x = [m|m<-t]");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: true },
      ]);
    });
    it("is False when comprehension doesnt exists", () => {
      const inspection = {
        inspection: "UsesComprehension",
        binding: "x",
        args: [],
        expected: false,
      };
      const ast = haskellParser.parse("x = []");
      const result = analyzer.analyze(ast, [inspection]);
      assert.deepEqual(result, [
        { rule: inspection, passed: true, actual: false },
      ]);
    });
  });
});
