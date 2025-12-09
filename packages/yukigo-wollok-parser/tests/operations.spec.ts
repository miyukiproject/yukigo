import { expect } from "chai";
import * as Yu from "yukigo-ast";
import { WollokToYukigoTransformer } from "../src/transformer";
import {
  Send,
  Reference,
  Literal,
  Package,
  Method,
  Body,
  Parameter,
  Return,
  Singleton,
} from "wollok-ts";

describe("WollokToYukigoTransformer - Native Operations", () => {
  let transformer: WollokToYukigoTransformer;

  beforeEach(() => {
    transformer = new WollokToYukigoTransformer();
  });

  const transformExpression = (node: any) => {
    const pkg = new Package({
      name: "test",
      members: [
        new Singleton({
          members: [
            new Method({
              name: "t",
              parameters: [],
              body: new Body({ sentences: [new Return({ value: node })] }),
            }),
          ],
        }),
      ],
    });
    const res = transformer.transform(pkg) as Yu.AST;
    const obj = res[0] as Yu.Object;
    const seq = obj.expression as Yu.Sequence;
    const method = seq.statements[0] as Yu.Method;
    const body = method.equations[0].body as Yu.UnguardedBody;
    const returnExpr = body.sequence.statements[0] as Yu.Return;
    return returnExpr.body;
  };

  const ref = (n) => new Reference({ name: n });
  const lit = (v) => new Literal({ value: v });
  const send = (rec, msg, args = []) =>
    new Send({ receiver: rec, message: msg, args });

  describe("Arithmetic Operations", () => {
    it("should transform '+' to ArithmeticPlus", () => {
      const input = send(ref("a"), "+", [lit(1)]);
      const result = transformExpression(input) as Yu.ArithmeticBinaryOperation;

      expect(result).to.be.instanceOf(Yu.ArithmeticBinaryOperation);
      expect(result.operator).to.equal("Plus");
      expect((result.left as Yu.SymbolPrimitive).value).to.equal("a");
    });

    it("should transform '/' to ArithmeticDivide", () => {
      const input = send(lit(10), "/", [lit(2)]);
      const result = transformExpression(input) as Yu.ArithmeticBinaryOperation;

      expect(result).to.be.instanceOf(Yu.ArithmeticBinaryOperation);
      expect(result.operator).to.equal("Divide");
    });

    it("should transform '**' to ArithmeticPower", () => {
      const input = send(ref("x"), "**", [lit(2)]);
      const result = transformExpression(input) as Yu.ArithmeticBinaryOperation;

      expect(result).to.be.instanceOf(Yu.ArithmeticBinaryOperation);
      expect(result.operator).to.equal("Power");
    });

    it("should transform unary '-' (invert) to Arithmetic Negation", () => {
      const input = send(ref("x"), "invert", []); // Assuming 'invert' or '-' for unary
      const result = transformExpression(input) as Yu.ArithmeticUnaryOperation;

      expect(result).to.be.instanceOf(Yu.ArithmeticUnaryOperation);
      expect(result.operator).to.equal("Negation");
      expect((result.operand as Yu.SymbolPrimitive).value).to.equal("x");
    });
  });

  describe("Comparison Operations", () => {
    it("should transform '==' to ComparisonEqual", () => {
      const input = send(ref("a"), "==", [ref("b")]);
      const result = transformExpression(input) as Yu.ComparisonOperation;

      expect(result).to.be.instanceOf(Yu.ComparisonOperation);
      expect(result.operator).to.equal("Equal");
    });

    it("should transform '>=' to GreaterOrEqualThan", () => {
      const input = send(ref("age"), ">=", [lit(18)]);
      const result = transformExpression(input) as Yu.ComparisonOperation;

      expect(result).to.be.instanceOf(Yu.ComparisonOperation);
      expect(result.operator).to.equal("GreaterOrEqualThan");
    });
  });

  describe("Logical Operations", () => {
    it("should transform '&&' to LogicalAnd", () => {
      const input = send(ref("valid"), "&&", [ref("ready")]);
      const result = transformExpression(input) as Yu.LogicalBinaryOperation;

      expect(result).to.be.instanceOf(Yu.LogicalBinaryOperation);
      expect(result.operator).to.equal("And");
    });

    it("should transform 'or' keyword to LogicalOr", () => {
      const input = send(ref("x"), "or", [ref("y")]);
      const result = transformExpression(input) as Yu.LogicalBinaryOperation;

      expect(result).to.be.instanceOf(Yu.LogicalBinaryOperation);
      expect(result.operator).to.equal("Or");
    });

    it("should transform unary 'negate' to LogicalNegation", () => {
      const input = send(ref("found"), "negate", []);
      const result = transformExpression(input) as Yu.LogicalUnaryOperation;

      expect(result).to.be.instanceOf(Yu.LogicalUnaryOperation);
      expect(result.operator).to.equal("Negation");
    });
  });

  describe("Bitwise Operations", () => {
    it("should transform '|' to BitwiseOr", () => {
      const input = send(lit(1), "|", [lit(2)]);
      const result = transformExpression(input) as Yu.BitwiseBinaryOperation;

      expect(result).to.be.instanceOf(Yu.BitwiseBinaryOperation);
      expect(result.operator).to.equal("BitwiseOr");
    });
  });

  describe("Fallback", () => {
    it("should treat unknown operators as standard Send", () => {
      // 'customOp' is not in our maps
      const input = send(ref("a"), "customOp", [ref("b")]);
      const result = transformExpression(input) as Yu.Send;

      expect(result).to.be.instanceOf(Yu.Send);
      expect((result.selector as Yu.SymbolPrimitive).value).to.equal(
        "customOp"
      );
    });
  });
});
