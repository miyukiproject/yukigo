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
  RuntimeFact,
  RuntimeRule,
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
  LazyList
} from "yukigo-ast";
import {
  createGlobalEnv,
  ExpressionEvaluator,
} from "../../src/interpreter/utils.js";
import { LogicEngine } from "../../src/interpreter/components/LogicEngine.js";
import { InterpreterConfig } from "../../src/interpreter/index.js";
import { unify } from "../../src/interpreter/components/LogicResolver.js";
import { PatternResolver } from "../../src/interpreter/components/PatternMatcher.js";

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

class MockEvaluator implements ExpressionEvaluator {
  evaluate(node: any): any {
    if (node instanceof Variable && node.identifier.value === "myList") {
      return [1, 2, 3];
    }
    if (node instanceof SymbolPrimitive) return node.value;
    if (node instanceof NumberPrimitive) return node.value;
    if (node instanceof LiteralPattern) return this.evaluate(node.name);
    
    // Throw error for debugging
    throw new Error(`MockEvaluator: Cannot evaluate node: ${node.constructor.name} ${JSON.stringify(node)}`);
  }
}

describe("Logic Engine & Unification", () => {
  let engine: LogicEngine;
  let env: EnvStack;
  let evaluator: MockEvaluator;

  beforeEach(() => {
    env = createGlobalEnv();
    evaluator = new MockEvaluator();

    const config: InterpreterConfig = {
      debug: false,
      outputMode: "all",
    };

    engine = new LogicEngine(env, config, evaluator);
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
         
         const result = engine.unifyExpr(xVar, infiniteVar) as boolean;
         expect(result).to.be.true;
      });
    });
  });

  describe("LogicEngine Execution", () => {
    beforeEach(() => {
      const globalEnv = env.head;
      const factsParent: RuntimeFact = {
        kind: "Fact",
        identifier: "parent",
        equations: [
          makeFact("parent", [lit("zeus"), lit("ares")]),
          makeFact("parent", [lit("zeus"), lit("athena")]),
          makeFact("parent", [lit("hera"), lit("ares")]),
        ],
      };
      globalEnv.set("parent", factsParent);

      const rulesSibling: RuntimeRule = {
        kind: "Rule",
        identifier: "sibling",
        equations: [
          makeRule("sibling", [
            makeEq(
              [varPat("X"), varPat("Y")],
              [
                makeGoal("parent", [varPat("Z"), varPat("X")]),
                makeGoal("parent", [varPat("Z"), varPat("Y")]),
              ]
            ),
          ]),
        ],
      };
      globalEnv.set("sibling", rulesSibling);
    });

    it("should solve a simple ground goal (Fact exists)", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("ares")]);
      const results = engine.solveGoal(query) as LogicResult[];
      expect(results).to.not.be.false;
      results.forEach((res) => expect(res.success).to.be.true);
    });

    it("should fail a ground goal that does not exist", () => {
      const query = makeGoal("parent", [lit("zeus"), lit("thor")]);
      const results = engine.solveGoal(query) as LogicResult[];
      results.forEach((res) => expect(res.success).to.be.false);
    });

    it("should solve a goal with a variable", () => {
      const query = makeGoal("parent", [lit("zeus"), varPat("Child")]);
      const results = engine.solveGoal(query) as LogicResult[];
      results.forEach((res) => expect(res.success).to.be.true);
      results.forEach((res) => expect(res.solutions.has("Child")).to.be.true);

      const names = results.map((r) => r.solutions.get("Child"));
      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });

    it("should solve a rule using backtracking", () => {
      const query = makeGoal("sibling", [lit("ares"), lit("athena")]);
      const results = engine.solveGoal(query) as LogicResult[];
      results.forEach((res) => expect(res.success).to.be.true);
    });
    it("should solve a rule using backtracking with variable", () => {
      const query = makeGoal("sibling", [lit("ares"), varPat("Child")]);
      const results = engine.solveGoal(query) as LogicResult[];
      results.forEach((res) => expect(res.success).to.be.true);
      const names = results.map((r) => r.solutions.get("Child"));
      expect(names).to.include("ares");
      expect(names).to.include("athena");
    });
    describe("Output Modes", () => {
      it('should return all results when outputMode is "all"', () => {
        engine = new LogicEngine(env, { outputMode: "all" }, evaluator);
        const query = makeGoal("parent", [lit("zeus"), varPat("X")]);

        const results = engine.solveGoal(query) as LogicResult[];
        expect(results).to.be.an("array");
        expect(results).to.have.lengthOf(2);

        const names = results.map((r) => r.solutions.get("X"));
        expect(names).to.include("ares");
        expect(names).to.include("athena");
      });
    });

    describe("Findall", () => {
      it("should collect all solutions into a list", () => {
        const findallNode = new Findall(
          varPat("X"), // Template
          makeGoal("parent", [lit("zeus"), varPat("X")]), // Goal
          varPat("List") // Bag variable
        );
        const result = engine.solveFindall(findallNode) as LogicResult[];
        expect(Array.isArray(result)).to.be.true;
        expect(result).to.have.lengthOf(2);
        expect(result).to.include("ares");
        expect(result).to.include("athena");
      });
    });

    describe("Expression Unification", () => {
      it("should successfully unify a variable with an array expression", () => {
        env.head.set("myList", "dummy");
        const X = new Variable(s("X"), new NilPrimitive(null));
        const myList = new Variable(s("myList"), new NilPrimitive(null));
        const result = engine.unifyExpr(X, myList);
        expect(result).to.be.true;
      });
    });
  });
});
