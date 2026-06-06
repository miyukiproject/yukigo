import { expect } from "chai";
import {
  SymbolPrimitive,
  NumberPrimitive,
  LiteralPattern,
  VariablePattern,
  Fact,
  Findall,
  Goal,
  Pattern,
  Rule,
  Equation,
  Sequence,
  UnguardedBody,
  Statement,
  Variable,
  NilPrimitive,
  LogicConstraint,
  Expression,
  Query,
} from "yukigo-ast";
import { createGlobalEnv } from "../../src/interpreter/utils.js";
import { LogicEngine } from "../../src/interpreter/components/logic/LogicEngine.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { StepCommand } from "../../src/interpreter/components/kernel/commands.js";
import {
  VariableTerm,
  ConstantTerm,
  ListTerm,
  ConsTerm,
  CompoundTerm,
} from "../../src/interpreter/components/logic/LogicTerm.js";
import { LazyList } from "../../src/primitives/LazyList.js";
import {
  LogicTerm,
  Substitution,
  LogicResult,
} from "../../src/primitives/LogicResult.js";
import { RuntimePredicate } from "../../src/primitives/RuntimePredicate.js";

const s = (val: string) => new SymbolPrimitive(val);
const n = (val: number) => new NumberPrimitive(val);
const lit = (val: string | number) =>
  new LiteralPattern(typeof val === "string" ? s(val) : n(val));
const varPat = (name: string) => new VariablePattern(s(name));

const makeEq = (args: Pattern[], stmts: Statement[]) =>
  new Equation(args, new UnguardedBody(new Sequence(stmts)));
const makeFact = (id: string, args: Pattern[]) => new Fact(s(id), args);
const makeRule = (id: string, body: Equation[]) => new Rule(s(id), body);
const makeGoal = (id: string, args: Pattern[]) => new Goal(s(id), args);
const makeConstraint = (expr: Expression) => new LogicConstraint(expr);

const factsParent = new RuntimePredicate("parent", [
  makeFact("parent", [lit("zeus"), lit("ares")]),
  makeFact("parent", [lit("zeus"), lit("athena")]),
  makeFact("parent", [lit("hera"), lit("ares")]),
]);
const rulesSibling = new RuntimePredicate("sibling", [
  makeRule("sibling", [
    makeEq(
      [varPat("X"), varPat("Y")],
      [
        makeConstraint(makeGoal("parent", [varPat("Z"), varPat("X")])),
        makeConstraint(makeGoal("parent", [varPat("Z"), varPat("Y")])),
      ],
    ),
  ]),
]);

const env = createGlobalEnv();
const context = new RuntimeContext({
  debug: false,
  outputMode: "all",
});
context.setEnv(env);
context.define("sibling", rulesSibling);
context.define("parent", factsParent);

