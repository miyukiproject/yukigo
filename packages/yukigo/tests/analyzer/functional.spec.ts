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
} from "@yukigo/ast";
import {
  UsesComposition,
  UsesAnonymousVariable,
  UsesComprehension,
  UsesGuards,
  UsesLambda,
  UsesYield,
  UsesPatternMatching,
} from "../../src/analyzer/inspections/functional.js";
import { executeVisitor } from "../../src/analyzer/utils.js";

describe("Functional Spec", () => {
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

  describe("UsesGuards", () => {
    it("detects guards when they are present", () => {
      const guardedBody = new GuardedBody(mockExpr, mockExpr);
      const equation = new Equation([], [guardedBody, guardedBody], undefined);
      const func = createFunction("f", [equation]);

      const visitor = new UsesGuards("f");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("does not detect guards when using UnguardedBody", () => {
      const equation = createEquation([], mockExpr);
      const func = createFunction("f", [equation]);

      const visitor = new UsesGuards("f");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });

    it("should respect binding scope", () => {
      const guardedBody = new GuardedBody(mockExpr, mockExpr);
      const equation = new Equation([], [guardedBody], undefined);
      const func = createFunction("g", [equation]);

      const visitor = new UsesGuards("f");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesComposition", () => {
    const createComp = () => new CompositionExpression(mockExpr, mockExpr);

    it("is True when composition is present on top level", () => {
      const func = createFunction("x", [createEquation([], createComp())]);

      const visitor = new UsesComposition("x");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True when composition is present inside lambda", () => {
      const lambda = new Lambda([], createComp());
      const func = createFunction("x", [createEquation([], lambda)]);

      const visitor = new UsesComposition("x");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True when composition is present inside application", () => {
      const app = new Application(mockExpr, createComp());
      const func = createFunction("x", [createEquation([], app)]);

      const visitor = new UsesComposition("x");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True when composition is present within if", () => {
      const ifExpr = new If(new BooleanPrimitive(true), createComp(), mockExpr);
      const func = createFunction("f", [createEquation([], ifExpr)]);

      const visitor = new UsesComposition("f");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is False when composition is not present", () => {
      const func = createFunction("x", [createEquation([], mockExpr)]);
      const visitor = new UsesComposition("x");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesPatternMatching", () => {
    it("is True when Pattern Matching with Literal", () => {
      const pattern = new LiteralPattern(new NumberPrimitive(0));
      const func = createFunction("factorial", [
        createEquation([pattern], mockExpr),
      ]);

      const visitor = new UsesPatternMatching("factorial");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True when Pattern Matching on List", () => {
      const pattern = new ListPattern([]);
      const func = createFunction("foo", [createEquation([pattern], mockExpr)]);

      const visitor = new UsesPatternMatching("foo");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True when Pattern Matching on anonymous variable (Wildcard)", () => {
      const pattern = new WildcardPattern();
      const func = createFunction("baz", [createEquation([pattern], mockExpr)]);

      const visitor = new UsesPatternMatching("baz");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is False when no patterns (or ignored patterns) are used", () => {
      const func = createFunction("foo", [createEquation([], mockExpr)]);
      const visitor = new UsesPatternMatching("foo");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesLambda", () => {
    it("detects lambda when is present", () => {
      const lambda = new Lambda([], mockExpr);
      const func = createFunction("f", [createEquation([], lambda)]);

      const visitor = new UsesLambda("f");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("detects lambda when is not present", () => {
      const func = createFunction("f", [createEquation([], mockExpr)]);
      const visitor = new UsesLambda("f");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesAnonymousVariable", () => {
    it("is True if _ is present in parameters", () => {
      const pattern = new WildcardPattern();
      const func = createFunction("foo", [createEquation([pattern], mockExpr)]);

      const visitor = new UsesAnonymousVariable("foo");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is True if _ is present in nested structures (e.g. ListPattern)", () => {
      const innerWildcard = new WildcardPattern();

      const listPattern = new ListPattern([innerWildcard]);

      const func = createFunction("foo", [
        createEquation([listPattern], mockExpr),
      ]);

      const visitor = new UsesAnonymousVariable("foo");

      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is False if _ is not present", () => {
      const func = createFunction("foo", [createEquation([], mockExpr)]);
      const visitor = new UsesAnonymousVariable("foo");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesComprehension", () => {
    it("is True when list comprehension exists", () => {
      const comp = new ListComprehension(mockExpr, []);
      const func = createFunction("x", [createEquation([], comp)]);

      const visitor = new UsesComprehension(undefined);
      expect(executeVisitor(func, visitor)).to.eq(true);
    });

    it("is False when comprehension doesnt exists", () => {
      const func = createFunction("x", [createEquation([], mockExpr)]);
      const visitor = new UsesComprehension("x");
      expect(executeVisitor(func, visitor)).to.eq(false);
    });
  });

  describe("UsesYield", () => {
    it("is True when yield exists", () => {
      const yieldNode = new Yield(mockExpr);
      const func = createFunction("gen", [createEquation([], yieldNode)]);

      const visitor = new UsesYield("gen");
      expect(executeVisitor(func, visitor)).to.eq(true);
    });
  });
});
