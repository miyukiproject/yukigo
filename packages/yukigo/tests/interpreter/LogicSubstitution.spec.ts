import { expect } from "chai";
import {
  VariableTerm,
  ConstantTerm,
  ListTerm,
  ConsTerm,
  CompoundTerm,
} from "../../src/interpreter/components/logic/LogicTerm.js";
import {
  Substitution,
  LogicTerm,
  YuNumber,
  YuString,
} from "../../src/interpreter/primitives/index.js";

const number = (num: number) => new YuNumber(num);
const string = (str: string) => new YuString(str);

describe("Logic Substitution (instantiate)", () => {
  it("should recursively substitute in ListTerm", () => {
    const term = new ListTerm([
      new VariableTerm(1, "X"),
      new ConstantTerm(number(1)),
      new VariableTerm(2, "Y"),
    ]);
    const substs: Substitution = new Map([
      [1, new ConstantTerm(string("cat"))],
      [2, new ConstantTerm(string("dog"))],
    ]);

    const result = term.instantiate(substs) as ListTerm;
    expect(result).to.be.instanceOf(ListTerm);
    expect((result.elements[0] as ConstantTerm).value).to.deep.equal(string("cat"));
    expect((result.elements[1] as ConstantTerm).value).to.deep.equal(number(1));
    expect((result.elements[2] as ConstantTerm).value).to.deep.equal(string("dog"));
  });

  it("should recursively substitute in ConsTerm", () => {
    const term = new ConsTerm(
      new VariableTerm(1, "X"),
      new VariableTerm(2, "Y"),
    );
    const substs: Substitution = new Map<number, LogicTerm>([
      [1, new ConstantTerm(number(1))],
      [
        2,
        new ListTerm([
          new ConstantTerm(number(2)),
          new ConstantTerm(number(3)),
        ]),
      ],
    ]);

    const result = term.instantiate(substs) as ConsTerm;
    expect(result).to.be.instanceOf(ConsTerm);
    expect((result.head as ConstantTerm).value).to.deep.equal(number(1));
    expect(result.tail).to.be.instanceOf(ListTerm);
    expect((result.tail as ListTerm).elements).to.have.lengthOf(2);
  });

  it("should recursively substitute in CompoundTerm", () => {
    const term = new CompoundTerm("person", [
      new VariableTerm(1, "Name"),
      new VariableTerm(2, "Age"),
    ]);
    const substs: Substitution = new Map([
      [1, new ConstantTerm(string("Alice"))],
      [2, new ConstantTerm(number(30))],
    ]);

    const result = term.instantiate(substs) as CompoundTerm;
    expect(result).to.be.instanceOf(CompoundTerm);
    expect(result.functor).to.equal("person");
    expect((result.args[0] as ConstantTerm).value).to.deep.equal(string("Alice"));
    expect((result.args[1] as ConstantTerm).value).to.deep.equal(number(30));
  });

  it("should handle nested substitutions", () => {
    const term = new VariableTerm(1, "X");
    const substs: Substitution = new Map<number, LogicTerm>([
      [1, new ListTerm([new VariableTerm(2, "Y")])],
      [2, new ConstantTerm(string("hello"))],
    ]);

    const result = term.instantiate(substs) as ListTerm;
    expect(result).to.be.instanceOf(ListTerm);
    const value = result.elements[0] as ConstantTerm;
    console.log(value.toPrimitive())
    expect(value.toPrimitive()).to.deep.equal(string("hello"));
  });
});
