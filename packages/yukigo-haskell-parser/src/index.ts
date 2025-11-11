import grammar from "./parser/grammar.js";
import nearley from "nearley";
import { groupFunctionDeclarations } from "./utils/helpers.js";
import { TypeChecker } from "./typechecker/checker.js";
import { AST, YukigoParser } from "@yukigo/ast";
import { inspect } from "util";
import { preprocessor } from "./parser/layoutPreprocessor.js";
import { preludeCode } from "./prelude.js";

export class YukigoHaskellParser implements YukigoParser {
  public errors: string[] = [];
  private prelude: string;
  constructor(prelude?: string) {
    this.errors = [];
    this.prelude = prelude ?? preludeCode;
  }

  public parse(code: string): AST {
    const processedCode = preprocessor(code);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(this.prelude + "\n\n" + processedCode);
      parser.finish();
    } catch (error) {
      console.log(error)
      if ("token" in error) {
        const token = error.token;
        const message = `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
        this.errors.push(message);
        throw Error(message);
      }
      throw error;
    }
    if (parser.results.length > 1) {
      const msg = `Parser: Too much ambiguity. ${parser.results.length} ASTs parsed. Output not generated.`;
      this.errors.push(msg);
      throw Error(msg);
    }
    if (parser.results.length == 0) {
      this.errors.push("Parser did not generate an AST.");
      throw Error("Parser did not generate an AST.");
    }
    const ast = groupFunctionDeclarations(parser.results[0]);
    try {
      const typeChecker = new TypeChecker();
      const errors = typeChecker.check(ast);
      if (errors.length > 0) {
        this.errors.push(...errors);
      }
    } catch (error) {
      console.log(error);
    }
    return ast;
  }
}
