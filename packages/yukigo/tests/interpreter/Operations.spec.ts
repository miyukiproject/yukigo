import { expect } from "chai";
import {
  ArithmeticBinaryTable,
  ComparisonOperationTable,
  LogicalBinaryTable,
  BitwiseBinaryTable,
  StringOperationTable,
  BitwiseUnaryTable,
  LogicalUnaryTable,
  ArithmeticUnaryTable,
  ListBinaryTable,
  ListUnaryTable,
} from "../../src/interpreter/components/Operations.js";

describe("Operations Tables", () => {
  describe("ArithmeticBinaryTable", () => {
    const ops = ArithmeticBinaryTable;

    it("should perform basic arithmetic", () => {
      expect(ops.Plus(2, 3)).to.equal(5);
      expect(ops.Minus(5, 2)).to.equal(3);
      expect(ops.Multiply(4, 2)).to.equal(8);
      expect(ops.Divide(10, 2)).to.equal(5);
    });

    it("should calculate modulo", () => {
      expect(ops.Modulo(10, 3)).to.equal(1); // 10 % 3 = 1
    });

    it("should calculate power", () => {
      expect(ops.Power(2, 3)).to.equal(8); // 2^3
    });

    it("should find min and max", () => {
      expect(ops.Min(10, 5)).to.equal(5);
      expect(ops.Max(10, 5)).to.equal(10);
    });
  });

  describe("ComparisonOperationTable", () => {
    const ops = ComparisonOperationTable as any;

    it("should handle equality and identity", () => {
      expect(ops.Equal(5, "5")).to.be.true; // 5 == "5"
      expect(ops.Equal(5, 6)).to.be.false;

      expect(ops.Same(5, "5")).to.be.false; // 5 === "5"
      expect(ops.Same(5, 5)).to.be.true;

      expect(ops.NotEqual(5, 6)).to.be.true;
      expect(ops.NotSame(5, "5")).to.be.true;
    });

    it("should handle numeric comparison", () => {
      expect(ops.GreaterThan(10, 5)).to.be.true;
      expect(ops.GreaterThan(5, 10)).to.be.false;

      expect(ops.GreaterOrEqualThan(10, 10)).to.be.true;

      expect(ops.LessThan(5, 10)).to.be.true;
      expect(ops.LessOrEqualThan(10, 10)).to.be.true;
    });
  });

  describe("LogicalBinaryTable (Short-circuiting)", () => {
    const ops = LogicalBinaryTable;

    describe("And", () => {
      it("should return true only if both are true", () => {
        expect(ops.And(true, () => true)).to.be.true;
        expect(ops.And(true, () => false)).to.be.false;
        expect(ops.And(false, () => true)).to.be.false;
      });

      it("should NOT execute the right thunk if left is false", () => {
        let executed = false;
        const thunk = () => {
          executed = true;
          return true;
        };

        const result = ops.And(false, thunk);

        expect(result).to.be.false;
        expect(executed).to.be.false; // Short-circuit logic check
      });
    });

    describe("Or", () => {
      it("should return true if at least one is true", () => {
        expect(ops.Or(true, () => false)).to.be.true;
        expect(ops.Or(false, () => true)).to.be.true;
        expect(ops.Or(false, () => false)).to.be.false;
      });

      it("should NOT execute the right thunk if left is true", () => {
        let executed = false;
        const thunk = () => {
          executed = true;
          return true;
        };

        const result = ops.Or(true, thunk);

        expect(result).to.be.true;
        expect(executed).to.be.false; // Short-circuit logic check
      });
    });
  });

  describe("BitwiseBinaryTable", () => {
    const ops = BitwiseBinaryTable;

    it("should perform bitwise operations", () => {
      expect(ops.BitwiseOr(1, 2)).to.equal(3); // 01 | 10 = 11 (3)
      expect(ops.BitwiseAnd(3, 1)).to.equal(1); // 11 & 01 = 01 (1)
      expect(ops.BitwiseXor(3, 1)).to.equal(2); // 11 ^ 01 = 10 (2)
    });

    it("should perform shifts", () => {
      expect(ops.BitwiseLeftShift(1, 2)).to.equal(4); // 1 << 2 = 4
      expect(ops.BitwiseRightShift(4, 1)).to.equal(2); // 4 >> 1 = 2
      expect(ops.BitwiseUnsignedRightShift(-10, 1)).to.equal(2147483643); // >>>
    });
  });

  describe("StringOperationTable", () => {
    it("should concatenate strings", () => {
      expect(StringOperationTable.Concat("Hello", " World")).to.equal(
        "Hello World"
      );
    });

    it("should coerce numbers to strings during concatenation", () => {
      // TS type says (string, string), but runtime JS behavior:
      const op = StringOperationTable.Concat as any;
      expect(op("Value: ", 10)).to.equal("Value: 10");
    });
  });

  describe("Unary Tables", () => {
    it("BitwiseUnaryTable (Not)", () => {
      // ~1 = -2 (Complemento a dos)
      expect(BitwiseUnaryTable.BitwiseNot(1)).to.equal(-2);
    });

    it("LogicalUnaryTable (Negation)", () => {
      expect(LogicalUnaryTable.Negation(true)).to.be.false;
      expect(LogicalUnaryTable.Negation(false)).to.be.true;
    });

    describe("ArithmeticUnaryTable", () => {
      const ops = ArithmeticUnaryTable;
      it("should negate numbers", () => {
        expect(ops.Negation(5)).to.equal(-5);
        expect(ops.Negation(-5)).to.equal(5);
      });

      it("should round numbers", () => {
        expect(ops.Round(1.5)).to.equal(2);
        expect(ops.Round(1.4)).to.equal(1);
        expect(ops.Floor(1.9)).to.equal(1);
        expect(ops.Ceil(1.1)).to.equal(2);
      });

      it("should calc absolute and sqrt", () => {
        expect(ops.Absolute(-10)).to.equal(10);
        expect(ops.Sqrt(9)).to.equal(3);
      });
    });
  });

  describe("List Tables", () => {
    describe("ListBinaryTable", () => {
      it("should concatenate arrays", () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const res = ListBinaryTable.Concat(arr1, arr2);
        expect(res).to.deep.equal([1, 2, 3, 4]);
        expect(arr1).to.have.length(2); // Ensure immutability (concat returns new array)
      });
    });

    describe("ListUnaryTable", () => {
      const ops = ListUnaryTable;

      it("should return size of array", () => {
        expect(ops.Size([1, 2, 3])).to.equal(3);
      });

      it("should flatten nested arrays", () => {
        // Flatten level 1 by default in .flat()
        const input = [1, [2, 3], 4];
        expect(ops.Flatten(input)).to.deep.equal([1, 2, 3, 4]);
      });

      describe("DetectMax / DetectMin", () => {
        // Nota: Estas pruebas asumen que 'isArrayOfNumbers' funciona correctamente
        // o que se está usando la implementación real.

        it("should detect max/min in number arrays", () => {
          const nums = [10, 5, 20, 1];
          expect(ops.DetectMax(nums)).to.equal(20);
          expect(ops.DetectMin(nums)).to.equal(1);
        });

        it("should throw if array contains non-numbers", () => {
          const badInput = [10, "hello" as any, 20];

          expect(() => ops.DetectMax(badInput)).to.throw(
            /must be Array of numbers/
          );
          expect(() => ops.DetectMin(badInput)).to.throw(
            /must be Array of numbers/
          );
        });
      });
    });
  });
});
