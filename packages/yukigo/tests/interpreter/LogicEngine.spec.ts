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
  LogicResult,
  EnvStack,
  Equation,
  Sequence,
  UnguardedBody,
  Statement,
  Variable,
  ConsPattern,
  ListPattern,
  NilPrimitive,
  LazyList,
  LogicConstraint,
  Expression,
  SuccessLogicResult,
  RuntimePredicate,
} from "yukigo-ast";
import {
  createGlobalEnv,
  ExpressionEvaluator,
} from "../../src/interpreter/utils.js";
import { LogicEngine } from "../../src/interpreter/components/logic/LogicEngine.js";
import { unify } from "../../src/interpreter/components/logic/LogicResolver.js";
import { PatternResolver } from "../../src/interpreter/components/PatternMatcher.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import {
  idContinuation,
  trampoline,
} from "../../src/interpreter/trampoline.js";
import {
  InterpreterConfig,
  RuntimeContext,
} from "../../src/interpreter/components/RuntimeContext.js";

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

const factsParent: RuntimePredicate = {
  kind: "Fact",
  identifier: "parent",
  equations: [
    makeFact("parent", [lit("zeus"), lit("ares")]),
    makeFact("parent", [lit("zeus"), lit("athena")]),
    makeFact("parent", [lit("hera"), lit("ares")]),
  ],
};
const rulesSibling: RuntimePredicate = {
  kind: "Rule",
  identifier: "sibling",
  equations: [
    makeRule("sibling", [
      makeEq(
        [varPat("X"), varPat("Y")],
        [
          makeConstraint(makeGoal("parent", [varPat("Z"), varPat("X")])),
          makeConstraint(makeGoal("parent", [varPat("Z"), varPat("Y")])),
        ],
      ),
    ]),
  ],
};

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
  let evaluator: ExpressionEvaluator;

  beforeEach(() => {
    evaluator = new InterpreterVisitor(context);
    engine = new LogicEngine(evaluator, context);
  });

  describe("Unification Algorithm", () => {
    it("should unify two identical literals", () => {
      const p1 = lit("cat");
      const p2 = lit("cat");
      const result = unify(p1, p2);
      expect(result).to.not.be.null;
    });

    it("should not unify different literals", () => {
      const p1 = lit("cat");
      const p2 = lit("dog");
      const result = unify(p1, p2);
      expect(result).to.be.null;
    });

    it("should unify a variable with a literal", () => {
      const v1 = varPat("X");
      const p2 = lit("cat");
      const result = unify(v1, p2);

      expect(result).to.not.be.null;
      const resolved = result!.get("X");
      expect(resolved).to.be.instanceOf(LiteralPattern);
      const resolver = new PatternResolver();
      expect(resolved?.accept(resolver)).to.equal("cat");
    });

    it("should unify two variables (aliasing)", () => {
      const v1 = varPat("X");
      const v2 = varPat("Y");
      const result = unify(v1, v2);
      expect(result).to.not.be.null;
      expect(result!.has("X")).to.be.true;
    });

    describe("ConsPattern Unification", () => {
      it("should unify two identical ConsPatterns", () => {
          const p1 = new ConsPattern(lit(1), new ListPattern([]));
          const p2 = new ConsPattern(lit(1), new ListPattern([]));
          const result = unify(p1, p2);
          expect(result).to.not.be.null;
      });

      it("should unify ConsPattern with equivalent ListPattern", () => {
          const cons = new ConsPattern(lit(1), new ListPattern([lit(2)]));
          const list = new ListPattern([lit(1), lit(2)]);
          const result = unify(cons, list);
          expect(result).to.not.be.null;
      });

      it("should unify ListPattern with equivalent ConsPattern", () => {
          const list = new ListPattern([lit(1), lit(2)]);
          const cons = new ConsPattern(lit(1), new ListPattern([lit(2)]));
          const result = unify(list, cons);
          expect(result).to.not.be.null;
      });

      it("should fail if heads do not match", () => {
          const cons = new ConsPattern(lit(1), new ListPattern([lit(2)]));
          const list = new ListPattern([lit(3), lit(2)]);
          const result = unify(cons, list);
          expect(result).to.be.null;
      });
      
      it("should fail if ListPattern is empty and ConsPattern expects head", () => {
          const list = new ListPattern([]);
          const cons = new ConsPattern(varPat("H"), varPat("T"));
          const result = unify(list, cons);
          expect(result).to.be.null;
      });

      it("should bind variables in ConsPattern", () => {
          const cons = new ConsPattern(varPat("H"), varPat("T"));
          const list = new ListPattern([lit(1), lit(2)]);
          const result = unify(cons, list);
          expect(result).to.not.be.null;
          
          const h = result!.get("H");
          expect(h).to.be.instanceOf(LiteralPattern);
          
          const t = result!.get("T");
          expect(t).to.be.instanceOf(ListPattern);
          expect((t as ListPattern).elements).to.have.lengthOf(1);
      });

      it("should unify infinite LazyList with Variable lazily", () => {
         // Create infinite generator
         const gen = function*() {
             let i = 1;
             while(true) yield i++;
         };
         const lazyList: LazyList = {
             type: "LazyList",
             generator: gen
         };

         // Mock evaluator to return this lazy list for variable "Infinite"
         evaluator.evaluate = (node: any) => {
             if (node instanceof Variable && node.identifier.value === "Infinite") {
                 return lazyList;
             }
             if (node instanceof SymbolPrimitive) return node.value;
             return null;
         };
         
         // Unify X = Infinite
         const infiniteVar = new Variable(s("Infinite"), new NilPrimitive(null));
         const xVar = new Variable(s("X"), new NilPrimitive(null));
         
         const result = trampoline(engine.unifyExpr(xVar, infiniteVar, idContinuation)) as boolean;
         expect(result).to.be.true;
      });
    });
  });

  describe("LogicEngine Execution", () => {
    it("should solve a simple ground goal (Fact exists)", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("ares")]);
      const results = trampoline(
        engine.solveGoal(query, idContinuation),
      ) as LogicResult[];
      expect(results).to.not.be.false;
      results.forEach((res) => expect(res.success).to.be.true);
    });

    it("should fail a ground goal that does not exist", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("thor")]);
      const results = trampoline(
        engine.solveGoal(query, idContinuation),
      ) as LogicResult[];
      results.forEach((res) => expect(res.success).to.be.false);
    });

    it("should solve a goal with a variable", () => {
      const query = makeGoal("parent", [lit("zeus"), varPat("Child")]);
      const results = trampoline(
        engine.solveGoal(query, idContinuation),
      ) as LogicResult[];

      results.forEach((res) => {
        if (!res.success) expect.fail("Result should be successful");
        expect(res.solutions.has("Child")).to.be.true;
      });

      const names = results.map((r) => {
        if (!r.success) throw new Error("Unexpected failure");
        return r.solutions.get("Child");
      });

      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });

    it("should solve a rule using backtracking", () => {
      const query = makeGoal("sibling", [lit("ares"), lit("athena")]);
      const results = trampoline(
        engine.solveGoal(query, idContinuation),
      ) as LogicResult[];
      expect(results.length).to.be.eq(1);
      const solution = results[0] as SuccessLogicResult;
      expect(solution.success).to.be.true;
      expect(solution.solutions.get("X")).to.eq("ares");
      expect(solution.solutions.get("Y")).to.eq("athena");
      expect(solution.solutions.get("Z")).to.eq("zeus");
    });
  });
  it("should solve a rule using backtracking with variable", () => {
    const query = makeGoal("sibling", [lit("ares"), varPat("Child")]);
    const results = trampoline(
      engine.solveGoal(query, idContinuation),
    ) as LogicResult[];
    results.forEach((res) => {
      if (!res.success) expect.fail("Result should be successful");
      expect(res.solutions.has("Child")).to.be.true;
    });
    const names = results.map((r) => {
      if (!r.success) throw new Error("Unexpected failure");
      return r.solutions.get("Child");
    });
    expect(names).to.include("ares");
    expect(names).to.include("athena");
  });
  describe("Output Modes", () => {
    it('should return all results when outputMode is "all"', () => {
      const query = makeGoal("parent", [lit("zeus"), varPat("X")]);

      const results = trampoline(
        engine.solveGoal(query, idContinuation),
      ) as LogicResult[];
      expect(results).to.be.an("array");
      expect(results).to.have.lengthOf(2);
      const names = results.map((r) => {
        if (!r.success) throw new Error("Unexpected failure");
        return r.solutions.get("X");
      });
      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });
  });

  describe("Findall", () => {
    it("should collect all solutions into a list", () => {
      const findallNode = new Findall(
        varPat("X"), // Template
        makeGoal("parent", [lit("zeus"), varPat("X")]), // Goal
        varPat("List"), // Bag variable
      );
      const result = trampoline(
        engine.solveFindall(findallNode, idContinuation),
      ) as any;
      expect(Array.isArray(result)).to.be.true;
      expect(result).to.have.lengthOf(2);
      expect(result).to.include("ares");
      expect(result).to.include("athena");
    });

    describe("Expression Unification", () => {
      it("should successfully unify a variable with an array expression", () => {
        env.head.set("myList", "dummy");
        const X = new Variable(s("X"), new NilPrimitive(null));
        const myList = new Variable(s("myList"), new NilPrimitive(null));
        const result = trampoline(engine.unifyExpr(X, myList, idContinuation));
        expect(result).to.be.true;
      });
    });
  });
});
