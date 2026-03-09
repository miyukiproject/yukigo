import { expect } from "chai";
import {
  SymbolPrimitive,
  NumberPrimitive,
  LiteralPattern,
  VariablePattern,
  ListPattern,
  ConsPattern,
  FunctorPattern,
  Pattern,
} from "yukigo-ast";
import {
  instantiate,
  Substitution,
} from "../../src/interpreter/components/logic/LogicResolver.js";

const s = (val: string) => new SymbolPrimitive(val);
const n = (val: number) => new NumberPrimitive(val);
const lit = (val: string | number) =>
  new LiteralPattern(typeof val === "string" ? s(val) : n(val));
const varPat = (name: string) => new VariablePattern(s(name));

describe("Logic Substitution (instantiate)", () => {
  it("should recursively substitute in ListPattern", () => {
    const pattern = new ListPattern([varPat("X"), lit(1), varPat("Y")]);
    const substs: Substitution = new Map([
      ["X", lit("cat")],
      ["Y", lit("dog")],
    ]);

    const result = instantiate(pattern, substs) as ListPattern;
    expect(result).to.be.instanceOf(ListPattern);
    expect(result.elements[0]).to.deep.equal(lit("cat"));
    expect(result.elements[1]).to.deep.equal(lit(1));
    expect(result.elements[2]).to.deep.equal(lit("dog"));
  });

  it("should recursively substitute in ConsPattern", () => {
    const pattern = new ConsPattern(varPat("X"), varPat("Y"));
    const substs: Substitution = new Map<string, Pattern>([
      ["X", lit(1)],
      ["Y", new ListPattern([lit(2), lit(3)])],
    ]);

    const result = instantiate(pattern, substs) as ConsPattern;
    expect(result).to.be.instanceOf(ConsPattern);
    expect(result.left).to.deep.equal(lit(1));
    expect(result.right).to.be.instanceOf(ListPattern);
    expect((result.right as ListPattern).elements).to.have.lengthOf(2);
  });

  it("should recursively substitute in FunctorPattern", () => {
    const pattern = new FunctorPattern(s("person"), [
      varPat("Name"),
      varPat("Age"),
    ]);
    const substs: Substitution = new Map([
      ["Name", lit("Alice")],
      ["Age", lit(30)],
    ]);

    const result = instantiate(pattern, substs) as FunctorPattern;
    expect(result).to.be.instanceOf(FunctorPattern);
    expect(result.identifier.value).to.equal("person");
    expect(result.args[0]).to.deep.equal(lit("Alice"));
    expect(result.args[1]).to.deep.equal(lit(30));
  });

  it("should handle nested substitutions", () => {
    const pattern = varPat("X");
    const substs: Substitution = new Map<string, Pattern>([
      ["X", new ListPattern([varPat("Y")])],
      ["Y", lit("hello")],
    ]);

    const result = instantiate(pattern, substs) as ListPattern;
    expect(result).to.be.instanceOf(ListPattern);
    expect(result.elements[0]).to.deep.equal(lit("hello"));
  });
});
