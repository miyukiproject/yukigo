import grammar from "./parser/grammar.js";
import nearley from "nearley";
import { groupFunctionDeclarations } from "./utils/helpers.js";
import { TypeChecker } from "./typechecker/checker.js";
import { AST, Expression, YukigoParser } from "yukigo-ast";
import { inspect } from "util";
import { preprocessor } from "./parser/layoutPreprocessor.js";
import { preludeCode } from "./prelude.js";
import { Token } from "moo";

class UnexpectedToken extends Error {
  constructor(token: Token) {
    super(
      `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`
    );
  }
}
class AmbiguityError extends Error {
  constructor(amountAST: number) {
    super(
      `Parser: Too much ambiguity. ${amountAST} ASTs parsed. Output not generated.`
    );
  }
}
class TypeError extends Error {
  constructor(errors: string[]) {
    super(`Found type errors.\n\t-${errors.join("\n\t-")}`);
  }
}

export type HaskellConfig = {
  typecheck: boolean;
};

const HaskellDefaultConfig = {
  typecheck: true,
};

export class YukigoHaskellParser implements YukigoParser {
  public errors: string[] = [];
  private prelude: AST;
  private config: HaskellConfig;
  constructor(
    prelude: string = preludeCode,
    config: HaskellConfig = HaskellDefaultConfig
  ) {
    this.errors = [];
    this.prelude = this.feedParser(prelude);
    this.config = config;
  }

  public parse(code: string): AST {
    const processedCode = preprocessor(code);
    const result = this.feedParser(processedCode);
    const ast = groupFunctionDeclarations(this.prelude.concat(result));
    if (this.config.typecheck) {
      const typeChecker = new TypeChecker();
      const errors = typeChecker.check(ast);
      if (errors.length > 0) {
        this.errors.push(...errors);
        throw new TypeError(errors);
      }
    }
    return ast;
  }
  public parseExpression(code: string): Expression {
    const processedCode = preprocessor(code);
    const expr = this.feedParser(processedCode);
    return expr;
  }
  private feedParser(code: string): any {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      if ("token" in error) throw new UnexpectedToken(error.token);
      throw error;
    }
    const { results } = parser;
    if (results.length > 1) throw new AmbiguityError(results.length);
    if (results.length == 0) return [];
    return results[0];
  }
}
