import { expect } from "chai";
import {
  VariableTerm,
  ConstantTerm,
  ListTerm,
  ConsTerm,
  CompoundTerm,
} from "../../src/interpreter/components/logic/LogicTerm.js";
import { LogicTerm, Substitution } from "../../src/interpreter/runtime.js";

describe("Logic Substitution (instantiate)", () => {
  it("should recursively substitute in ListTerm", () => {
    const term = new ListTerm([
      new VariableTerm(1, "X"),
      new ConstantTerm(1),
      new VariableTerm(2, "Y"),
    ]);
    const substs: Substitution = new Map([
      [1, new ConstantTerm("cat")],
      [2, new ConstantTerm("dog")],
    ]);

    const result = term.instantiate(substs) as ListTerm;
    expect(result).to.be.instanceOf(ListTerm);
    expect((result.elements[0] as ConstantTerm).value).to.equal("cat");
    expect((result.elements[1] as ConstantTerm).value).to.equal(1);
    expect((result.elements[2] as ConstantTerm).value).to.equal("dog");
  });

  it("should recursively substitute in ConsTerm", () => {
    const term = new ConsTerm(
      new VariableTerm(1, "X"),
      new VariableTerm(2, "Y"),
    );
    const substs: Substitution = new Map<number, LogicTerm>([
      [1, new ConstantTerm(1)],
      [2, new ListTerm([new ConstantTerm(2), new ConstantTerm(3)])],
    ]);

    const result = term.instantiate(substs) as ConsTerm;
    expect(result).to.be.instanceOf(ConsTerm);
    expect((result.head as ConstantTerm).value).to.equal(1);
    expect(result.tail).to.be.instanceOf(ListTerm);
    expect((result.tail as ListTerm).elements).to.have.lengthOf(2);
  });

  it("should recursively substitute in CompoundTerm", () => {
    const term = new CompoundTerm("person", [
      new VariableTerm(1, "Name"),
      new VariableTerm(2, "Age"),
    ]);
    const substs: Substitution = new Map([
      [1, new ConstantTerm("Alice")],
      [2, new ConstantTerm(30)],
    ]);

    const result = term.instantiate(substs) as CompoundTerm;
    expect(result).to.be.instanceOf(CompoundTerm);
    expect(result.functor).to.equal("person");
    expect((result.args[0] as ConstantTerm).value).to.equal("Alice");
    expect((result.args[1] as ConstantTerm).value).to.equal(30);
  });

  it("should handle nested substitutions", () => {
    const term = new VariableTerm(1, "X");
    const substs: Substitution = new Map<number, LogicTerm>([
      [1, new ListTerm([new VariableTerm(2, "Y")])],
      [2, new ConstantTerm("hello")],
    ]);

    const result = term.instantiate(substs) as ListTerm;
    expect(result).to.be.instanceOf(ListTerm);
    expect((result.elements[0] as ConstantTerm).value).to.equal("hello");
  });
});
