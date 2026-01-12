import { AST, Expression, Rule, YukigoParser } from "yukigo-ast";
import nearley from "nearley";
import grammar from "./parser/grammar.js";
import { Token } from "moo";
import { stdCode } from "./std.js";

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

export type HaskellConfig = {
  typecheck: boolean;
};

export class YukigoPrologParser implements YukigoParser {
  public errors: string[] = [];
  private std: AST;
  constructor(std: string = stdCode) {
    this.errors = [];
    this.std = this.feedParser(std);
  }
  public parse(code: string): AST {
    const result = this.feedParser(code);
    const ast = groupRuleDeclarations(this.std.concat(result));
    return ast;
  }
  public parseExpression(code: string): Expression {
    const expr = this.feedParser(code)[0];
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

export function groupRuleDeclarations(ast: AST): AST {
  const groups: Record<string, Rule[]> = {};
  const others: AST = [];

  for (const node of ast) {
    if (node instanceof Rule) {
      const name = node.identifier.value;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(node);
    } else {
      others.push(node);
    }
  }

  // Merge equations for each rule
  const ruleGroups: Rule[] = Object.values(groups).map((rules) => {
    const identifier = rules[0].identifier;
    const allEquations = rules.flatMap((r) => r.equations);
    return new Rule(identifier, allEquations, identifier.loc);
  });

  return [...others, ...ruleGroups];
}
