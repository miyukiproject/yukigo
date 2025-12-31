import { YukigoHaskellParser } from "../src/index.js";
import { assert } from "chai";

describe("Ambiguity Reproduction", () => {
  let parser: YukigoHaskellParser;
  beforeEach(() => {
    parser = new YukigoHaskellParser("", { typecheck: false });
  });

  it("parses error application without ambiguity", () => {
    const code = 'f = error "msg"';
    assert.doesNotThrow(() => parser.parse(code));
  });

  it("parses type signature without ambiguity", () => {
    const code = 'f :: Int -> Int';
    assert.doesNotThrow(() => parser.parse(code));
  });

  it("parses cons pattern without ambiguity", () => {
    const code = 'f (x:xs) = x';
    assert.doesNotThrow(() => parser.parse(code));
  });
});