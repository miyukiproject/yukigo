import {
  ArithmeticBinaryOperation,
  ComparisonOperation,
  ListComprehension,
  Generator as YuGenerator,
  ListPrimitive,
  NumberPrimitive,
  RangeExpression,
  StringPrimitive,
  SymbolPrimitive,
  TupleExpression,
} from "yukigo-ast";
import { Interpreter } from "../../src/interpreter/index.js";
import { assert } from "chai";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import {
  YuValue,
  isLazyList,
  LazyStepResult,
  YuSequence,
  LazyList,
} from "../../src/interpreter/primitives/index.js";
import { InterpreterVisitor } from "../../src/interpreter/components/evaluators/index.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "../../src/interpreter/components/kernel/commands.js";
import { YuArray } from "../../src/interpreter/primitives/sequences/YuArray.js";

describe("ListComprehension Spec", () => {
  describe("Falla 1: Truncamiento (evaluates all generator elements)", () => {
    it("evaluates [x * 2 | x <- [1..5]] to all 5 elements in eager mode", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(5)),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [2, 4, 6, 8, 10]);
    });

    it("evaluates [x * 2 | x <- [1..5]] in lazy mode and realizes all elements", () => {
      const interpreter = new Interpreter([], { lazyLoading: true });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(5)),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.isTrue(isLazyList(res), "Expected LazyList when lazyLoading: true");

      const kernel = new YukigoKernel(
        new InterpreterVisitor(interpreter.getContext()),
      );
      const realized = kernel.run(
        interpreter.getContext().lazyRuntime.realizeList(res),
      );
      assert.deepEqual((realized as YuValue).toJSON(), [2, 4, 6, 8, 10]);
    });
  });

  describe("Falla 2: Aborto prematuro (filters skip non-matching elements without aborting)", () => {
    it("evaluates [x * 2 | x <- [1..5], x > 2] skipping x=1 and x=2", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(5)),
          ),
          new ComparisonOperation(
            "GreaterThan",
            new SymbolPrimitive("x"),
            new NumberPrimitive(2),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [6, 8, 10]);
    });

    it("returns empty array if no element matches condition", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new SymbolPrimitive("x"),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(5)),
          ),
          new ComparisonOperation(
            "GreaterThan",
            new SymbolPrimitive("x"),
            new NumberPrimitive(10),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), []);
    });

    it("evaluates multiple filters in sequence", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new SymbolPrimitive("x"),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(10)),
          ),
          new ComparisonOperation(
            "GreaterThan",
            new SymbolPrimitive("x"),
            new NumberPrimitive(3),
          ),
          new ComparisonOperation(
            "LessThan",
            new SymbolPrimitive("x"),
            new NumberPrimitive(7),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [4, 5, 6]);
    });
  });

  describe("Falla 3: Fallo en producto cartesiano (multiple generators advance correctly)", () => {
    it("evaluates Cartesian product [(x, y) | x <- [1..2], y <- [3..4]]", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new TupleExpression([
          new SymbolPrimitive("x"),
          new SymbolPrimitive("y"),
        ]),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(2)),
          ),
          new YuGenerator(
            new SymbolPrimitive("y"),
            new RangeExpression(new NumberPrimitive(3), new NumberPrimitive(4)),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
      ]);
    });

    it("evaluates dependent generators [(x, y) | x <- [1..3], y <- [1..x]]", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new TupleExpression([
          new SymbolPrimitive("x"),
          new SymbolPrimitive("y"),
        ]),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(3)),
          ),
          new YuGenerator(
            new SymbolPrimitive("y"),
            new RangeExpression(new NumberPrimitive(1), new SymbolPrimitive("x")),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [
        [1, 1],
        [2, 1],
        [2, 2],
        [3, 1],
        [3, 2],
        [3, 3],
      ]);
    });
  });

  describe("Falla 4: Cuelgue con secuencias infinitas (lazy evaluation without premature realizeList)", () => {
    it("evaluates [x * 2 | x <- [1..]] lazily without hanging", () => {
      const interpreter = new Interpreter([], { lazyLoading: true });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1)),
          ),
        ],
      );
      const stream = interpreter.evaluate(comp);
      assert.isTrue(isLazyList(stream), "Should produce LazyList");

      const kernel = new YukigoKernel(
        new InterpreterVisitor(interpreter.getContext()),
      );

      // Simulate `take 3` by stepping 3 times
      const step1 = kernel.run((stream as LazyList).step()) as LazyStepResult;
      assert.equal((step1.head as YuValue).toJSON(), 2);

      const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
      assert.equal((step2.head as YuValue).toJSON(), 4);

      const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
      assert.equal((step3.head as YuValue).toJSON(), 6);
    });

    it("evaluates infinite sequence with condition lazily: take 3 [x | x <- [1..], x > 5]", () => {
      const interpreter = new Interpreter([], { lazyLoading: true });
      const comp = new ListComprehension(
        new SymbolPrimitive("x"),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1)),
          ),
          new ComparisonOperation(
            "GreaterThan",
            new SymbolPrimitive("x"),
            new NumberPrimitive(5),
          ),
        ],
      );
      const stream = interpreter.evaluate(comp);
      assert.isTrue(isLazyList(stream));

      const kernel = new YukigoKernel(
        new InterpreterVisitor(interpreter.getContext()),
      );

      const step1 = kernel.run((stream as LazyList).step()) as LazyStepResult;
      assert.equal((step1.head as YuValue).toJSON(), 6);

      const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
      assert.equal((step2.head as YuValue).toJSON(), 7);

      const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
      assert.equal((step3.head as YuValue).toJSON(), 8);
    });

    it("returns LazyList even in eager mode when generator has no end", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new RangeExpression(new NumberPrimitive(1)),
          ),
        ],
      );
      const stream = interpreter.evaluate(comp);
      assert.isTrue(isLazyList(stream));
    });
  });

  describe("Edge cases", () => {
    it("handles comprehension with empty generator [x * 2 | x <- []]", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new ArithmeticBinaryOperation(
          "Multiply",
          new SymbolPrimitive("x"),
          new NumberPrimitive(2),
        ),
        [
          new YuGenerator(
            new SymbolPrimitive("x"),
            new ListPrimitive([]),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), []);
    });

    it("handles comprehension without generators [42 | ]", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(new NumberPrimitive(42), []);
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), [42]);
    });

    it("handles String as a sequence generator [c | c <- \"hi\"]", () => {
      const interpreter = new Interpreter([], { lazyLoading: false });
      const comp = new ListComprehension(
        new SymbolPrimitive("c"),
        [
          new YuGenerator(
            new SymbolPrimitive("c"),
            new StringPrimitive("hi"),
          ),
        ],
      );
      const res = interpreter.evaluate(comp);
      assert.deepEqual((res as YuValue).toJSON(), ["h", "i"]);
    });
  });
});
