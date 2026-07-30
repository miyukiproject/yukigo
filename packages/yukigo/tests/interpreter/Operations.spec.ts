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
import {
  YuNumber,
  YuString,
  YuBoolean,
  YuArray,
  YuValue,
} from "../../src/interpreter/primitives/index.js";
import {
  StepCommand,
  ExecutionCommand,
} from "../../src/interpreter/components/kernel/commands.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";

const number = (num: number) => new YuNumber(num);
const string = (str: string) => new YuString(str);
const boolean = (bool: boolean) => new YuBoolean(bool);
const array = (arr: any[]) => new YuArray(arr);

const stepCmd = (val: YuValue) => new StepCommand(val);

const runCmd = (cmd: ExecutionCommand): YuValue => {
  const kernel = new YukigoKernel(new InterpreterVisitor(new RuntimeContext()));
  return kernel.run(cmd);
};

describe("Operations Tables", () => {
  describe("ArithmeticBinaryTable", () => {
    const ops = ArithmeticBinaryTable;

    it("should perform basic arithmetic", () => {
      expect(runCmd(ops.Plus(number(2), number(3)))).to.deep.equal(number(5));
      expect(runCmd(ops.Minus(number(5), number(2)))).to.deep.equal(number(3));
      expect(runCmd(ops.Multiply(number(4), number(2)))).to.deep.equal(
        number(8),
      );
      expect(runCmd(ops.Divide(number(10), number(2)))).to.deep.equal(
        number(5),
      );
    });

    it("should calculate modulo", () => {
      expect(runCmd(ops.Modulo(number(10), number(3)))).to.deep.equal(
        number(1),
      ); // 10 % 3 = 1
    });

    it("should calculate power", () => {
      expect(runCmd(ops.Power(number(2), number(3)))).to.deep.equal(number(8)); // 2^3
    });

    it("should find min and max", () => {
      expect(runCmd(ops.Min(number(10), number(5)))).to.deep.equal(number(5));
      expect(runCmd(ops.Max(number(10), number(5)))).to.deep.equal(number(10));
    });
  });

  describe("ComparisonOperationTable", () => {
    const ops = ComparisonOperationTable;

    it("should handle equality and identity", () => {
      expect(runCmd(ops.Equal(number(5), string("5")))).to.deep.equal(
        boolean(true),
      ); // Coercion supported now
      expect(runCmd(ops.Equal(number(5), number(6)))).to.deep.equal(
        boolean(false),
      );
      expect(runCmd(ops.Equal(number(5), number(5)))).to.deep.equal(
        boolean(true),
      );

      expect(runCmd(ops.Same(number(5), string("5")))).to.deep.equal(
        boolean(false),
      );
      const num5 = number(5);
      expect(runCmd(ops.Same(num5, num5))).to.deep.equal(boolean(true));
      expect(runCmd(ops.Same(number(5), number(5)))).to.deep.equal(
        boolean(true),
      );

      expect(runCmd(ops.NotEqual(number(5), number(6)))).to.deep.equal(
        boolean(true),
      );
      expect(runCmd(ops.NotSame(number(5), string("5")))).to.deep.equal(
        boolean(true),
      );
    });

    it("should handle numeric comparison", () => {
      expect(runCmd(ops.GreaterThan(number(10), number(5)))).to.deep.equal(
        boolean(true),
      );
      expect(runCmd(ops.GreaterThan(number(5), number(10)))).to.deep.equal(
        boolean(false),
      );

      expect(
        runCmd(ops.GreaterOrEqualThan(number(10), number(10))),
      ).to.deep.equal(boolean(true));

      expect(runCmd(ops.LessThan(number(5), number(10)))).to.deep.equal(
        boolean(true),
      );
      expect(runCmd(ops.LessOrEqualThan(number(10), number(10)))).to.deep.equal(
        boolean(true),
      );
    });
  });

  describe("LogicalBinaryTable (Short-circuiting)", () => {
    const ops = LogicalBinaryTable;

    describe("And", () => {
      it("should return true only if both are true", () => {
        expect(
          runCmd(ops.And(boolean(true), () => stepCmd(boolean(true)))),
        ).to.deep.equal(boolean(true));
        expect(
          runCmd(ops.And(boolean(true), () => stepCmd(boolean(false)))),
        ).to.deep.equal(boolean(false));
        expect(
          runCmd(ops.And(boolean(false), () => stepCmd(boolean(true)))),
        ).to.deep.equal(boolean(false));
      });

      it("should NOT execute the right thunk if left is false", () => {
        let executed = false;
        const thunk = () => {
          executed = true;
          return stepCmd(boolean(true));
        };

        const result = runCmd(ops.And(boolean(false), thunk));

        expect(result).to.deep.equal(boolean(false));
        expect(executed).to.be.false; // Short-circuit logic check
      });
    });

    describe("Or", () => {
      it("should return true if at least one is true", () => {
        expect(
          runCmd(ops.Or(boolean(true), () => stepCmd(boolean(false)))),
        ).to.deep.equal(boolean(true));
        expect(
          runCmd(ops.Or(boolean(false), () => stepCmd(boolean(true)))),
        ).to.deep.equal(boolean(true));
        expect(
          runCmd(ops.Or(boolean(false), () => stepCmd(boolean(false)))),
        ).to.deep.equal(boolean(false));
      });

      it("should NOT execute the right thunk if left is true", () => {
        let executed = false;
        const thunk = () => {
          executed = true;
          return stepCmd(boolean(true));
        };

        const result = runCmd(ops.Or(boolean(true), thunk));

        expect(result).to.deep.equal(boolean(true));
        expect(executed).to.be.false; // Short-circuit logic check
      });
    });
  });

  describe("BitwiseBinaryTable", () => {
    const ops = BitwiseBinaryTable;

    it("should perform bitwise operations", () => {
      expect(runCmd(ops.BitwiseOr(number(1), number(2)))).to.deep.equal(
        number(3),
      ); // 01 | 10 = 11 (3)
      expect(runCmd(ops.BitwiseAnd(number(3), number(1)))).to.deep.equal(
        number(1),
      ); // 11 & 01 = 01 (1)
      expect(runCmd(ops.BitwiseXor(number(3), number(1)))).to.deep.equal(
        number(2),
      ); // 11 ^ 01 = 10 (2)
    });

    it("should perform shifts", () => {
      expect(runCmd(ops.BitwiseLeftShift(number(1), number(2)))).to.deep.equal(
        number(4),
      ); // 1 << 2 = 4
      expect(runCmd(ops.BitwiseRightShift(number(4), number(1)))).to.deep.equal(
        number(2),
      ); // 4 >> 1 = 2
      expect(
        runCmd(ops.BitwiseUnsignedRightShift(number(-10), number(1))),
      ).to.deep.equal(number(2147483643)); // >>>
    });
  });

  describe("StringOperationTable", () => {
    it("should concatenate strings", () => {
      expect(
        runCmd(StringOperationTable.Concat(string("Hello"), string(" World"))),
      ).to.deep.equal(string("Hello World"));
    });

    it("should coerce numbers to strings during concatenation", () => {
      expect(
        runCmd(StringOperationTable.Concat(string("Value: "), number(10))),
      ).to.deep.equal(string("Value: 10"));
    });
  });

  describe("Unary Tables", () => {
    it("BitwiseUnaryTable (Not)", () => {
      // ~1 = -2 (Complemento a dos)
      expect(runCmd(BitwiseUnaryTable.BitwiseNot(number(1)))).to.deep.equal(
        number(-2),
      );
    });

    it("LogicalUnaryTable (Negation)", () => {
      expect(runCmd(LogicalUnaryTable.Negation(boolean(true)))).to.deep.equal(
        boolean(false),
      );
      expect(runCmd(LogicalUnaryTable.Negation(boolean(false)))).to.deep.equal(
        boolean(true),
      );
    });

    describe("ArithmeticUnaryTable", () => {
      const ops = ArithmeticUnaryTable;
      it("should negate numbers", () => {
        expect(runCmd(ops.Negation(number(5)))).to.deep.equal(number(-5));
        expect(runCmd(ops.Negation(number(-5)))).to.deep.equal(number(5));
      });

      it("should round numbers", () => {
        expect(runCmd(ops.Round(number(1.5)))).to.deep.equal(number(2));
        expect(runCmd(ops.Round(number(1.4)))).to.deep.equal(number(1));
        expect(runCmd(ops.Floor(number(1.9)))).to.deep.equal(number(1));
        expect(runCmd(ops.Ceil(number(1.1)))).to.deep.equal(number(2));
      });

      it("should calc absolute and sqrt", () => {
        expect(runCmd(ops.Absolute(number(-10)))).to.deep.equal(number(10));
        expect(runCmd(ops.Sqrt(number(9)))).to.deep.equal(number(3));
      });
    });
  });

  describe("List Tables", () => {
    describe("ListBinaryTable", () => {
      it("should concatenate arrays", () => {
        const arr1 = array([number(1), number(2)]);
        const arr2 = array([number(3), number(4)]);
        const res = runCmd(ListBinaryTable.Concat(arr1, arr2));
        expect(res).to.deep.equal(
          array([number(1), number(2), number(3), number(4)]),
        );
        expect(arr1.items).to.have.length(2); // Ensure immutability (concat returns new array)
      });
    });

    describe("ListUnaryTable", () => {
      const ops = ListUnaryTable;

      it("should return size of array", () => {
        expect(
          runCmd(ops.Size(array([number(1), number(2), number(3)]))),
        ).to.deep.equal(number(3));
      });

      it("should flatten nested arrays", () => {
        const input = array([
          number(1),
          array([number(2), number(3)]),
          number(4),
        ]);
        const res = runCmd(ops.Flatten(input));
        expect(res).to.deep.equal(
          array([number(1), number(2), number(3), number(4)]),
        );
      });

      describe("DetectMax / DetectMin", () => {
        it("should detect max/min in number arrays", () => {
          const nums = array([number(10), number(5), number(20), number(1)]);
          expect(runCmd(ops.DetectMax(nums))).to.deep.equal(number(20));
          expect(runCmd(ops.DetectMin(nums))).to.deep.equal(number(1));
        });

        it("should throw if array contains non-numbers", () => {
          const badInput = array([number(10), string("hello"), number(20)]);

          expect(() => runCmd(ops.DetectMax(badInput))).to.throw(/\[DetectMax\] elements must be numbers/);
          expect(() => runCmd(ops.DetectMin(badInput))).to.throw(/\[DetectMin\] elements must be numbers/);
        });
      });
    });
  });
});
