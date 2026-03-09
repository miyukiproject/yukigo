import { expect } from "chai";
import { YukigoHaskellParser } from "../src/index.js";
import {
  TestGroup,
  Test,
  Assert,
  Equality,
  Truth,
  Failure,
  Raise,
  NumberPrimitive,
  SymbolPrimitive,
  Application,
  StringPrimitive,
  BooleanPrimitive
} from "yukigo-ast";

describe("HSpec Parsing", () => {
  const parser = new YukigoHaskellParser("", { typecheck: true, includePrims: false });

  it("should parse describe and it blocks", () => {
    const code = `
describe "Math" do
  it "adds 1 and 1" do
    (1 + 1) shouldBe 2
`;
    const ast = parser.parse(code);
    expect(ast).to.have.lengthOf(1);
    expect(ast[0]).to.be.instanceOf(TestGroup);
    
    const group = ast[0] as TestGroup;
    expect(group.name).to.be.instanceOf(StringPrimitive);
    expect((group.name as StringPrimitive).value).to.equal("Math");
    
    expect(group.group.statements).to.have.lengthOf(1);
    expect(group.group.statements[0]).to.be.instanceOf(Test);
    
    const test = group.group.statements[0] as Test;
    expect(test.name).to.be.instanceOf(StringPrimitive);
    expect((test.name as StringPrimitive).value).to.equal("adds 1 and 1");
    
    expect(test.body.statements).to.have.lengthOf(1);
    expect(test.body.statements[0]).to.be.instanceOf(Assert);
    
    const assert = test.body.statements[0] as Assert;
    expect(assert.negated).to.be.instanceOf(BooleanPrimitive);
    expect((assert.negated as BooleanPrimitive).value).to.be.false;
    expect(assert.body).to.be.instanceOf(Equality);
    
    const equality = assert.body as Equality;
    expect(equality.expected).to.be.instanceOf(NumberPrimitive);
    expect((equality.expected as NumberPrimitive).value).to.equal(2);
  });

  it("should parse shouldNotBe", () => {
    const code = `it "negation" do 1 shouldNotBe 2`;
    const ast = parser.parse(code);
    const test = ast[0] as Test;
    const assert = test.body.statements[0] as Assert;
    expect((assert.negated as BooleanPrimitive).value).to.be.true;
    expect(assert.body).to.be.instanceOf(Equality);
  });

  it("should parse shouldSatisfy", () => {
    const code = `it "satisfy" do 5 shouldSatisfy odd`;
    const ast = parser.parse(code);
    const test = ast[0] as Test;
    const assert = test.body.statements[0] as Assert;
    expect(assert.body).to.be.instanceOf(Truth);
    
    const truth = assert.body as Truth;
    expect(truth.body).to.be.instanceOf(Application);
    const app = truth.body as Application;
    expect(app.functionExpr).to.be.instanceOf(SymbolPrimitive);
    expect((app.functionExpr as SymbolPrimitive).value).to.equal("odd");
    expect(app.parameter).to.be.instanceOf(NumberPrimitive);
    expect((app.parameter as NumberPrimitive).value).to.equal(5);
  });

  it("should parse shouldThrow", () => {
    const code = `it "throws" do error "fail" shouldThrow anyException`;
    const ast = parser.parse(code);
    const test = ast[0] as Test;
    const assert = test.body.statements[0] as Assert;
    expect(assert.body).to.be.instanceOf(Failure);
    
    const failure = assert.body as Failure;
    expect(failure.func).to.be.instanceOf(Raise);
    expect(failure.message).to.be.instanceOf(SymbolPrimitive);
    expect((failure.message as SymbolPrimitive).value).to.equal("anyException");
  });
});
