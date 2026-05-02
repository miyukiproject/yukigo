import { MulangAdapter } from "../../src/index.js";
import { isYukigoPrimitive, NumberPrimitive, Otherwise } from "yukigo-ast";
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
    inspection: HasLambda
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: square
    inspection: UsesArithmetic
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
        inspection: "Declares",
        binding: "*",
        args: ["squareList"],
        expected: true,
        targetSuffix: "named",
      },
      {
        inspection: "UsesLambda",
        binding: "squareList",
        args: [],
        expected: true,
      },
      {
        inspection: "UsesArithmetic",
        binding: "square",
        args: [],
        expected: true,
      },
      {
        inspection: "Declares",
        binding: "*",
        args: ["doble"],
        expected: false,
        targetSuffix: "named",
      },
      {
        inspection: "Uses",
        binding: "square",
        args: ["x"],
        expected: true,
        targetSuffix: "named",
      },
      {
        inspection: "Uses",
        binding: "squareList",
        args: ["map"],
        expected: true,
        targetSuffix: "named",
      },
      {
        inspection: "Uses",
        binding: "squareList",
        args: ["map"],
        expected: false,
        targetSuffix: "named",
      },
    ]);
  });
  it("detects correctly YukigoPrimitive", () => {
    assert.isFalse(isYukigoPrimitive(new Otherwise()));
    assert.isTrue(isYukigoPrimitive(new NumberPrimitive(4)));
  });
});
