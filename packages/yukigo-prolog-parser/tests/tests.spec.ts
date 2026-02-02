import { expect } from "chai";
import { YukigoPrologParser } from "../src/index.js";
import {
  Test,
  StringPrimitive,
  Exist,
  SymbolPrimitive,
  Fact
} from "yukigo-ast";

describe("Prolog Test Parsing", () => {
  const parser = new YukigoPrologParser("");

  it("should parse a simple test rule", () => {
    const code = `test('socrates es persona'):- persona(socrates).`;
    const ast = parser.parse(code);
    
    expect(ast).to.have.lengthOf(1);
    expect(ast[0]).to.be.instanceOf(Test);
    
    const test = ast[0] as Test;
    expect(test.name).to.be.instanceOf(StringPrimitive);
    expect((test.name as StringPrimitive).value).to.equal("'socrates es persona'");
    
    expect(test.body.statements).to.have.lengthOf(1);
    expect(test.body.statements[0]).to.be.instanceOf(Exist);
    const body = test.body.statements[0] as Exist;
    expect((body.identifier as SymbolPrimitive).value).to.equal("persona");
  });

  it("should parse multiple tests", () => {
    const code = `
test('test 1'):- a(b).
test('test 2'):- c(d).
    `;
    const ast = parser.parse(code);
    expect(ast).to.have.lengthOf(2);
    expect(ast[0]).to.be.instanceOf(Test);
    expect(ast[1]).to.be.instanceOf(Test);
  });

  it("should parse tests mixed with facts", () => {
    const code = `
persona(socrates).
test('es persona'):- persona(socrates).
    `;
    const ast = parser.parse(code);
    expect(ast).to.have.lengthOf(2);
    expect(ast[0]).to.be.instanceOf(Fact);
    expect(ast[1]).to.be.instanceOf(Test);
  });
});
