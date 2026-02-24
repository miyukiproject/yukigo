import { expect } from "chai";
import { LazyRuntime } from "../../src/interpreter/components/runtimes/LazyRuntime.js";
import {
  RangeExpression,
  ConsExpression,
  LazyList,
  NumberPrimitive,
  ListPrimitive,
  Expression,
  isLazyList,
} from "yukigo-ast";
import {
  createGlobalEnv,
  createStream,
  ExpressionEvaluator,
} from "../../src/interpreter/utils.js";
import {
  isMemoizedList,
  MemoizedLazyList,
} from "../../src/interpreter/components/PatternMatcher.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import { fail } from "assert";
import {
  idContinuation,
  trampoline,
} from "../../src/interpreter/trampoline.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";

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

const context = new RuntimeContext({ lazyLoading: true });
describe("LazyRuntime", () => {
  let evaluator: ExpressionEvaluator;
  let lazyRuntime: LazyRuntime;
  beforeEach(() => {
    evaluator = new InterpreterVisitor(createGlobalEnv(), context);
    lazyRuntime = new LazyRuntime(context);
  });
  describe("realizeList", () => {
    it("should return the array as-is if input is already an array", () => {
      const input = [1, 2, 3];
      const result = trampoline(lazyRuntime.realizeList(input, idContinuation));
      expect(result).to.equal(input);
      expect(result).to.deep.equal([1, 2, 3]);
    });

    it("should consume a LazyList into an array", () => {
      const lazyList: LazyList = createStream(function* () {
        yield 10;
        yield 20;
      });

      const result = trampoline(
        lazyRuntime.realizeList(lazyList, idContinuation),
      );
      expect(result).to.deep.equal([10, 20]);
    });

    it("should throw if value is not a list or lazy list", () => {
      expect(() =>
        trampoline(lazyRuntime.realizeList(123 as any, idContinuation)),
      ).to.throw(/Expected List or LazyList/);
    });
  });

  describe("evaluateRange", () => {
    describe("Finite Ranges", () => {
      it("should create a simple range [1..5]", () => {
        const node = range(1, 5);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
        );
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      });

      it("should handle custom steps [0, 2 .. 10]", () => {
        const node = range(0, 10, 2);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
        );
        expect(result).to.deep.equal([0, 2, 4, 6, 8, 10]);
      });

      it("should handle negative steps [5, 4 .. 1]", () => {
        const node = range(5, 1, 4);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
        );
        expect(result).to.deep.equal([5, 4, 3, 2, 1]);
      });

      it("should throw if step is zero", () => {
        const node = range(5, 10, 5);
        expect(() =>
          trampoline(
            lazyRuntime.evaluateRange(node, evaluator, idContinuation),
          ),
        ).to.throw(/Range step cannot be zero/);
      });
    });

    describe("Infinite Ranges", () => {
      it("should return a LazyList object", () => {
        const node = range(1);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
        );

        expect(result).to.have.property("type", "LazyList");
        expect(result).to.have.property("generator");
      });

      it("should generate values on demand [1..]", () => {
        const node = range(1);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
        ) as LazyList;
        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
      });

      it("should generate values with step on demand [0, 5 ..]", () => {
        const node = range(0, undefined, 5);
        const result = trampoline(
          lazyRuntime.evaluateRange(node, evaluator, idContinuation),
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
      const eagerEvaluator = new InterpreterVisitor(createGlobalEnv(), eagerContext);
      const lazyRuntimeEager = new LazyRuntime(eagerContext);
      it("should construct an array if tail is an array", () => {
        const node = cons(num(1), list([num(2), num(3)]));
        const result = trampoline(
          lazyRuntimeEager.evaluateCons(node, eagerEvaluator, idContinuation),
        );
        expect(result).to.deep.equal([1, 2, 3]);
      });

      it("should throw if tail is not an array", () => {
        const lazyListMock = range(1);
        const node = cons(num(1), lazyListMock);

        expect(() =>
          trampoline(lazyRuntimeEager.evaluateCons(node, eagerEvaluator, idContinuation)),
        ).to.throw(/Expected Array in eager Cons/);
      });
    });

    describe("Lazy Mode (lazy: true)", () => {
      it("should return an array if tail is an array (hybrid)", () => {
        const node = cons(num(1), list([num(2), num(3)]));
        const result = trampoline(
          lazyRuntime.evaluateCons(node, evaluator, idContinuation),
        );
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
        const result = trampoline(
          lazyRuntime.evaluateCons(node, evaluator, idContinuation),
        );
        if (!isLazyList(result)) fail("result is not a lazy list");
        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
        expect(gen.next().done).to.be.true;
      });

      it("should throw if tail is invalid", () => {
        const node = cons(num(1), num(123));
        const result = trampoline(
          lazyRuntime.evaluateCons(node, evaluator, idContinuation),
        );
        expect(isMemoizedList(result)).to.be.true;
        const gen = (result as MemoizedLazyList).generator();
        gen.next();
        expect(() => gen.next()).to.throw(/Invalid tail type for Cons/);
      });
    });
  });
});
