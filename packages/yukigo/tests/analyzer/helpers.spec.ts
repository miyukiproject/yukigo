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
        inspection: "Declares",
        binding: "*",
        args: ["squareList"],
        expected: true,
        targetSuffix: "named",
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
  it("translates mulang's expectations with target suffixes and matchers", () => {
    const mulangAdapter = new MulangAdapter();
    const expectations = `
expectations:
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: "*"
    inspection: Calls:foo:except:WithNumber:4
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: "*"
    inspection: Calls:bar:like:WithAnything
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: "*"
    inspection: Calls:baz:WithTrue
  - !ruby/hash:ActiveSupport::HashWithIndifferentAccess
    binding: "*"
    inspection: Calls:WithAnything
`;
    const yukigoExpectations = mulangAdapter.translateMulangExpectations(expectations);
    assert.deepEqual(yukigoExpectations, [
      {
        inspection: "Calls",
        binding: "*",
        args: ["foo"],
        expected: true,
        targetSuffix: "except",
        matcher: {
          type: "with_number",
          value: "4"
        }
      },
      {
        inspection: "Calls",
        binding: "*",
        args: ["bar"],
        expected: true,
        targetSuffix: "like",
        matcher: {
          type: "with_anything",
          value: undefined
        }
      },
      {
        inspection: "Calls",
        binding: "*",
        args: ["baz"],
        expected: true,
        targetSuffix: "named",
        matcher: {
          type: "with_true",
          value: undefined
        }
      },
      {
        inspection: "Calls",
        binding: "*",
        args: [],
        expected: true,
        matcher: {
          type: "with_anything",
          value: undefined
        }
      }
    ]);
  });
  it("translates correctly expectations that provide arguments in the args property instead of the inspection string", () => {
    const mulangAdapter = new MulangAdapter();
    const rules = [
      {
        binding: "cantidadRuedasMoto",
        inspection: "HasUsage",
        args: ["cantidadRuedasBicicleta"],
        expected: true
      }
    ];
    const yukigoExpectations = rules.map((r) => mulangAdapter.translateMulangInspection(r));
    assert.deepEqual(yukigoExpectations, [
      {
        inspection: "Uses",
        binding: "cantidadRuedasMoto",
        args: ["cantidadRuedasBicicleta"],
        expected: true,
        targetSuffix: "named"
      }
    ]);
  });
  it("detects correctly YukigoPrimitive", () => {
    assert.isFalse(isYukigoPrimitive(new Otherwise()));
    assert.isTrue(isYukigoPrimitive(new NumberPrimitive(4)));
  });
});
