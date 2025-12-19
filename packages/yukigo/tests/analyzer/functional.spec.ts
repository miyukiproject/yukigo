import { expect } from "chai";
import {
  Function,
  Equation,
  SymbolPrimitive,
  UnguardedBody,
  GuardedBody,
  Sequence,
  CompositionExpression,
  Lambda,
  Application,
  ListComprehension,
  Yield,
  LiteralPattern,
  ListPattern,
  WildcardPattern,
  BooleanPrimitive,
  NumberPrimitive,
  If,
} from "yukigo-ast";
import { Analyzer, InspectionRule } from "../../src/analyzer/index.js";

describe("Functional Inspections", () => {
  const createSymbol = (name: string) => new SymbolPrimitive(name);
  const createSequence = (expr: any) => new Sequence([expr]);
  const createEquation = (patterns: any[], bodyExpr: any) => {
    const body = Array.isArray(bodyExpr)
      ? bodyExpr
      : new UnguardedBody(createSequence(bodyExpr));

    return new Equation(patterns, body, undefined);
  };
  const createFunction = (name: string, equations: Equation[]) => {
    return new Function(createSymbol(name), equations);
  };
  const mockExpr = new NumberPrimitive(1);
  const analyzer = new Analyzer();

  const runSingleRule = (
    ast: any[],
    inspection: string,
    expected: boolean,
    binding?: string,
    args: string[] = []
  ) => {
    const rule: InspectionRule = { inspection, binding, args, expected };
    const results = analyzer.analyze(ast, [rule]);
    const result = results[0]; // Assuming only one rule is passed
    return result.passed;
  };

  describe("UsesGuards", () => {
    it("detects guards when they are present", () => {
      const guardedBody = new GuardedBody(mockExpr, mockExpr);
      const equation = new Equation([], [guardedBody, guardedBody], undefined);
      const func = createFunction("f", [equation]);
      expect(runSingleRule([func], "UsesGuards", true, "f")).to.be.true;
    });

    it("does not detect guards when using UnguardedBody", () => {
      const equation = createEquation([], mockExpr);
      const func = createFunction("f", [equation]);
      expect(runSingleRule([func], "UsesGuards", false, "f")).to.be.true;
    });

    it("should respect binding scope", () => {
      const guardedBody = new GuardedBody(mockExpr, mockExpr);
      const equation = new Equation([], [guardedBody], undefined);
      const func = createFunction("g", [equation]);
      expect(runSingleRule([func], "UsesGuards", false, "f")).to.be.true;
    });
  });

  describe("UsesComposition", () => {
    const createComp = () => new CompositionExpression(mockExpr, mockExpr);

    it("is True when composition is present on top level", () => {
      const func = createFunction("x", [createEquation([], createComp())]);
      expect(runSingleRule([func], "UsesComposition", true, "x")).to.be.true;
    });

    it("is True when composition is present inside lambda", () => {
      const lambda = new Lambda([], createComp());
      const func = createFunction("x", [createEquation([], lambda)]);
      expect(runSingleRule([func], "UsesComposition", true, "x")).to.be.true;
    });

    it("is True when composition is present inside application", () => {
      const app = new Application(mockExpr, createComp());
      const func = createFunction("x", [createEquation([], app)]);
      expect(runSingleRule([func], "UsesComposition", true, "x")).to.be.true;
    });

    it("is True when composition is present within if", () => {
      const ifExpr = new If(new BooleanPrimitive(true), createComp(), mockExpr);
      const func = createFunction("f", [createEquation([], ifExpr)]);
      expect(runSingleRule([func], "UsesComposition", true, "f")).to.be.true;
    });

    it("is False when composition is not present", () => {
      const func = createFunction("x", [createEquation([], mockExpr)]);
      expect(runSingleRule([func], "UsesComposition", false, "x")).to.be.true;
    });
  });

  describe("UsesPatternMatching", () => {
    it("is True when Pattern Matching with Literal", () => {
      const pattern = new LiteralPattern(new NumberPrimitive(0));
      const func = createFunction("factorial", [
        createEquation([pattern], mockExpr),
      ]);
      expect(runSingleRule([func], "UsesPatternMatching", true, "factorial")).to
        .be.true;
    });

    it("is True when Pattern Matching on List", () => {
      const pattern = new ListPattern([]);
      const func = createFunction("foo", [createEquation([pattern], mockExpr)]);
      expect(runSingleRule([func], "UsesPatternMatching", true, "foo")).to.be
        .true;
    });

    it("is True when Pattern Matching on anonymous variable (Wildcard)", () => {
      const pattern = new WildcardPattern();
      const func = createFunction("baz", [createEquation([pattern], mockExpr)]);
      expect(runSingleRule([func], "UsesPatternMatching", true, "baz")).to.be
        .true;
    });

    it("is False when no patterns (or ignored patterns) are used", () => {
      const func = createFunction("foo", [createEquation([], mockExpr)]);
      expect(runSingleRule([func], "UsesPatternMatching", false, "foo")).to.be
        .true;
    });
  });

  describe("UsesLambda", () => {
    it("detects lambda when is present", () => {
      const lambda = new Lambda([], mockExpr);
      const func = createFunction("f", [createEquation([], lambda)]);
      expect(runSingleRule([func], "UsesLambda", true, "f")).to.be.true;
    });

    it("detects lambda when is not present", () => {
      const func = createFunction("f", [createEquation([], mockExpr)]);
      expect(runSingleRule([func], "UsesLambda", false, "f")).to.be.true;
    });
  });

  describe("UsesAnonymousVariable", () => {
    it("is True if _ is present in parameters", () => {
      const pattern = new WildcardPattern();
      const func = createFunction("foo", [createEquation([pattern], mockExpr)]);
      expect(runSingleRule([func], "UsesAnonymousVariable", true, "foo")).to.be
        .true;
    });

    it("is True if _ is present in nested structures (e.g. ListPattern)", () => {
      const innerWildcard = new WildcardPattern();
      const listPattern = new ListPattern([innerWildcard]);
      const func = createFunction("foo", [
        createEquation([listPattern], mockExpr),
      ]);
      expect(runSingleRule([func], "UsesAnonymousVariable", true, "foo")).to.be
        .true;
    });

    it("is False if _ is not present", () => {
      const func = createFunction("foo", [createEquation([], mockExpr)]);
      expect(runSingleRule([func], "UsesAnonymousVariable", false, "foo")).to.be
        .true;
    });
  });

  describe("UsesComprehension", () => {
    it("is True when list comprehension exists", () => {
      const comp = new ListComprehension(mockExpr, []);
      const func = createFunction("x", [createEquation([], comp)]);
      expect(runSingleRule([func], "UsesComprehension", true, undefined)).to.be
        .true;
    });

    it("is False when comprehension doesnt exists", () => {
      const func = createFunction("x", [createEquation([], mockExpr)]);
      expect(runSingleRule([func], "UsesComprehension", false, "x")).to.be.true;
    });
  });

  describe("UsesYield", () => {
    it("is True when yield exists", () => {
      const yieldNode = new Yield(mockExpr);
      const func = createFunction("gen", [createEquation([], yieldNode)]);
      expect(runSingleRule([func], "UsesYield", true, "gen")).to.be.true;
    });
  });
});
