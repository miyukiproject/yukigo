import { expect } from "chai";
import {
  Function as AstFunction,
  Fact,
  Rule,
  SymbolPrimitive,
  Equation,
  EnvStack,
  RuntimeFunction,
  RuntimePredicate,
} from "yukigo-ast";
import { EnvBuilderVisitor } from "../../src/interpreter/components/EnvBuilder.js";
import {
  createGlobalEnv,
  define,
  isDefined,
  lookup,
} from "../../src/interpreter/utils.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";

const id = (val: string) => ({ value: val } as SymbolPrimitive);

const makeEq = (arity: number): Equation =>
  ({
    patterns: new Array(arity).fill({ type: "MockPattern" }), // Relleno dummy
    body: { type: "MockBody" } as any,
  } as any);

const makeFunc = (
  name: string,
  arity: number,
  eqCount: number = 1
): AstFunction =>
  ({
    type: "Function",
    identifier: id(name),
    equations: new Array(eqCount).fill(null).map(() => makeEq(arity)),
    accept: (v: any) => v.visitFunction(makeFunc(name, arity, eqCount)),
  } as any);

const makeFact = (name: string): Fact => {
  const node = {
    type: "Fact",
    identifier: id(name),
    patterns: [],
  } as any;
  node.accept = (v: any) => v.visitFact(node);
  return node;
};

const makeRule = (name: string): Rule => {
  const node = {
    type: "Rule",
    identifier: id(name),
    patterns: [],
    expressions: [],
  } as any;
  node.accept = (v: any) => v.visitRule(node);
  return node;
};

describe("EnvBuilderVisitor", () => {
  let visitor: EnvBuilderVisitor;
  let env: EnvStack;

  beforeEach(() => {
    env = createGlobalEnv();
    visitor = new EnvBuilderVisitor(new RuntimeContext(), env);
  });

  describe("Function Declarations", () => {
    it("should register a valid function", () => {
      const funcNode = makeFunc("myFunc", 1);

      visitor.visitFunction(funcNode);

      expect(isDefined(env, "myFunc")).to.be.true;
      const entry = lookup(env, "myFunc") as RuntimeFunction;

      expect(entry).to.have.property("identifier", "myFunc");
      expect(entry).to.have.property("arity", 1);
      expect(entry.equations).to.have.lengthOf(1);
    });

    it("should register a function with multiple equations", () => {
      const funcNode = makeFunc("fib", 1, 2);

      visitor.visitFunction(funcNode);

      const entry = lookup(env, "fib") as RuntimeFunction;
      expect(entry.equations).to.have.lengthOf(2);
    });

    it("should throw error if function has no equations", () => {
      const funcNode = makeFunc("empty", 0, 0);

      expect(() => visitor.visitFunction(funcNode)).to.throw(
        /has no equations/
      );
    });

    it("should throw error if equations have different arity", () => {
      const funcNode = makeFunc("badFunc", 1);
      funcNode.equations.push(makeEq(2));

      expect(() => visitor.visitFunction(funcNode)).to.throw(
        /must have the same arity/
      );
    });
  });

  describe("Logic Programming (Facts)", () => {
    it("should register a new Fact", () => {
      const factNode = makeFact("parent");

      visitor.visitFact(factNode);

      expect(isDefined(env, "parent")).to.be.true;
      const entry = lookup(env, "parent") as RuntimePredicate;
      expect(entry).to.have.property("kind", "Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(factNode);
    });

    it("should append to existing Fact if identifier exists", () => {
      const f1 = makeFact("parent");
      const f2 = makeFact("parent");

      visitor.visitFact(f1);
      visitor.visitFact(f2);

      const entry = lookup(env, "parent") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(f1);
      expect(entry.equations[1]).to.equal(f2);
    });

    it("should overwrite existing entry if it is not a Fact", () => {
      define(env, "test", { type: "SomethingElse", equations: [] } as any);
      const factNode = makeFact("test");
      visitor.visitFact(factNode);

      const entry = lookup(env, "test") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(factNode);
    });
  });

  describe("Logic Programming (Rules)", () => {
    it("should register a new Rule", () => {
      const ruleNode = makeRule("grandparent");

      visitor.visitRule(ruleNode);

      expect(isDefined(env, "grandparent")).to.be.true;
      const entry = lookup(env, "grandparent") as RuntimePredicate;
      expect(entry).to.have.property("kind", "Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(ruleNode);
    });

    it("should append to existing Rule group", () => {
      const r1 = makeRule("ancestor");
      const r2 = makeRule("ancestor");

      visitor.visitRule(r1);
      visitor.visitRule(r2);

      const entry = lookup(env, "ancestor") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(r1);
      expect(entry.equations[1]).to.equal(r2);
    });
  });

  describe("Build Method (Integration)", () => {
    it("should traverse the AST and build the complete environment", () => {
      const nodes = [
        makeFunc("add", 2),
        makeFact("is_human"),
        makeRule("is_mortal"),
      ];

      const mockAST = {
        [Symbol.iterator]: function* () {
          yield* nodes;
        },
      } as any;

      // mock of the accept method
      nodes[0].accept = (v: any) => v.visitFunction(nodes[0]);
      nodes[1].accept = (v: any) => v.visitFact(nodes[1]);
      nodes[2].accept = (v: any) => v.visitRule(nodes[2]);

      const resultingStack = visitor.build(mockAST);
      const resultingEnv = resultingStack.head;

      expect(resultingEnv.has("add")).to.be.true;
      expect(resultingEnv.has("is_human")).to.be.true;
      expect(resultingEnv.has("is_mortal")).to.be.true;
    });
  });
});
