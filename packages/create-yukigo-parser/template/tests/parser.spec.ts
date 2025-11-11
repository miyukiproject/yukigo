import { YukigoParserPlaceholder } from "../src/index.js";
import {
  ArithmeticBinaryOperation,
  NumberPrimitive,
  YukigoParser,
  Return,
  SourceLocation,
} from "@yukigo/ast";
import { assert } from "chai";

describe("Parser Tests", () => {
  let parser: YukigoParser;
  beforeEach(() => {
    parser = new YukigoParserPlaceholder();
  });
  it("parses basic sum", () => {
    assert.deepEqual(parser.parse("1 + 2"), [
      new Return(
        new ArithmeticBinaryOperation(
          "Plus",
          new NumberPrimitive(1, new SourceLocation(1, 1)),
          new NumberPrimitive(2, new SourceLocation(1, 5))
        )
      ),
    ]);
  });
});
