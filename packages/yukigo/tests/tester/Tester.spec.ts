import { expect } from "chai";
import {
  Assert,
  BooleanPrimitive,
  Equality,
  NumberPrimitive,
  Sequence,
  Test,
  TestGroup,
  StringPrimitive,
  Variable,
  SymbolPrimitive,
  ArithmeticBinaryOperation
} from "yukigo-ast";
import { Tester } from "../../src/tester/index.js";

describe("Tester class", () => {
  it("should run a simple passing test", () => {
    const passingTest = new Test(
      new StringPrimitive("Success"),
      new Sequence([
        new Assert(
          new BooleanPrimitive(false),
          new Equality(new NumberPrimitive(1), new NumberPrimitive(1))
        )
      ])
    );

    const tester = new Tester([passingTest]);
    const results = tester.test([passingTest]);

    expect(results).to.have.lengthOf(1);
    expect(results[0].name).to.equal("Success");
    expect(results[0].status).to.equal("passed");
  });

  it("should report a failing test with a message", () => {
    const failingTest = new Test(
      new StringPrimitive("Failure"),
      new Sequence([
        new Assert(
          new BooleanPrimitive(false),
          new Equality(new NumberPrimitive(1), new NumberPrimitive(2))
        )
      ])
    );

    const tester = new Tester([failingTest]);
    const results = tester.test([failingTest]);

    expect(results).to.have.lengthOf(1);
    expect(results[0].status).to.equal("failed");
    expect(results[0].message).to.contain("Expected 1, but got 2");
  });

  it("should run tests inside a TestGroup independently", () => {
    const passingTest = new Test(
      new StringPrimitive("Pass"),
      new Sequence([
        new Assert(
          new BooleanPrimitive(false),
          new Equality(new NumberPrimitive(10), new NumberPrimitive(10))
        )
      ])
    );

    const failingTest = new Test(
      new StringPrimitive("Fail"),
      new Sequence([
        new Assert(
          new BooleanPrimitive(false),
          new Equality(new NumberPrimitive(1), new NumberPrimitive(0))
        )
      ])
    );

    const group = new TestGroup(
      new StringPrimitive("My Group"),
      new Sequence([passingTest, failingTest])
    );

    const tester = new Tester([group]);
    const results = tester.test([group]);

    expect(results).to.have.lengthOf(1);
    const groupReport = results[0];
    expect(groupReport.name).to.equal("My Group");
    expect(groupReport.status).to.equal("failed");
    expect(groupReport.children).to.have.lengthOf(2);
    expect(groupReport.children![0].status).to.equal("passed");
    expect(groupReport.children![1].status).to.equal("failed");
  });

  it("should handle setup code inside a TestGroup", () => {
    // var x = 5
    const setup = new Variable(new SymbolPrimitive("x"), new NumberPrimitive(5));
    
    // test "Check X" { assert x == 5 }
    const checkX = new Test(
      new StringPrimitive("Check X"),
      new Sequence([
        new Assert(
          new BooleanPrimitive(false),
          new Equality(new SymbolPrimitive("x"), new NumberPrimitive(5))
        )
      ])
    );

    const group = new TestGroup(
      new StringPrimitive("Setup Group"),
      new Sequence([setup, checkX])
    );

    const tester = new Tester([group]);
    const results = tester.test([group]);

    expect(results[0].children).to.have.lengthOf(1);
    expect(results[0].children![0].status).to.equal("passed");
  });

  it("should report errors that are not FailedAssert", () => {
    // test "Error" { 1 + "a" }
    const errorTest = new Test(
      new StringPrimitive("Error"),
      new Sequence([
        new ArithmeticBinaryOperation(
          "Plus",
          new NumberPrimitive(1),
          new StringPrimitive("a")
        )
      ])
    );

    const tester = new Tester([errorTest]);
    const results = tester.test([errorTest]);

    expect(results[0].status).to.equal("error");
    expect(results[0].message).to.contain("Type mismatch");
  });
});
