import {
  Application,
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
  BooleanPrimitive,
  ComparisonOperation,
  CompositionExpression,
  Equation,
  Fact,
  Function,
  isLazyList,
  Lambda,
  ListPrimitive,
  ListUnaryOperation,
  LiteralPattern,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  NumberPrimitive,
  RangeExpression,
  Return,
  Sequence,
  StringOperation,
  StringPrimitive,
  SymbolPrimitive,
  UnguardedBody,
  VariablePattern,
} from "@yukigo/ast";
import { Interpreter } from "../src/interpreter/index.js";
import { assert } from "chai";

describe("Interpreter Spec", () => {
  let interpreter: Interpreter;
  beforeEach(() => {
    interpreter = new Interpreter([], { debug: true });
  });
  it("Evaluates ArithmeticBinaryOperation", () => {
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Plus",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      7
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Minus",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      -1
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Multiply",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      12
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Divide",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      0.75
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Modulo",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Power",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      81
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Min",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticBinaryOperation(
          "Max",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        )
      ),
      4
    );
  });

  it("Evaluates ArithmeticUnaryOperation", () => {
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Round", new NumberPrimitive(3.4))
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Round", new NumberPrimitive(3.5))
      ),
      4
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Absolute", new NumberPrimitive(-3))
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Absolute", new NumberPrimitive(3))
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Ceil", new NumberPrimitive(3.3))
      ),
      4
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Floor", new NumberPrimitive(3.3))
      ),
      3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Negation", new NumberPrimitive(3.3))
      ),
      -3.3
    );
    assert.equal(
      interpreter.evaluate(
        new ArithmeticUnaryOperation("Sqrt", new NumberPrimitive(25))
      ),
      5
    );
  });
  describe("Evaluates ComparisonOperation", () => {
    it("Equal Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Equal",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Equal",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Equal",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Equal",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        false
      );
    });
    it("NotEqual Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotEqual",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotEqual",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotEqual",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotEqual",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        true
      );
    });
    it("Same Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Same",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Same",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Same",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "Same",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        false
      );
    });
    it("NotSame Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotSame",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotSame",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotSame",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "NotSame",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        true
      );
    });
    it("GreaterOrEqualThan Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterOrEqualThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterOrEqualThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterOrEqualThan",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterOrEqualThan",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        false
      );
    });
    it("GreaterThan Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterThan",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "GreaterThan",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        false
      );
    });
    it("LessOrEqualThan Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessOrEqualThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessOrEqualThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessOrEqualThan",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessOrEqualThan",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        true
      );
    });
    it("LessThan Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(3.4)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessThan",
            new NumberPrimitive(3.4),
            new NumberPrimitive(4)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessThan",
            new NumberPrimitive(3),
            new StringPrimitive("3")
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new ComparisonOperation(
            "LessThan",
            new NumberPrimitive(3),
            new StringPrimitive("4")
          )
        ),
        true
      );
    });
  });
  describe("Evaluates LogicalBinaryOperation", () => {
    it("And Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "And",
            new BooleanPrimitive(true),
            new BooleanPrimitive(true)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "And",
            new BooleanPrimitive(true),
            new BooleanPrimitive(false)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "And",
            new BooleanPrimitive(false),
            new BooleanPrimitive(true)
          )
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "And",
            new BooleanPrimitive(false),
            new BooleanPrimitive(false)
          )
        ),
        false
      );
    });
    it("Or Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "Or",
            new BooleanPrimitive(true),
            new BooleanPrimitive(true)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "Or",
            new BooleanPrimitive(true),
            new BooleanPrimitive(false)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "Or",
            new BooleanPrimitive(false),
            new BooleanPrimitive(true)
          )
        ),
        true
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalBinaryOperation(
            "Or",
            new BooleanPrimitive(false),
            new BooleanPrimitive(false)
          )
        ),
        false
      );
    });
  });
  describe("Evaluates LogicalUnaryOperation", () => {
    it("Negation Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new LogicalUnaryOperation("Negation", new BooleanPrimitive(true))
        ),
        false
      );
      assert.equal(
        interpreter.evaluate(
          new LogicalUnaryOperation("Negation", new BooleanPrimitive(false))
        ),
        true
      );
    });
  });
  describe("Evaluates StringOperation", () => {
    it("Concat Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new StringOperation(
            "Concat",
            new StringPrimitive("Hello"),
            new StringPrimitive(" world!")
          )
        ),
        "Hello world!"
      );
    });
  });
  describe("Evaluates ListUnaryOperation", () => {
    it("Size Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ListUnaryOperation(
            "Size",
            new ListPrimitive([
              new StringPrimitive("Hello"),
              new StringPrimitive("world!"),
            ])
          )
        ),
        2
      );
    });
    it("DetectMax Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ListUnaryOperation(
            "DetectMax",
            new ListPrimitive([new NumberPrimitive(2), new NumberPrimitive(4)])
          )
        ),
        4
      );
    });
    it("DetectMin Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new ListUnaryOperation(
            "DetectMin",
            new ListPrimitive([new NumberPrimitive(2), new NumberPrimitive(4)])
          )
        ),
        2
      );
    });
    it("Flatten Operator", () => {
      assert.deepEqual(
        interpreter.evaluate(
          new ListUnaryOperation(
            "Flatten",
            new ListPrimitive([
              new ListPrimitive([new NumberPrimitive(2)]),
              new ListPrimitive([
                new NumberPrimitive(3),
                new NumberPrimitive(8),
              ]),
            ])
          )
        ),
        [2, 3, 8]
      );
    });
  });
  describe("Evaluates BitwiseBinaryOperation", () => {
    it("BitwiseOr Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseOr",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        5
      );
    });
    it("BitwiseAnd Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseAnd",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        1
      );
    });
    it("BitwiseLeftShift Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseLeftShift",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        10
      );
    });
    it("BitwiseRightShift Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseRightShift",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        2
      );
    });
    it("BitwiseUnsignedRightShift Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseUnsignedRightShift",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        2
      );
    });
    it("BitwiseXor Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseBinaryOperation(
            "BitwiseXor",
            new NumberPrimitive(5),
            new NumberPrimitive(1)
          )
        ),
        4
      );
    });
  });
  describe("Evaluates BitwiseUnaryOperator", () => {
    it("BitwiseNot Operator", () => {
      assert.equal(
        interpreter.evaluate(
          new BitwiseUnaryOperation("BitwiseNot", new NumberPrimitive(5))
        ),
        -6
      );
    });
  });
  describe("Evaluates Application", () => {
    beforeEach(() => {
      interpreter = new Interpreter([
        new Function(new SymbolPrimitive("f"), [
          new Equation(
            [new LiteralPattern(new NumberPrimitive(3))],
            new UnguardedBody(
              new Sequence([new Return(new NumberPrimitive(6))])
            ),
            new Return(new NumberPrimitive(6))
          ),
          new Equation(
            [new VariablePattern(new SymbolPrimitive("y"))],
            new UnguardedBody(
              new Sequence([
                new Return(
                  new ArithmeticBinaryOperation(
                    "Plus",
                    new SymbolPrimitive("y"),
                    new NumberPrimitive(3)
                  )
                ),
              ])
            ),
            new Return(
              new ArithmeticBinaryOperation(
                "Plus",
                new SymbolPrimitive("y"),
                new NumberPrimitive(3)
              )
            )
          ),
        ]),
      ]);
    });
    it("Lambda + currified Application", () => {
      const lambda = new Lambda(
        [
          new VariablePattern(new SymbolPrimitive("x")),
          new VariablePattern(new SymbolPrimitive("y")),
          new VariablePattern(new SymbolPrimitive("z")),
        ],
        new ArithmeticBinaryOperation(
          "Plus",
          new ArithmeticBinaryOperation(
            "Plus",
            new SymbolPrimitive("x"),
            new SymbolPrimitive("y")
          ),
          new SymbolPrimitive("z")
        )
      );
      const app1 = new Application(lambda, new NumberPrimitive(1));
      const app2 = new Application(app1, new NumberPrimitive(2));
      const app3 = new Application(app2, new NumberPrimitive(3));
      assert.equal(interpreter.evaluate(app3), 6);
    });
    it("Application of Function", () => {
      const app1 = new Application(
        new SymbolPrimitive("f"),
        new NumberPrimitive(3)
      );
      assert.equal(interpreter.evaluate(app1), 6);
    });
  });
  describe("Evaluates Composition", () => {
    beforeEach(() => {
      interpreter = new Interpreter(
        [
          new Function(new SymbolPrimitive("doble"), [
            new Equation(
              [new VariablePattern(new SymbolPrimitive("x"))],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("x"),
                      new NumberPrimitive(2)
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("x"),
                  new NumberPrimitive(2)
                )
              )
            ),
          ]),
          new Function(new SymbolPrimitive("cuadrado"), [
            new Equation(
              [new VariablePattern(new SymbolPrimitive("x"))],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Power",
                      new SymbolPrimitive("x"),
                      new NumberPrimitive(2)
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Power",
                  new SymbolPrimitive("x"),
                  new NumberPrimitive(2)
                )
              )
            ),
          ]),
        ],
        { debug: true }
      );
    });
    it("Composition (cuadrado . doble) 2 should be 16", () => {
      const fog = new CompositionExpression(
        new SymbolPrimitive("cuadrado"),
        new SymbolPrimitive("doble")
      );
      const app = new Application(fog, new NumberPrimitive(2));
      assert.equal(interpreter.evaluate(app), 16);
    });
  });
  describe("Evaluates Range Expression", () => {
    it("Evaluates [1..5] to full range", () => {
      const range = new RangeExpression(
        new NumberPrimitive(1),
        new NumberPrimitive(5)
      );
      assert.deepEqual(interpreter.evaluate(range), [1, 2, 3, 4, 5]);
    });
    it("Evaluates [0,0.5..2] to full range", () => {
      const range = new RangeExpression(
        new NumberPrimitive(0),
        new NumberPrimitive(2),
        new NumberPrimitive(0.5)
      );
      assert.deepEqual(interpreter.evaluate(range), [0, 0.5, 1, 1.5, 2]);
    });
    it("Evaluates [1..] lazily", () => {
      interpreter = new Interpreter([], { lazyLoading: true });
      const range = new RangeExpression(new NumberPrimitive(1));
      const evaluatedList = interpreter.evaluate(range);
      if (!isLazyList(evaluatedList))
        assert.fail("Evaluated list should be LazyList");
      const iter = evaluatedList.generator();
      assert.equal(iter.next().value, 1);
      assert.equal(iter.next().value, 2);
    });
  });
  describe("Mini test", () => {
    it("Prints env", () => {
      interpreter = new Interpreter([
        new Fact(new SymbolPrimitive("parent"), [
          new LiteralPattern(new SymbolPrimitive("tom")),
        ]),
      ]);
    });
  });
});