describe("Logic Engine & Unification", () => {
  let engine: LogicEngine;
  let evaluator: InterpreterVisitor;
  let kernel: YukigoKernel;

  beforeEach(() => {
    evaluator = new InterpreterVisitor(context);
    engine = new LogicEngine(evaluator, context);
    kernel = new YukigoKernel(evaluator, "all");
  });

  const unify = (
    t1: LogicTerm,
    t2: LogicTerm,
    substs: Substitution = new Map(),
  ) => {
    return t1.unify(t2, substs) ? substs : null;
  };

  describe("Unification Algorithm", () => {
    it("should unify two identical literals", () => {
      const p1 = new ConstantTerm("cat");
      const p2 = new ConstantTerm("cat");
      const result = unify(p1, p2);
      expect(result).to.not.be.null;
    });

    it("should not unify different literals", () => {
      const p1 = new ConstantTerm("cat");
      const p2 = new ConstantTerm("dog");
      const result = unify(p1, p2);
      expect(result).to.be.null;
    });

    it("should unify a variable with a literal", () => {
      const v1 = new VariableTerm(1, "X");
      const p2 = new ConstantTerm("cat");
      const result = unify(v1, p2);

      expect(result).to.not.be.null;
      const resolved = v1.resolve(result!);
      expect(resolved).to.be.instanceOf(ConstantTerm);
      expect((resolved as ConstantTerm).value).to.equal("cat");
    });

    it("should unify two variables (aliasing)", () => {
      const v1 = new VariableTerm(1, "X");
      const v2 = new VariableTerm(2, "Y");
      const result = unify(v1, v2);
      expect(result).to.not.be.null;
      expect(result!.has(1)).to.be.true;
    });

    describe("ConsPattern Unification", () => {
      it("should unify two identical ConsPatterns", () => {
        const p1 = new ConsTerm(new ConstantTerm(1), new ListTerm([]));
        const p2 = new ConsTerm(new ConstantTerm(1), new ListTerm([]));
        const result = unify(p1, p2);
        expect(result).to.not.be.null;
      });

      it("should unify ConsPattern with equivalent ListPattern", () => {
        const cons = new ConsTerm(
          new ConstantTerm(1),
          new ListTerm([new ConstantTerm(2)]),
        );
        const list = new ListTerm([new ConstantTerm(1), new ConstantTerm(2)]);
        const result = unify(cons, list);
        expect(result).to.not.be.null;
      });

      it("should unify ListPattern with equivalent ConsPattern", () => {
        const list = new ListTerm([new ConstantTerm(1), new ConstantTerm(2)]);
        const cons = new ConsTerm(
          new ConstantTerm(1),
          new ListTerm([new ConstantTerm(2)]),
        );
        const result = unify(list, cons);
        expect(result).to.not.be.null;
      });

      it("should fail if heads do not match", () => {
        const cons = new ConsTerm(
          new ConstantTerm(1),
          new ListTerm([new ConstantTerm(2)]),
        );
        const list = new ListTerm([new ConstantTerm(3), new ConstantTerm(2)]);
        const result = unify(cons, list);
        expect(result).to.be.null;
      });

      it("should fail if ListPattern is empty and ConsPattern expects head", () => {
        const list = new ListTerm([]);
        const cons = new ConsTerm(
          new VariableTerm(1, "H"),
          new VariableTerm(2, "T"),
        );
        const result = unify(list, cons);
        expect(result).to.be.null;
      });

      it("should bind variables in ConsPattern", () => {
        const list = new ListTerm([new ConstantTerm(1), new ConstantTerm(2)]);

        const vH = new VariableTerm(1, "H");
        const vT = new VariableTerm(2, "T");
        const cons = new ConsTerm(vH, vT);
        const result = unify(cons, list) as Substitution;
        expect(result).to.not.be.null;

        const h = vH.resolve(result);
        expect(h).to.be.instanceOf(ConstantTerm);

        const t = vT.resolve(result);
        expect(t).to.be.instanceOf(ListTerm);
        expect((t as ListTerm).elements).to.have.lengthOf(1);
      });

      it("should fail unification with occurs check (circularity)", () => {
        const vX = new VariableTerm(1, "X");
        const compound = new CompoundTerm("f", [vX]);
        const result = unify(vX, compound);
        expect(result).to.be.null;
      });

      it("should unify infinite LazyList with Variable lazily", () => {
        const gen = function* () {
          let i = 1;
          while (true) yield i++;
        };
        const lazyList: LazyList = {
          type: "LazyList",
          generator: gen,
        };

        evaluator.evaluate = (node: any) => {
          if (
            node instanceof Variable &&
            node.identifier.value === "Infinite"
          ) {
            return new StepCommand(lazyList);
          }
          if (node instanceof SymbolPrimitive)
            return new StepCommand(node.value);
          return new StepCommand(null);
        };

        const infiniteVar = new Variable(s("Infinite"), new NilPrimitive(null));
        const xVar = new Variable(s("X"), new NilPrimitive(null));

        const result = kernel.run(engine.unifyExpr(xVar, infiniteVar)) as [
          boolean,
        ];
        expect(result[0]).to.be.true;
      });
    });
  });

  describe("LogicEngine Execution", () => {
    it("should solve a simple ground goal (Fact exists)", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("ares")]);
      const results = kernel.run(engine.solveGoalLike(query)) as LogicResult[];
      expect(results[0].success).to.be.true;
    });

    it("should fail a ground goal that does not exist", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("thor")]);
      const results = kernel.run(engine.solveGoalLike(query)) as LogicResult[];
      expect(results).to.be.empty;
    });

    it("should solve a goal with a variable", () => {
      const goal = makeGoal("parent", [lit("zeus"), varPat("Child")]);
      const query = new Query([goal]);
      const results = kernel.run(engine.solveQuery(query)) as LogicResult[];

      expect(results.every((res) => res.allSuccessful())).to.be.true;

      const names = results.map(
        (res) => (res.solutions.get("Child") as ConstantTerm).value,
      );

      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });

    it("should solve a rule using backtracking", () => {
      const query = makeGoal("sibling", [lit("ares"), lit("athena")]);
      const results = kernel.run(engine.solveGoalLike(query)) as LogicResult[];
      expect(results[0].success).to.be.true;
    });
  });

  it("should solve a rule using backtracking with variable", () => {
    const goal = makeGoal("sibling", [lit("ares"), varPat("Child")]);
    const query = new Query([goal]);
    const results = kernel.run(engine.solveQuery(query)) as LogicResult[];
    expect(results.every((res) => res.allSuccessful())).to.be.true;
    const names = results.map(
      (res) => (res.solutions.get("Child") as ConstantTerm).value,
    );
    expect(names).to.include("ares");
    expect(names).to.include("athena");
  });

  describe("Output Modes", () => {
    it('should return all results when outputMode is "all"', () => {
      const goal = makeGoal("parent", [lit("zeus"), varPat("X")]);
      const query = new Query([goal]);
      const results = kernel.run(engine.solveQuery(query)) as LogicResult[];
      expect(results[0]).to.be.instanceOf(LogicResult);
      expect(results[1]).to.be.instanceOf(LogicResult);
      const names = results.map(
        (res) => (res.solutions.get("X") as ConstantTerm).value,
      );
      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });
  });

  describe("Findall", () => {
    it("should collect all solutions into a list", () => {
      const findallNode = new Findall(
        varPat("X"),
        makeGoal("parent", [lit("zeus"), varPat("X")]),
        varPat("List"),
      );

      const queryNode = new Query([findallNode]);
      const results = kernel.run(engine.solveQuery(queryNode)) as LogicResult[];
      const firstResult = results[0];
      expect(firstResult.allSuccessful()).to.be.true;

      const answer = firstResult.allAnswers[0];
      const solution = answer.getSolution();

      const list = solution.get("List") as ListTerm;
      expect(list).to.not.be.undefined;

      const names = list.elements.map((el) => (el as ConstantTerm).value);
      expect(names).to.have.lengthOf(2);
      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });

    describe("Expression Unification", () => {
      it("should successfully unify a variable with an array expression", () => {
        env.head.set("myList", "dummy");
        const X = new Variable(s("X"), new NilPrimitive(null));
        const myList = new Variable(s("myList"), new NilPrimitive(null));
        const result = kernel.run(engine.unifyExpr(X, myList));
        expect(result[0]).to.be.true;
      });
    });
  });
});
