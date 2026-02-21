import grammar from "./parser/grammar.js";
import nearley from "nearley";
import { groupFunctionDeclarations } from "./utils/helpers.js";
import { TypeChecker } from "./typechecker/checker.js";
import {
  ArithmeticUnaryOperation,
  AST,
  Equation,
  Expression,
  Function,
  Instance,
  ListType,
  Return,
  Sequence,
  SimpleType,
  StringOperation,
  StringPrimitive,
  SymbolPrimitive,
  TypePattern,
  UnguardedBody,
  VariablePattern,
  YukigoParser,
} from "yukigo-ast";
import { preludeCode } from "./prelude.js";
import { typeMappings } from "./utils/types.js";
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
  includePrims: boolean;
};

const HaskellDefaultConfig = {
  typecheck: true,
  includePrims: true,
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

  private preprocessor(code: string): string {
    return code.replace(/Exception\.evaluate/g, "evaluate");
  }

  public parse(code: string): AST {
    const processedCode = this.preprocessor(code);
    const result = this.feedParser(processedCode);
    const fullAst = this.prelude.concat(result);

    const makePrim = (name: string) => new Function(new SymbolPrimitive(name), [
      new Equation(
        [new VariablePattern(new SymbolPrimitive("x"))],
        new UnguardedBody(new Sequence([new Return(new ArithmeticUnaryOperation("ToString", new SymbolPrimitive("x")))]))
      )
    ]);

    const prims = [
      makePrim("primShow"),
      makePrim("primShowChar"), 
      makePrim("primShowString"),
      makePrim("primShowList")
    ];

    const resolveYukigoType = (t: any): any => {
      if (t instanceof SimpleType) {
        const mapped = typeMappings[t.value];
        if (mapped) return new SimpleType(mapped, t.constraints, t.loc);
        return t;
      }
      if (t instanceof ListType) return t;
      return t;
    };

    const primShowString = new Function(new SymbolPrimitive("primShowString"), [
      new Equation(
        [new VariablePattern(new SymbolPrimitive("s"))],
        new UnguardedBody(new Sequence([
          new Return(
            new StringOperation(
              "Concat", 
              new StringPrimitive("\""),
              new StringOperation("Concat", new SymbolPrimitive("s"), new StringPrimitive("\""))
            )
          )
        ]))
      )
    ]);

    // Transform Instance nodes into Function nodes with TypePatterns
    const transformedAst: AST = this.config.includePrims ? [...prims, primShowString] : [];
    for (const node of fullAst) {
      if (node instanceof Instance) {
        const instanceNode = node as Instance;
        const yukigoType = resolveYukigoType(instanceNode.type);

        for (const func of instanceNode.functions) {
          const overloadedEquations = func.equations.map((eq) => {
            const firstPattern = eq.patterns[0];
            const typePattern = new TypePattern(
              yukigoType,
              firstPattern
            );
            return new Equation(
              [typePattern, ...eq.patterns.slice(1)],
              eq.body,
              eq.returnExpr,
              eq.loc
            );
          });
          transformedAst.unshift(
            new Function(func.identifier, overloadedEquations, func.loc)
          );
        }
      } else {
        transformedAst.push(node);
      }
    }

    const ast = groupFunctionDeclarations(transformedAst);
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
    const processedCode = this.preprocessor(code);
    const expr = this.feedParser(processedCode)[0];
    return expr;
  }
  private feedParser(code: string): any {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      if ("token" in error && error.token) throw new UnexpectedToken(error.token);
      throw error;
    }
    const { results } = parser;
    if (results.length > 1) throw new AmbiguityError(results.length);
    if (results.length == 0) return [];
    return results[0];
  }
}
