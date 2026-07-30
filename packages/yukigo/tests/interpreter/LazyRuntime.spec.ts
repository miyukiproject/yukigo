import { expect } from "chai";
import { LazyRuntime } from "../../src/interpreter/components/runtimes/LazyRuntime.js";
import {
  RangeExpression,
  ConsExpression,
  NumberPrimitive,
  ListPrimitive,
  Expression,
} from "yukigo-ast";
import { createStream } from "../../src/interpreter/utils.js";
import { fail } from "assert";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { StepCommand } from "../../src/interpreter/components/kernel/commands.js";
import { YuValue } from "../../src/interpreter/primitives/YuValue.js";
import { YuArray, YuNumber, LazyList, LazyStepResult, isLazyList } from "../../src/interpreter/primitives/index.js";
import { Evaluator } from "../../src/interpreter/components/evaluators/BaseEvaluator.js";
import { InterpreterVisitor } from "../../src/interpreter/components/evaluators/index.js";

const num = (value: number) => new NumberPrimitive(value);

const range = (start: number, end?: number, step?: number): RangeExpression =>
  new RangeExpression(
    num(start),
    end ? num(end) : undefined,
    step ? num(step) : undefined,
  );

const list = (elements: Expression[]) => new ListPrimitive(elements);

const cons = (headVal: Expression, tailVal: Expression): ConsExpression =>
  new ConsExpression(headVal, tailVal);

