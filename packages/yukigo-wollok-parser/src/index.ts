import { AST, Expression, YukigoParser } from "yukigo-ast";
import { parse } from "wollok-ts";
import { WollokToYukigoTransformer } from "./transformer.js";
import { lib } from "./wollok/lib.js";
import { lang } from "./wollok/lang.js";
import { Failure } from "parsimmon";
import { buildWollokNativeProviders } from "./utils.js";
import nativeSpecs, {
  CorePrimitiveExtensions,
} from "./wollok/natives/index.js";
import {
  YuBoolean,
  YuString,
} from "../../yukigo/dist/interpreter/primitives/index.js";
import { StepCommand } from "../../yukigo/dist/interpreter/components/kernel/commands.js";
import { inspect } from "util";

class UnexpectedToken extends Error {
  constructor(line: number, column: number, expectation: string) {
    super(
      `Parse error at line ${line} column ${column}: expected ${expectation}.`,
    );
  }
}
export class YukigoWollokParser implements YukigoParser {
  public errors: string[] = [];
  private prelude: AST;

  constructor() {
    const preludeParseRes = parse.File("example").parse([lang, lib].join("\n"));

    if (preludeParseRes.status === false)
      throw this.handleUnexpectedToken(preludeParseRes);

    const transformer = new WollokToYukigoTransformer();
    this.prelude = transformer.transform(preludeParseRes.value);

    this.errors = [];
  }

  public parse(code: string): AST {
    let cleanedCode = expandFixtures(code)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/#\s*\{\s*\}/g, "[]");

    if (!cleanedCode.includes("describe ") && !cleanedCode.includes("test ")) {
      cleanedCode = cleanedCode.replace(
        /const\s+(\w+)\s*=\s*new\s+(\w+)\((.*)\)/g,
        "object $1 inherits $2($3) {}",
      );
    }
    cleanedCode = cleanedCode.replace(
      /\.forEach\s*\{([^}]+)\}/g,
      (match, body) => {
        const flattenedBody = body.replace(/\n/g, " ");
        return `.forEach({${flattenedBody}})`;
      },
    );

    const fullCode = cleanedCode;
    const parserResult = parse.File("example").parse(fullCode);
    if (parserResult.status === false)
      throw this.handleUnexpectedToken(parserResult);
    const resultAST = parserResult.value;
    const transformer = new WollokToYukigoTransformer();
    //console.log(inspect(resultAST, false, null, true));

    const yukigoAst = transformer.transform(resultAST);

    return this.prelude.concat(yukigoAst);
  }
  public parseExpression(code: string): Expression {
    const parserResult = parse.Expression.parse(code);
    if (parserResult.status === false)
      throw this.handleUnexpectedToken(parserResult);
    const resultAST = parserResult.value;

    const transformer = new WollokToYukigoTransformer();
    const yukigoAst = transformer.transformExpr(resultAST);

    return yukigoAst;
  }
  private handleUnexpectedToken(result: Failure): UnexpectedToken {
    const { index, expected } = result;
    const expectation = expected.join(" or ");
    return new UnexpectedToken(index.line, index.column, expectation);
  }
}

function expandFixtures(code: string): string {
  let index = 0;
  while (true) {
    const descMatch = code.indexOf("describe ", index);
    if (descMatch === -1) break;

    const openBrace = code.indexOf("{", descMatch);
    if (openBrace === -1) {
      index = descMatch + 9;
      continue;
    }

    const closeBrace = findMatchingBrace(code, openBrace);
    if (closeBrace === -1) {
      index = descMatch + 9;
      continue;
    }

    const describeContent = code.substring(openBrace + 1, closeBrace);

    const fixtureIndex = describeContent.indexOf("fixture");
    if (fixtureIndex !== -1) {
      const fixtureOpen = describeContent.indexOf("{", fixtureIndex);
      if (fixtureOpen !== -1) {
        const fixtureClose = findMatchingBrace(describeContent, fixtureOpen);
        if (fixtureClose !== -1) {
          const fixtureBody = describeContent.substring(
            fixtureOpen + 1,
            fixtureClose,
          );

          let newDescContent =
            describeContent.substring(0, fixtureIndex) +
            describeContent.substring(fixtureClose + 1);

          let testIdx = 0;
          while (true) {
            const nextTest = newDescContent.indexOf("test ", testIdx);
            if (nextTest === -1) break;
            const testOpen = newDescContent.indexOf("{", nextTest);
            if (testOpen === -1) {
              testIdx = nextTest + 5;
              continue;
            }
            newDescContent =
              newDescContent.substring(0, testOpen + 1) +
              "\n" +
              fixtureBody +
              "\n" +
              newDescContent.substring(testOpen + 1);
            testIdx = testOpen + 1 + fixtureBody.length + 2;
          }

          code =
            code.substring(0, openBrace + 1) +
            newDescContent +
            code.substring(closeBrace);
        }
      }
    }

    index = closeBrace + 1;
  }
  return code;
}

function findMatchingBrace(str: string, openIndex: number): number {
  let count = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === "{") count++;
    else if (str[i] === "}") {
      count--;
      if (count === 0) return i;
    }
  }
  return -1;
}

const providers: Map<string, any> = buildWollokNativeProviders(nativeSpecs);
for (const [key, impl] of Object.entries(CorePrimitiveExtensions)) {
  providers.set(key, impl);
}

// 2. Envolvemos los retornos en StepCommand para cumplir con la firma de la infraestructura
providers.set(
  "YuNumber.printString",
  (rec) => new StepCommand(new YuString(String(rec.value))),
);
providers.set(
  "YuString.printString",
  (rec) => new StepCommand(new YuString(rec.value)),
);
providers.set(
  "YuBoolean.printString",
  (rec) => new StepCommand(new YuString(String(rec.value))),
);
providers.set(
  "YuArray.printString",
  (arr) => new StepCommand(new YuString(arr.toString())),
);
providers.set(
  "YuNumber.equals",
  (rec, args) =>
    new StepCommand(new YuBoolean(rec.value === (args[0] as any).value)),
);
providers.set(
  "YuString.contains",
  (rec, args) =>
    new StepCommand(new YuBoolean(rec.value.includes((args[0] as any).value))),
);

export { providers };
