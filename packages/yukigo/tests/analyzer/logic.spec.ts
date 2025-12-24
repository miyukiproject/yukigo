import { expect } from "chai";
import {
  Fact,
  Rule,
  SymbolPrimitive,
  Exist,
  Not,
  Forall,
  Findall,
  AssignOperation,
  UnifyOperation,
  NumberPrimitive,
  ArithmeticBinaryOperation,
} from "yukigo-ast";
import {
  Analyzer,
  DefaultInspectionSet,
  DefaultSmellsSet,
  InspectionRule,
} from "../../src/analyzer/index.js";

describe("Logic Inspections", () => {
  const createSymbol = (name: string) => new SymbolPrimitive(name);
  const createNumber = (val: number) => new NumberPrimitive(val);
  const analyzer = new Analyzer({
    ...DefaultInspectionSet,
    ...DefaultSmellsSet,
  });

  const createFact = (name: string, args: any[] = []) => {
    return new Fact(createSymbol(name), args);
  };

  const createRule = (
    name: string,
    patterns: any[] = [],
    bodyExprs: any[] = []
  ) => {
    return new Rule(createSymbol(name), patterns, bodyExprs);
  };

  const createCall = (name: string, args: any[] = []) => {
    return new Exist(createSymbol(name), args);
  };

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

  describe("DeclaresFact", () => {
    it("detects when a specific fact is declared", () => {
      const fact = createFact("baz", [createSymbol("a")]);
      expect(runSingleRule([fact], "DeclaresFact", true, "baz")).to.be.true;
    });

    it("ignores facts with different names", () => {
      const fact = createFact("baz");
      expect(runSingleRule([fact], "DeclaresFact", false, "foo")).to.be.true;
    });
  });

  describe("DeclaresRule", () => {
    it("detects when a specific rule is declared", () => {
      const rule = createRule("foo");
      expect(runSingleRule([rule], "DeclaresRule", true, "foo")).to.be.true;
    });

    it("ignores rules with different names", () => {
      const rule = createRule("foo");
      expect(runSingleRule([rule], "DeclaresRule", false, "baz")).to.be.true;
    });
  });

  describe("DeclaresPredicate", () => {
    it("is True when rule is declared", () => {
      const rule = createRule("foo");
      expect(runSingleRule([rule], "DeclaresPredicate", true, "foo")).to.be
        .true;
    });

    it("is True when fact is declared", () => {
      const fact = createFact("foo");
      expect(runSingleRule([fact], "DeclaresPredicate", true, "foo")).to.be
        .true;
    });

    it("is False when predicate is not declared", () => {
      const fact = createFact("bar");
      expect(runSingleRule([fact], "DeclaresPredicate", false, "foo")).to.be
        .true;
    });
  });

  describe("UsesForall", () => {
    it("detects usage of forall/2", () => {
      const forallNode = new Forall(createCall("cond"), createCall("action"));
      const rule = createRule("foo", [], [forallNode]);
      expect(runSingleRule([rule], "UsesForall", true)).to.be.true;
    });

    it("is False when not used", () => {
      const rule = createRule("foo", [], [createCall("bar")]);
      expect(runSingleRule([rule], "UsesForall", false)).to.be.true;
    });
  });

  describe("UsesFindall", () => {
    it("detects usage of findall/3", () => {
      const findallNode = new Findall(
        createSymbol("X"),
        createCall("goal"),
        createSymbol("L")
      );
      const rule = createRule("foo", [], [findallNode]);
      expect(runSingleRule([rule], "UsesFindall", true)).to.be.true;
    });
  });

  describe("UsesNot", () => {
    it("detects usage of Not node", () => {
      const notNode = new Not([createCall("g")]);
      const rule = createRule("foo", [], [notNode]);
      expect(runSingleRule([rule], "UsesNot", true)).to.be.true;
    });

    it("detects usage of 'not' as an Exist call (legacy/parsing variant)", () => {
      const notCall = createCall("not", [createCall("g")]);
      const rule = createRule("foo", [], [notCall]);
      expect(runSingleRule([rule], "UsesNot", true)).to.be.true;
    });

    it("is False when not used", () => {
      const rule = createRule("foo", [], [createCall("bar")]);
      expect(runSingleRule([rule], "UsesNot", false)).to.be.true;
    });
  });

  describe("UsesUnificationOperator", () => {
    it("detects usage of unification (=)", () => {
      const unify = new UnifyOperation(
        "Unify",
        createSymbol("X"),
        createNumber(4)
      );
      const rule = createRule("baz", [], [unify]);
      expect(runSingleRule([rule], "UsesUnificationOperator", true, "baz")).to
        .be.true;
    });

    it("is False when no equal", () => {
      const rule = createRule("baz", [], [createCall("other")]);
      expect(runSingleRule([rule], "UsesUnificationOperator", false, "baz")).to
        .be.true;
    });
  });

  describe("UsesCut", () => {
    it("detects usage of cut (!)", () => {
      const cut = createCall("!");
      const rule = createRule("baz", [], [cut]);
      expect(runSingleRule([rule], "UsesCut", true, "baz")).to.be.true;
    });

    it("is False when not used", () => {
      const rule = createRule("baz");
      expect(runSingleRule([rule], "UsesCut", false, "baz")).to.be.true;
    });
  });

  describe("UsesFail", () => {
    it("detects usage of fail", () => {
      const failNode = createCall("fail");
      const rule = createRule("baz", [], [failNode]);
      expect(runSingleRule([rule], "UsesFail", true, "baz")).to.be.true;
    });
  });

  describe("HasRedundantReduction", () => {
    it("is True when there is a redundant reduction of parameters (Var is Var)", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        createSymbol("Y")
      );
      const rule = createRule("baz", [], [assign]);
      expect(runSingleRule([rule], "HasRedundantReduction", true, "baz")).to.be
        .true;
    });

    it("is True when there is a redundant reduction of literals (Var is 5)", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        createNumber(5)
      );
      const rule = createRule("baz", [], [assign]);
      expect(runSingleRule([rule], "HasRedundantReduction", true, "baz")).to.be
        .true;
    });

    it("is True when there is a redundant reduction of functors (Var is struct)", () => {
      const functor = createCall("aFunctor", [createNumber(5)]);
      const assign = new AssignOperation("Assign", createSymbol("Z"), functor);
      const rule = createRule("baz", [], [assign]);
      expect(runSingleRule([rule], "HasRedundantReduction", true, "baz")).to.be
        .true;
    });

    it("is False when there is a complex reduction (operators)", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        new ArithmeticBinaryOperation("Plus", createNumber(3), createNumber(2))
      );
      const rule = createRule("baz", [], [assign]);
      expect(runSingleRule([rule], "HasRedundantReduction", false, "baz")).to.be
        .true;
    });
  });
});