const lazyContext = new RuntimeContext({ lazyLoading: true });
const eagerContext = new RuntimeContext({ lazyLoading: false });
describe("LazyRuntime", () => {
  let evaluator: Evaluator;
  let lazyRuntime: LazyRuntime;
  let kernel: YukigoKernel;

  describe("realizeList", () => {
    beforeEach(() => {
      evaluator = new InterpreterVisitor(lazyContext);
      lazyRuntime = new LazyRuntime(eagerContext);
      kernel = new YukigoKernel(evaluator);
    });
    it("should return the array as-is if input is already an array", () => {
      const input = new YuArray([
        new YuNumber(1),
        new YuNumber(2),
        new YuNumber(3),
      ]);
      const result = kernel.run(lazyRuntime.realizeList(input));
      expect((result as YuValue).toJSON()).to.deep.equal([1, 2, 3]);
    });

    it("should consume a LazyList into an array", () => {
      const lazyList: LazyList = createStream(() => {
        return new StepCommand(
          new LazyStepResult(
            new YuNumber(10),
            createStream(
              () =>
                new StepCommand(new LazyStepResult(new YuNumber(20), null)),
            ),
          ),
        );
      });

      const result = kernel.run(lazyRuntime.realizeList(lazyList));
      expect((result as YuValue).toJSON()).to.deep.equal([10, 20]);
    });

    it("should throw if value is not a list or lazy list", () => {
      expect(() =>
        kernel.run(lazyRuntime.realizeList(new YuNumber(123))),
      ).to.throw(/Expected Sequence/);
    });
  });

  describe("evaluateRange", () => {
    describe("Finite Ranges", () => {
      beforeEach(() => {
        evaluator = new InterpreterVisitor(eagerContext);
        lazyRuntime = new LazyRuntime(eagerContext);
        kernel = new YukigoKernel(evaluator);
      });
      it("should create a simple range [1..5]", () => {
        const node = range(1, 5);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));
        expect((result as YuValue).toJSON()).to.deep.equal([1, 2, 3, 4, 5]);
      });

      it("should handle custom steps [0, 2 .. 10]", () => {
        const node = range(0, 10, 2);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));
        expect((result as YuValue).toJSON()).to.deep.equal([0, 2, 4, 6, 8, 10]);
      });

      it("should handle negative steps [5, 4 .. 1]", () => {
        const node = range(5, 1, 4);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));
        expect((result as YuValue).toJSON()).to.deep.equal([5, 4, 3, 2, 1]);
      });

      it("should throw if step is zero", () => {
        const node = range(5, 10, 5);
        expect(() =>
          kernel.run(lazyRuntime.evaluateRange(node, evaluator)),
        ).to.throw(/Range step cannot be zero/);
      });
    });

    describe("Infinite Ranges", () => {
      beforeEach(() => {
        evaluator = new InterpreterVisitor(lazyContext);
        lazyRuntime = new LazyRuntime(lazyContext);
        kernel = new YukigoKernel(evaluator);
      });
      it("should return a LazyList object", () => {
        const node = range(1);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));

        expect(isLazyList(result)).to.be.true;
        expect(result).to.be.instanceOf(LazyList);
      });

      it("should generate values on demand [1..]", () => {
        const node = range(1);
        const result = kernel.run(
          lazyRuntime.evaluateRange(node, evaluator),
        ) as LazyList;

        const step1 = kernel.run(result.step()) as LazyStepResult;
        expect((step1.head as YuValue).toJSON()).to.equal(1);
        const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
        expect((step2.head as YuValue).toJSON()).to.equal(2);
        const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
        expect((step3.head as YuValue).toJSON()).to.equal(3);
      });

      it("should generate values with step on demand [0, 5 ..]", () => {
        const node = range(0, undefined, 5);
        const result = kernel.run(
          lazyRuntime.evaluateRange(node, evaluator),
        ) as LazyList;

        const step1 = kernel.run(result.step()) as LazyStepResult;
        expect((step1.head as YuValue).toJSON()).to.equal(0);
        const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
        expect((step2.head as YuValue).toJSON()).to.equal(5);
        const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
        expect((step3.head as YuValue).toJSON()).to.equal(10);
      });
    });
  });

  describe("evaluateCons", () => {
    describe("Eager Mode (lazy: false)", () => {
      const eagerContext = new RuntimeContext({ lazyLoading: false });
      const eagerEvaluator = new InterpreterVisitor(eagerContext);
      const lazyRuntimeEager = new LazyRuntime(eagerContext);
      const kernelEager = new YukigoKernel(eagerEvaluator);
      it("should construct an array if tail is an array", () => {
        const node = cons(num(1), list([num(2), num(3)]));
        const result = kernelEager.run(
          lazyRuntimeEager.evaluateCons(node, eagerEvaluator),
        );
        expect((result as YuValue).toJSON()).to.deep.equal([1, 2, 3]);
      });

      it("should throw if tail is not an array", () => {
        const lazyListMock = range(1);
        const node = cons(num(1), lazyListMock);

        expect(() =>
          kernelEager.run(lazyRuntimeEager.evaluateCons(node, eagerEvaluator)),
        ).to.throw(/Expected Array in eager Cons/);
      });
    });

    describe("Lazy Mode (lazy: true)", () => {
      beforeEach(() => {
        evaluator = new InterpreterVisitor(lazyContext);
        lazyRuntime = new LazyRuntime(lazyContext);
        kernel = new YukigoKernel(evaluator);
      });
      it("should return a LazyList if tail is an array (hybrid)", () => {
        const node = cons(num(1), list([num(2), num(3)]));
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        expect(isLazyList(result)).to.be.true;

        const step1 = kernel.run((result as LazyList).step()) as LazyStepResult;
        expect((step1.head as YuValue).toJSON()).to.equal(1);
        const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
        expect((step2.head as YuValue).toJSON()).to.equal(2);
        const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
        expect((step3.head as YuValue).toJSON()).to.equal(3);
      });

      it("should return a new LazyList if tail is a LazyList", () => {
        const tailLazy = range(2, 3); // Finite range, but in lazy mode it's a LazyList

        const node = cons(num(1), tailLazy);
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        if (!isLazyList(result)) fail("result is not a lazy list");

        const step1 = kernel.run(result.step()) as LazyStepResult;
        expect((step1.head as YuValue).toJSON()).to.equal(1);
        const step2 = kernel.run(step1.tail!.step()) as LazyStepResult;
        expect((step2.head as YuValue).toJSON()).to.equal(2);
        const step3 = kernel.run(step2.tail!.step()) as LazyStepResult;
        expect((step3.head as YuValue).toJSON()).to.equal(3);
        expect(step3.tail).to.be.null;
      });

      it("should throw if tail is invalid", () => {
        const node = cons(num(1), num(123));
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        expect(isLazyList(result)).to.be.true;
        expect(() => kernel.run((result as LazyList).step())).to.throw(
          /Invalid tail in cons/,
        );
      });
    });
  });
});
