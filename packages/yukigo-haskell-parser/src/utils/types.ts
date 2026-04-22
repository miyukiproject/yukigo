import { YukigoPrimitive } from "yukigo-ast";

export const keywords = [
  "type",
  "where",
  "in",
  "if",
  "else",
  "then",
  "data",
  "case",
  "error",
  "class",
  "do",
  "default",
  "deriving",
  "import",
  "infix",
  "infixl",
  "infixr",
  "instance",
  "let",
  "module",
  "newtype",
  "of",
  "qualified",
  "hiding",
  "foreign",
  "describe",
  "it",
  "shouldBe",
  "shouldNotBe",
  "shouldSatisfy",
  "shouldThrow"
];

export enum YUTYPES { // primitivos 
  YuNumber = "YuNumber", 
  YuString = "YuString", 
  YuChar = "YuChar", 
  YuBoolean = "YuBoolean", 
  YuNil = "YuNil", 
  // constructores 
  Tuple = "Tuple", 
  List = "List", 
  Arrow = "->" 
}

export const typeMappings: { [key: string]: YUTYPES } = {
  Float: YUTYPES.YuNumber,
  Double: YUTYPES.YuNumber,
  Int: YUTYPES.YuNumber,
  Integer: YUTYPES.YuNumber,
  String: YUTYPES.YuString,
  Char: YUTYPES.YuChar,
  Boolean: YUTYPES.YuBoolean,
  Bool: YUTYPES.YuBoolean,
};

export const typeClasses: Map<string, YUTYPES[]> = new Map([
  ["Bounded", [YUTYPES.YuChar, YUTYPES.YuNumber]],
  ["Enum", [YUTYPES.YuChar, YUTYPES.YuNumber]],
  ["Ord", [YUTYPES.YuNumber, YUTYPES.YuString, YUTYPES.YuChar]],
  ["Eq", [YUTYPES.YuNumber, YUTYPES.YuString, YUTYPES.YuChar, YUTYPES.YuBoolean]],
  ["Floating", [YUTYPES.YuNumber]],
  ["Fractional", [YUTYPES.YuNumber]],
  ["Integral", [YUTYPES.YuNumber]],
  ["Num", [YUTYPES.YuNumber]],
  ["Random", [YUTYPES.YuBoolean, YUTYPES.YuChar, YUTYPES.YuNumber]],
  ["Read", [YUTYPES.YuChar, YUTYPES.YuNumber]],
  
  ["Real", [YUTYPES.YuNumber]],
  ["RealFloat", [YUTYPES.YuNumber]],
  ["RealFrac", [YUTYPES.YuNumber]],
  ["Show", [YUTYPES.YuNumber, YUTYPES.YuString, YUTYPES.YuChar]],
  
]);