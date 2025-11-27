import { expect } from "chai";
import { LazyRuntime } from "../../src/interpreter/components/LazyRuntime.js";
import {
  RangeExpression,
  ConsExpression,
  LazyList,
  NumberPrimitive,
} from "@yukigo/ast";

class MockEvaluator {
  evaluate(node: any): any {
    if (node && typeof node === "object" && "value" in node) {
      return node.value;
    }
    return node;
  }
}

const num = (value: number) => new NumberPrimitive(value);

const range = (start: number, end?: number, step?: number): RangeExpression =>
  new RangeExpression(
    num(start),
    end ? num(end) : undefined,
    step ? num(step) : undefined
  );

// Helper para crear nodos Cons
const cons = (headVal: any, tailVal: any): ConsExpression =>
  new ConsExpression(headVal, tailVal);

describe("LazyRuntime", () => {
  let evaluator: any;

  beforeEach(() => {
    evaluator = new MockEvaluator();
  });

  describe("realizeList", () => {
    it("should return the array as-is if input is already an array", () => {
      const input = [1, 2, 3];
      const result = LazyRuntime.realizeList(input);
      expect(result).to.equal(input);
      expect(result).to.deep.equal([1, 2, 3]);
    });

    it("should consume a LazyList into an array", () => {
      const lazyList: LazyList = {
        type: "LazyList",
        generator: function* () {
          yield 10;
          yield 20;
        },
      };

      const result = LazyRuntime.realizeList(lazyList);
      expect(result).to.deep.equal([10, 20]);
    });

    it("should throw if value is not a list or lazy list", () => {
      expect(() => LazyRuntime.realizeList(123 as any)).to.throw(
        /Expected List or LazyList/
      );
    });
  });

  describe("evaluateRange", () => {
    describe("Finite Ranges", () => {
      it("should create a simple range [1..5]", () => {
        const node = range(1, 5);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: false,
        });
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      });

      it("should handle custom steps [0, 2 .. 10]", () => {
        const node = range(0, 10, 2);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: false,
        });
        expect(result).to.deep.equal([0, 2, 4, 6, 8, 10]);
      });

      it("should handle negative steps [5, 4 .. 1]", () => {
        const node = range(5, 1, 4);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: false,
        });
        expect(result).to.deep.equal([5, 4, 3, 2, 1]);
      });

      it("should throw if step is zero", () => {
        const node = range(5, 10, 5);
        expect(() => LazyRuntime.evaluateRange(node, evaluator, {})).to.throw(
          /Range step cannot be zero/
        );
      });
    });

    describe("Infinite Ranges", () => {
      it("should throw if lazyLoading is disabled", () => {
        const node = range(1);
        expect(() =>
          LazyRuntime.evaluateRange(node, evaluator, { lazyLoading: false })
        ).to.throw(/Infinite range requires lazyLoading/);
      });

      it("should return a LazyList object", () => {
        const node = range(1);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: true,
        });

        expect(result).to.have.property("type", "LazyList");
        expect(result).to.have.property("generator");
      });

      it("should generate values on demand [1..]", () => {
        const node = range(1);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: true,
        }) as LazyList;
        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
      });

      it("should generate values with step on demand [0, 5 ..]", () => {
        const node = range(0, undefined, 5);
        const result = LazyRuntime.evaluateRange(node, evaluator, {
          lazyLoading: true,
        }) as LazyList;

        const gen = result.generator();
        expect(gen.next().value).to.equal(0);
        expect(gen.next().value).to.equal(5);
        expect(gen.next().value).to.equal(10);
      });
    });
  });

  describe("evaluateCons", () => {
    describe("Eager Mode (lazy: false)", () => {
      it("should construct an array if tail is an array", () => {
        const node = cons(1, [2, 3]);
        const result = LazyRuntime.evaluateCons(node, evaluator, false);
        expect(result).to.deep.equal([1, 2, 3]);
      });

      it("should throw if tail is not an array", () => {
        const lazyListMock = { type: "LazyList" };
        const node = cons(1, lazyListMock);

        expect(() => LazyRuntime.evaluateCons(node, evaluator, false)).to.throw(
          /Expected Array in eager Cons/
        );
      });
    });

    describe("Lazy Mode (lazy: true)", () => {
      it("should return an array if tail is an array (hybrid)", () => {
        const node = cons(1, [2, 3]);
        const result = LazyRuntime.evaluateCons(node, evaluator, true);
        expect(result).to.deep.equal([1, 2, 3]);
      });

      it("should return a new LazyList if tail is a LazyList", () => {
        const tailLazy: LazyList = {
          type: "LazyList",
          generator: function* () {
            yield 2;
            yield 3;
          },
        };

        const node = cons(1, tailLazy);
        const result = LazyRuntime.evaluateCons(
          node,
          evaluator,
          true
        ) as LazyList;

        expect(result.type).to.equal("LazyList");

        const gen = result.generator();
        expect(gen.next().value).to.equal(1);
        expect(gen.next().value).to.equal(2);
        expect(gen.next().value).to.equal(3);
        expect(gen.next().done).to.be.true;
      });

      it("should throw if tail is invalid", () => {
        const node = cons(1, "invalid string");
        expect(() => LazyRuntime.evaluateCons(node, evaluator, true)).to.throw(
          /Invalid tail type/
        );
      });
    });
  });
});
