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
  ASTNode,
  StopTraversalException,
  ArithmeticBinaryOperation,
} from "yukigo-ast";
import {
  DeclaresFact,
  DeclaresRule,
  DeclaresPredicate,
  UsesFindall,
  UsesForall,
  UsesNot,
  UsesUnificationOperator,
  UsesCut,
  UsesFail,
  HasRedundantReduction,
} from "../../src/analyzer/inspections/logic.js";

function executeVisitor(node: ASTNode | ASTNode[], visitor: any) {
  if (Array.isArray(node)) {
    node.forEach((n) => n.accept(visitor));
  } else {
    node.accept(visitor);
  }
}

describe("Logic Spec", () => {
  const createSymbol = (name: string) => new SymbolPrimitive(name);
  const createNumber = (val: number) => new NumberPrimitive(val);

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

  describe("DeclaresFact", () => {
    it("detects when a specific fact is declared", () => {
      const fact = createFact("baz", [createSymbol("a")]);
      const visitor = new DeclaresFact("baz");
      expect(() => executeVisitor(fact, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("ignores facts with different names", () => {
      const fact = createFact("baz");
      const visitor = new DeclaresFact("foo");
      expect(() => executeVisitor(fact, visitor)).to.not.throw();
    });
  });

  describe("DeclaresRule", () => {
    it("detects when a specific rule is declared", () => {
      const rule = createRule("foo");
      const visitor = new DeclaresRule("foo");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("ignores rules with different names", () => {
      const rule = createRule("foo");
      const visitor = new DeclaresRule("baz");
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
    });
  });

  describe("DeclaresPredicate", () => {
    it("is True when rule is declared", () => {
      const rule = createRule("foo");
      const visitor = new DeclaresPredicate("foo");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is True when fact is declared", () => {
      const fact = createFact("foo");
      const visitor = new DeclaresPredicate("foo");
      expect(() => executeVisitor(fact, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when predicate is not declared", () => {
      const fact = createFact("bar");
      const visitor = new DeclaresPredicate("foo");
      expect(() => executeVisitor(fact, visitor)).to.not.throw();
    });
  });

  describe("UsesForall", () => {
    it("detects usage of forall/2", () => {
      const forallNode = new Forall(createCall("cond"), createCall("action"));
      const rule = createRule("foo", [], [forallNode]);

      const visitor = new UsesForall();
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when not used", () => {
      const rule = createRule("foo", [], [createCall("bar")]);
      const visitor = new UsesForall();
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
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

      const visitor = new UsesFindall();
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });
  });

  describe("UsesNot", () => {
    it("detects usage of Not node", () => {
      const notNode = new Not([createCall("g")]);
      const rule = createRule("foo", [], [notNode]);

      const visitor = new UsesNot();
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("detects usage of 'not' as an Exist call (legacy/parsing variant)", () => {
      const notCall = createCall("not", [createCall("g")]);
      const rule = createRule("foo", [], [notCall]);

      const visitor = new UsesNot();
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when not used", () => {
      const rule = createRule("foo", [], [createCall("bar")]);
      const visitor = new UsesNot();
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
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

      const visitor = new UsesUnificationOperator("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when no equal", () => {
      const rule = createRule("baz", [], [createCall("other")]);
      const visitor = new UsesUnificationOperator("baz");
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
    });
  });

  describe("UsesCut", () => {
    it("detects usage of cut (!)", () => {
      const cut = createCall("!");
      const rule = createRule("baz", [], [cut]);

      const visitor = new UsesCut("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when not used", () => {
      const rule = createRule("baz");
      const visitor = new UsesCut("baz");
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
    });
  });

  describe("UsesFail", () => {
    it("detects usage of fail", () => {
      const failNode = createCall("fail");
      const rule = createRule("baz", [], [failNode]);

      const visitor = new UsesFail("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
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

      const visitor = new HasRedundantReduction("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is True when there is a redundant reduction of literals (Var is 5)", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        createNumber(5)
      );
      const rule = createRule("baz", [], [assign]);

      const visitor = new HasRedundantReduction("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is True when there is a redundant reduction of functors (Var is struct)", () => {
      const functor = createCall("aFunctor", [createNumber(5)]);
      const assign = new AssignOperation("Assign", createSymbol("Z"), functor);
      const rule = createRule("baz", [], [assign]);

      const visitor = new HasRedundantReduction("baz");
      expect(() => executeVisitor(rule, visitor)).to.throw(
        StopTraversalException
      );
    });

    it("is False when there is a complex reduction (operators)", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        new ArithmeticBinaryOperation("Plus", createNumber(3), createNumber(2))
      );
      const rule = createRule("baz", [], [assign]);

      const visitor = new HasRedundantReduction("baz");
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
    });

    it("respects bindings checks", () => {
      const assign = new AssignOperation(
        "Assign",
        createSymbol("X"),
        createNumber(5)
      );
      const rule = createRule("other", [], [assign]);

      const visitor = new HasRedundantReduction("baz");
      expect(() => executeVisitor(rule, visitor)).to.not.throw();
    });
  });
});
