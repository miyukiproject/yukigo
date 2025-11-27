import { MulangAdapter } from "../../src/index.js";
import { isYukigoPrimitive, NumberPrimitive, Otherwise } from "@yukigo/ast";
import { assert } from "chai";

describe("Helpers Spec", () => {
  it("translates correctly mulang's expectations", () => {
    const mulangAdapter = new MulangAdapter();
    const mulangExpectations = `
expectations:
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: squareList
    inspection: HasBinding
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: squareList
    inspection: HasLambdaExpression
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: square
    inspection: HasArithmetic
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: doble
    inspection: Not:HasBinding
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: square
    inspection: Uses:x
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: squareList
    inspection: Uses:map
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: squareList
    inspection: Not:Uses:map`;

    const yukigoExpectations =
      mulangAdapter.translateMulangExpectations(mulangExpectations);
    assert.deepEqual(yukigoExpectations, [
      {
        inspection: "HasBinding",
        binding: "squareList",
        args: [],
        expected: true,
      },
      {
        inspection: "HasLambdaExpression",
        binding: "squareList",
        args: [],
        expected: true,
      },
      {
        inspection: "HasArithmetic",
        binding: "square",
        args: [],
        expected: true,
      },
      {
        inspection: "HasBinding",
        binding: "doble",
        args: [],
        expected: false,
      },
      {
        inspection: "Uses",
        binding: "square",
        args: ["x"],
        expected: true,
      },
      {
        inspection: "Uses",
        binding: "squareList",
        args: ["map"],
        expected: true,
      },
      {
        inspection: "Uses",
        binding: "squareList",
        args: ["map"],
        expected: false,
      },
    ]);
  });
  it("detects correctly YukigoPrimitive", () => {
    assert.isFalse(isYukigoPrimitive(new Otherwise()));
    assert.isTrue(isYukigoPrimitive(new NumberPrimitive(4)));
  });
});
