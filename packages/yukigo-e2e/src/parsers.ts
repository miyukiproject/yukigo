import { AST } from "yukigo-ast";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { YukigoPrologParser } from "yukigo-prolog-parser";
import { YukigoWollokParser } from "yukigo-wollok-parser";

export const parsers: Record<string, (code: string) => AST> = {
  haskell: new YukigoHaskellParser().parse,
  prolog: new YukigoPrologParser().parse,
  wollok: new YukigoWollokParser().parse,
};
