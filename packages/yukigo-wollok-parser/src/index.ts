import { AST, YukigoParser } from "@yukigo/ast";
import { parse } from "wollok-ts";
import { WollokToYukigoTransformer } from "./transformer.js";
import { inspect } from "util";

export class YukigoWollokParser implements YukigoParser {
  public errors: string[] = [];
  constructor() {
    this.errors = [];
  }

  public parse(code: string): AST {
    const parserResult = parse.File("example").parse(code);
    console.log(inspect(parserResult, false, null, true));
    if (parserResult.status === false) {
      const { index, expected } = parserResult;
      const expectation = expected.join(" or ");
      const message = `Parse error at line ${index.line} column ${index.column}: expected ${expectation}.`;
      throw new Error(message);
    }
    const resultAST = parserResult.value;

    const transformer = new WollokToYukigoTransformer();
    const yukigoAst = transformer.transform(resultAST);

    return yukigoAst;
  }
}
