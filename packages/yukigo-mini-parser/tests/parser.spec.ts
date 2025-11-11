import { assert } from "chai";
import {
  ArithmeticBinaryOperation,
  Assignment,
  ComparisonOperation,
  Equation,
  If,
  ListPrimitive,
  ListType,
  NilPrimitive,
  NumberPrimitive,
  ParameterizedType,
  Procedure,
  Return,
  Sequence,
  SimpleType,
  SymbolPrimitive,
  TypeSignature,
  UnguardedBody,
  Variable,
  VariablePattern,
  While,
  YukigoParser,
} from "@yukigo/ast";
import { YukigoMiniParser } from "../src/index.js";

describe("Parser Tests", () => {
  let parser: YukigoParser;
  beforeEach(() => {
    parser = new YukigoMiniParser();
  });

  it("should parse assignment", () => {
    const code = `int n; int result;`;
    assert.deepEqual(parser.parse(code), [
      new Variable(
        new SymbolPrimitive("n"),
        new NilPrimitive(null),
        new SimpleType("int", [])
      ),
      new Variable(
        new SymbolPrimitive("result"),
        new NilPrimitive(null),
        new SimpleType("int", [])
      ),
    ]);
  });
  it("should parse function declaration", () => {
    const code = `int add(int x, int y) {
  int result := x + y;
  return result;
};`;
    assert.deepEqual(parser.parse(code), [
      new TypeSignature(
        new SymbolPrimitive("add"),
        new ParameterizedType(
          [new SimpleType("int", []), new SimpleType("int", [])],
          new SimpleType("int", []),
          []
        )
      ),
      new Procedure(new SymbolPrimitive("add"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("x")),
            new VariablePattern(new SymbolPrimitive("y")),
          ],
          new UnguardedBody(
            new Sequence([
              new Variable(
                new SymbolPrimitive("result"),
                new ArithmeticBinaryOperation(
                  "Plus",
                  new SymbolPrimitive("x"),
                  new SymbolPrimitive("y")
                ),
                new SimpleType("int", [])
              ),
              new Return(new SymbolPrimitive("result")),
            ])
          )
        ),
      ]),
    ]);
  });
  it("should parse list primitive", () => {
    const code = `int[] numberList := [1, 2, 3 + 4];`;
    assert.deepEqual(parser.parse(code), [
      new Variable(
        new SymbolPrimitive("numberList"),
        new ListPrimitive([
          new NumberPrimitive(1),
          new NumberPrimitive(2),
          new ArithmeticBinaryOperation(
            "Plus",
            new NumberPrimitive(3),
            new NumberPrimitive(4)
          ),
        ]),
        new ListType(new SimpleType("int", []), [])
      ),
    ]);
  });
  it("should parse if statement", () => {
    const code = `if(a != b) { c := a + b; } else { c := a * 2; };`;
    assert.deepEqual(parser.parse(code), [
      new If(
        new ComparisonOperation(
          "NotEqual",
          new SymbolPrimitive("a"),
          new SymbolPrimitive("b")
        ),
        new Sequence([
          new Assignment(
            new SymbolPrimitive("c"),
            new ArithmeticBinaryOperation(
              "Plus",
              new SymbolPrimitive("a"),
              new SymbolPrimitive("b")
            )
          ),
        ]),
        new Sequence([
          new Assignment(
            new SymbolPrimitive("c"),
            new ArithmeticBinaryOperation(
              "Multiply",
              new SymbolPrimitive("a"),
              new NumberPrimitive(2)
            )
          ),
        ]),
      ),
    ]);
  });
  it("should parse while loop statement", () => {
    const code = `while(a < 10) { a := a + 1; };`;
    assert.deepEqual(parser.parse(code), [
      new While(
        new ComparisonOperation(
          "LessThan",
          new SymbolPrimitive("a"),
          new NumberPrimitive(10)
        ),
        new Sequence([
          new Assignment(
            new SymbolPrimitive("a"),
            new ArithmeticBinaryOperation(
              "Plus",
              new SymbolPrimitive("a"),
              new NumberPrimitive(1)
            )
          ),
        ]),
      ),
    ]);
  });
});
