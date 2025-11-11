import { Analyzer, InspectionRule } from "../src/analyzer/index.js";
import { assert } from "chai";

describe("Analyzer Spec", () => {
  let analyzer: Analyzer;
  beforeEach(() => {
    analyzer = new Analyzer();
  });
  it("UsesComposition", () => {
    const inspection: InspectionRule = {
      inspection: "UsesComposition",
      binding: "func",
      args: [],
      expected: false,
    };
    const result = analyzer.analyze([], [inspection]);
    assert.deepEqual(result, [
      { rule: inspection, passed: true, actual: false },
    ]);
  });
});
