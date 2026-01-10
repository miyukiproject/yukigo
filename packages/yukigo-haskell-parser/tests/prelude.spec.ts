import { YukigoHaskellParser } from "../src/index.js";
import { assert } from "chai";
import { preludeCode } from "../src/prelude.js";

describe("PreludePdP Tests", () => {
  let parser: YukigoHaskellParser;
  beforeEach(() => {
    parser = new YukigoHaskellParser("");
  });
  it("parses PreludePdP", () => {
    assert.doesNotThrow(() => parser.parse(preludeCode));
  });
  it("validates PreludePdP", () => {
    parser.parse(preludeCode);
    assert.isEmpty(parser.errors);
  });
});
