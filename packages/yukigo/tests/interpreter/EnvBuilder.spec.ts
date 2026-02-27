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
  Function,
  AST,
} from "yukigo-ast";
import { EnvBuilderVisitor } from "../../src/interpreter/components/EnvBuilder.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";

const id = (val: string) => ({ value: val }) as SymbolPrimitive;

const makeEq = (arity: number): Equation =>
  ({
    patterns: new Array(arity).fill({ type: "MockPattern" }),
    body: { type: "MockBody" } as any,
  }) as any;

const makeFunc = (
  name: string,
  arity: number,
  eqCount: number = 1,
): AstFunction => new Function(id(name), Array(eqCount).fill(makeEq(arity)));

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
  let ctx: RuntimeContext;
  let visitor: EnvBuilderVisitor;
  let env: EnvStack;

  beforeEach(() => {
    ctx = new RuntimeContext();
    visitor = new EnvBuilderVisitor(ctx);
    env = ctx.env;
  });

  describe("Function Declarations", () => {
    it("should register a valid function", () => {
      const funcNode = makeFunc("myFunc", 1);

      visitor.visitFunction(funcNode);

      expect(ctx.isDefined("myFunc")).to.be.true;
      const entry = ctx.lookup("myFunc") as RuntimeFunction;

      expect(entry).to.have.property("identifier", "myFunc");
      expect(entry).to.have.property("arity", 1);
      expect(entry.equations).to.have.lengthOf(1);
    });

    it("should register a function with multiple equations", () => {
      const funcNode = makeFunc("fib", 1, 2);

      visitor.visitFunction(funcNode);

      const entry = ctx.lookup("fib") as RuntimeFunction;
      expect(entry.equations).to.have.lengthOf(2);
    });

    it("should throw error if function has no equations", () => {
      const funcNode = makeFunc("empty", 0, 0);

      expect(() => visitor.visitFunction(funcNode)).to.throw(
        /has no equations/,
      );
    });

    it("should throw error if equations have different arity", () => {
      const funcNode = makeFunc("badFunc", 1);
      funcNode.equations.push(makeEq(2));

      expect(() => visitor.visitFunction(funcNode)).to.throw(
        /must have the same arity/,
      );
    });
  });

  describe("Logic Programming (Facts)", () => {
    it("should register a new Fact", () => {
      const factNode = makeFact("parent");

      visitor.visitFact(factNode);

      expect(ctx.isDefined("parent")).to.be.true;
      const entry = ctx.lookup("parent") as RuntimePredicate;
      expect(entry).to.have.property("kind", "Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(factNode);
    });

    it("should append to existing Fact if identifier exists", () => {
      const f1 = makeFact("parent");
      const f2 = makeFact("parent");

      visitor.visitFact(f1);
      visitor.visitFact(f2);

      const entry = ctx.lookup("parent") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(f1);
      expect(entry.equations[1]).to.equal(f2);
    });

    it("should overwrite existing entry if it is not a Fact", () => {
      ctx.define("test", { type: "SomethingElse", equations: [] } as any);
      const factNode = makeFact("test");
      visitor.visitFact(factNode);

      const entry = ctx.lookup("test") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(factNode);
    });
  });

  describe("Logic Programming (Rules)", () => {
    it("should register a new Rule", () => {
      const ruleNode = makeRule("grandparent");

      visitor.visitRule(ruleNode);

      expect(ctx.isDefined("grandparent")).to.be.true;
      const entry = ctx.lookup("grandparent") as RuntimePredicate;
      expect(entry).to.have.property("kind", "Predicate");
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(ruleNode);
    });

    it("should append to existing Rule group", () => {
      const r1 = makeRule("ancestor");
      const r2 = makeRule("ancestor");

      visitor.visitRule(r1);
      visitor.visitRule(r2);

      const entry = ctx.lookup("ancestor") as RuntimePredicate;
      expect(entry.kind).to.equal("Predicate");
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(r1);
      expect(entry.equations[1]).to.equal(r2);
    });
  });

  it("should traverse the AST and build the complete environment", () => {
    const nodes: AST = [
      makeFunc("add", 2),
      makeFact("is_human"),
      makeRule("is_mortal"),
    ];

    visitor.build(nodes);
    expect(ctx.isDefined("add")).to.be.true;
    expect(ctx.isDefined("is_human")).to.be.true;
    expect(ctx.isDefined("is_mortal")).to.be.true;
  });
});
