import { describe, it } from "mocha";
import { expect } from "chai";
import {
  Assert,
  BooleanPrimitive,
  Equality,
  NumberPrimitive,
  Sequence,
  Test,
  TestGroup,
  Failure,
  Raise,
  StringPrimitive,
  Truth
} from "yukigo-ast";
import { Interpreter } from "../../src/index.js";
import { FailedAssert } from "../../src/interpreter/components/TestRunner.js";

describe("Testing Nodes", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter([]);
  });

  describe("Assertions", () => {
    it("should pass a valid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false), // negated = false
        new Equality(new NumberPrimitive(1), new NumberPrimitive(1))
      );
      // Should not throw
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should fail an invalid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Equality(new NumberPrimitive(1), new NumberPrimitive(2))
      );
      expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(FailedAssert);
    });

    it("should pass a negated invalid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(true), // negated = true
        new Equality(new NumberPrimitive(1), new NumberPrimitive(2))
      );
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should pass a Truth assertion", () => {
        const assertion = new Assert(
            new BooleanPrimitive(false),
            new Truth(new BooleanPrimitive(true))
        );
        interpreter.evaluate(new Sequence([assertion]));
    });

     it("should fail a Truth assertion with false", () => {
        const assertion = new Assert(
            new BooleanPrimitive(false),
            new Truth(new BooleanPrimitive(false))
        );
        expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(FailedAssert);
    });

    it("should pass a Failure assertion when code raises error", () => {
      const funcThatRaises = new Raise(new StringPrimitive("Boom"));
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Failure(funcThatRaises, new StringPrimitive("[Raise] Boom"))
      );
      interpreter.evaluate(new Sequence([assertion]));
    });
    
    it("should fail a Failure assertion when code does NOT raise error", () => {
       const funcThatReturns = new NumberPrimitive(1);
       const assertion = new Assert(
        new BooleanPrimitive(false),
        new Failure(funcThatReturns, new StringPrimitive("[Raise] Boom"))
       );
       expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(FailedAssert);
    });
  });

  describe("Tests and Groups", () => {
     it("should execute a Test node containing assertions", () => {
        const assertion = new Assert(
            new BooleanPrimitive(false),
            new Equality(new NumberPrimitive(5), new NumberPrimitive(5))
        );
        const testNode = new Test(new StringPrimitive("My Test"), new Sequence([assertion]));
        interpreter.evaluate(testNode);
     });

     it("should execute a TestGroup node", () => {
         const assertion = new Assert(
            new BooleanPrimitive(false),
            new Equality(new NumberPrimitive(10), new NumberPrimitive(10))
        );
        const testNode = new Test(new StringPrimitive("Sub Test"), new Sequence([assertion]));
        const groupNode = new TestGroup(new StringPrimitive("My Group"), new Sequence([testNode]));
        interpreter.evaluate(groupNode);
     });
  });
});