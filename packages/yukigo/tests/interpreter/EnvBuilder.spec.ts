import { expect } from "chai";
import {
  Fact,
  Rule,
  SymbolPrimitive,
  Equation,
  Function as AstFunction,
  AST,
  UnguardedBody,
  Sequence,
} from "yukigo-ast";
import { EnvBuilderVisitor } from "../../src/interpreter/components/EnvBuilder.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { RuntimeFunction, RuntimePredicate } from "../../src/interpreter/primitives/index.js";

const id = (val: string) => new SymbolPrimitive(val);

const makeEq = (arity: number): Equation =>
  new Equation(
    new Array(arity).fill({ type: "MockPattern", accept: () => {} } as any),
    new UnguardedBody(new Sequence([])),
  );

const makeFunc = (
  name: string,
  arity: number,
  eqCount: number = 1,
): AstFunction =>
  new AstFunction(id(name), Array(eqCount).fill(null).map(() => makeEq(arity)));

const makeFact = (name: string, arity: number = 0): Fact => {
  return new Fact(
    id(name),
    new Array(arity).fill({ type: "MockPattern", accept: () => {} } as any),
  );
};

const makeRule = (name: string, arity: number = 0): Rule => {
  return new Rule(id(name), [makeEq(arity)]);
};

describe("EnvBuilderVisitor", () => {
  let ctx: RuntimeContext;
  let visitor: EnvBuilderVisitor;

  beforeEach(() => {
    ctx = new RuntimeContext();
    visitor = new EnvBuilderVisitor(ctx);
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
      funcNode.equations = [];

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
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(factNode);
    });

    it("should append to existing Fact if identifier exists", () => {
      const f1 = makeFact("parent");
      const f2 = makeFact("parent");

      visitor.visitFact(f1);
      visitor.visitFact(f2);

      const entry = ctx.lookup("parent") as RuntimePredicate;
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(f1);
      expect(entry.equations[1]).to.equal(f2);
    });

    it("should throw error if existing entry is not a Fact", () => {
      ctx.define("test", { type: "SomethingElse", equations: [] } as any);
      const factNode = makeFact("test");
      expect(() => visitor.visitFact(factNode)).to.throw(
        /is not a predicate/,
      );
    });

    it("should throw error if arity mismatch in Fact", () => {
      const f1 = makeFact("parent", 2);
      const f2 = makeFact("parent", 1);

      visitor.visitFact(f1);
      expect(() => visitor.visitFact(f2)).to.throw(/Arity mismatch/);
    });
  });

  describe("Logic Programming (Rules)", () => {
    it("should register a new Rule", () => {
      const ruleNode = makeRule("grandparent");

      visitor.visitRule(ruleNode);

      expect(ctx.isDefined("grandparent")).to.be.true;
      const entry = ctx.lookup("grandparent") as RuntimePredicate;
      expect(entry.equations).to.have.lengthOf(1);
      expect(entry.equations[0]).to.equal(ruleNode);
    });

    it("should append to existing Rule group", () => {
      const r1 = makeRule("ancestor");
      const r2 = makeRule("ancestor");

      visitor.visitRule(r1);
      visitor.visitRule(r2);

      const entry = ctx.lookup("ancestor") as RuntimePredicate;
      expect(entry.equations).to.have.lengthOf(2);
      expect(entry.equations[0]).to.equal(r1);
      expect(entry.equations[1]).to.equal(r2);
    });

    it("should throw error if arity mismatch in Rule", () => {
      const r1 = makeRule("sibling", 2);
      const r2 = makeRule("sibling", 3);

      visitor.visitRule(r1);
      expect(() => visitor.visitRule(r2)).to.throw(/Arity mismatch/);
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
