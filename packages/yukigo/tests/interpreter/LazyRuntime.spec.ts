import { expect } from "chai";
import { LazyRuntime } from "../../src/interpreter/components/runtimes/LazyRuntime.js";
import {
  RangeExpression,
  ConsExpression,
  NumberPrimitive,
  ListPrimitive,
  Expression,
} from "yukigo-ast";
import { createStream, Evaluator } from "../../src/interpreter/utils.js";
import {
  isMemoizedList,
  MemoizedLazyList,
} from "../../src/interpreter/components/PatternMatcher.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import { fail } from "assert";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { LazyList, isLazyList } from "../../src/interpreter/runtime.js";

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
      const input = [1, 2, 3];
      const result = kernel.run(lazyRuntime.realizeList(input));
      expect(result).to.equal(input);
      expect(result).to.deep.equal([1, 2, 3]);
    });

    it("should consume a LazyList into an array", () => {
      const lazyList: LazyList = createStream(function* () {
        yield 10;
        yield 20;
      });

      const result = kernel.run(lazyRuntime.realizeList(lazyList));
      expect(result).to.deep.equal([10, 20]);
    });

    it("should throw if value is not a list or lazy list", () => {
      expect(() => kernel.run(lazyRuntime.realizeList(123 as any))).to.throw(
        /Expected List or LazyList/,
      );
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
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      });

      it("should handle custom steps [0, 2 .. 10]", () => {
        const node = range(0, 10, 2);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));
        expect(result).to.deep.equal([0, 2, 4, 6, 8, 10]);
      });

      it("should handle negative steps [5, 4 .. 1]", () => {
        const node = range(5, 1, 4);
        const result = kernel.run(lazyRuntime.evaluateRange(node, evaluator));
        expect(result).to.deep.equal([5, 4, 3, 2, 1]);
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

        expect(result).to.have.property("type", "LazyList");
        expect(result).to.have.property("generator");
      });

      it("should generate values on demand [1..]", () => {
        const node = range(1);
        const result = kernel.run(
          lazyRuntime.evaluateRange(node, evaluator),
        ) as LazyList;
        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
      });

      it("should generate values with step on demand [0, 5 ..]", () => {
        const node = range(0, undefined, 5);
        const result = kernel.run(
          lazyRuntime.evaluateRange(node, evaluator),
        ) as LazyList;

        const gen = result.generator();
        expect(gen.next().value).to.equal(0);
        expect(gen.next().value).to.equal(5);
        expect(gen.next().value).to.equal(10);
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
        expect(result).to.deep.equal([1, 2, 3]);
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
      it("should return an array if tail is an array (hybrid)", () => {
        const node = cons(num(1), list([num(2), num(3)]));
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        expect(isMemoizedList(result)).to.be.true;
        const memoList = result as MemoizedLazyList;
        const generator = memoList.generator();
        expect(generator.next().value).to.deep.equal(1);
        expect(generator.next().value).to.deep.equal(2);
        expect(generator.next().value).to.deep.equal(3);
      });

      it("should return a new LazyList if tail is a LazyList", () => {
        const tailLazy = range(2, 3);

        const node = cons(num(1), tailLazy);
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        if (!isLazyList(result)) fail("result is not a lazy list");
        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
        expect(gen.next().done).to.be.true;
      });

      it("should throw if tail is invalid", () => {
        const node = cons(num(1), num(123));
        const result = kernel.run(lazyRuntime.evaluateCons(node, evaluator));
        expect(isMemoizedList(result)).to.be.true;
        const gen = (result as MemoizedLazyList).generator();
        gen.next();
        expect(() => gen.next()).to.throw(/Invalid tail type for Cons/);
      });
    });
  });
});
