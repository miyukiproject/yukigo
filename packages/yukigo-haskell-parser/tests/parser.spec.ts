import { YukigoHaskellParser } from "../src/index.js";
import { assert } from "chai";
import { inspect } from "util";
import {
  Application,
  ArithmeticBinaryOperation,
  CharPrimitive,
  ComparisonOperation,
  ConsPattern,
  Constraint,
  Equation,
  Function,
  GuardedBody,
  If,
  LetInExpression,
  ListBinaryOperation,
  ListPrimitive,
  ListType,
  LiteralPattern,
  LogicalBinaryOperation,
  NumberPrimitive,
  Otherwise,
  ParameterizedType,
  RangeExpression,
  Return,
  Sequence,
  SimpleType,
  StringPrimitive,
  SymbolPrimitive,
  TypeAlias,
  TypeApplication,
  TypeCast,
  TypeSignature,
  UnguardedBody,
  VariablePattern,
} from "yukigo-ast";

const _deepEqual = assert.deepEqual;
assert.deepEqual = function (actual: any, expected: any, ...args: any[]) {
  function stripLoc(obj: any): any {
    if (Array.isArray(obj)) return obj.map(stripLoc);
    if (obj && typeof obj === "object") {
      const { loc, ...rest } = obj;
      return Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, stripLoc(v)])
      );
    }
    return obj;
  }
  return _deepEqual(stripLoc(actual), stripLoc(expected), ...args);
};

describe("Parser Tests", () => {
  let parser: YukigoHaskellParser;
  beforeEach(() => {
    parser = new YukigoHaskellParser("", { typecheck: false });
  });
  it("parses boolean expressions", () => {
    const returnExpression = new Return(
      new LogicalBinaryOperation(
        "And",
        new SymbolPrimitive("x"),
        new SymbolPrimitive("y")
      )
    );
    assert.deepEqual(parser.parse("f x y = x && y"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("x")),
            new VariablePattern(new SymbolPrimitive("y")),
          ],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses literal character patterns", () => {
    const returnExpression = new Return(new NumberPrimitive(1));
    assert.deepEqual(parser.parse("f 'a' = 1"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new LiteralPattern(new CharPrimitive("a"))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses literal string patterns", () => {
    const returnExpression = new Return(new NumberPrimitive(1));
    assert.deepEqual(parser.parse('f "hello world" = 1'), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new LiteralPattern(new StringPrimitive("hello world"))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses literal number patterns", () => {
    const returnExpression = new Return(new NumberPrimitive(1));
    assert.deepEqual(parser.parse("f 1 = 1"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new LiteralPattern(new NumberPrimitive(1))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses simple cons pattern", () => {
    const returnExpression = new Return(
      new ArithmeticBinaryOperation(
        "Plus",
        new SymbolPrimitive("x"),
        new Application(new SymbolPrimitive("f"), new SymbolPrimitive("xs"))
      )
    );
    assert.deepEqual(parser.parse("f (x:xs) = x + f xs"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [
            new ConsPattern(
              new VariablePattern(new SymbolPrimitive("x")),
              new VariablePattern(new SymbolPrimitive("xs"))
            ),
          ],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses multiple cons pattern", () => {
    const returnExpression = new Return(
      new ArithmeticBinaryOperation(
        "Plus",
        new SymbolPrimitive("x"),
        new Application(new SymbolPrimitive("f"), new SymbolPrimitive("xs"))
      )
    );
    assert.deepEqual(parser.parse("f (x:y:xs) = x + f xs"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [
            new ConsPattern(
              new VariablePattern(new SymbolPrimitive("x")),
              new ConsPattern(
                new VariablePattern(new SymbolPrimitive("y")),
                new VariablePattern(new SymbolPrimitive("xs"))
              )
            ),
          ],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses left infix partial application", () => {
    const returnExpression = new Return(
      new Application(new SymbolPrimitive("+"), new NumberPrimitive(1))
    );
    assert.deepEqual(parser.parse("f = (1+)"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses right infix partial application", () => {
    const returnExpression = new Return(
      new Application(
        new Application(new SymbolPrimitive("flip"), new SymbolPrimitive("+")),
        new NumberPrimitive(1)
      )
    );
    assert.deepEqual(parser.parse("f = (+1)"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses type restrictions", () => {
    assert.deepEqual(parser.parse("f :: Num a => [a] -> [a]"), [
      new TypeSignature(
        new SymbolPrimitive("f"),
        new ParameterizedType(
          [new ListType(new SimpleType("a", []), [])],
          new ListType(new SimpleType("a", []), []),
          [new Constraint("Num", [new SimpleType("a", [])])]
        )
      ),
    ]);
  });
  it("parses multiple type restrictions", () => {
    assert.deepEqual(parser.parse("f :: (Num a, Eq b) => [a] -> [b]"), [
      new TypeSignature(
        new SymbolPrimitive("f"),
        new ParameterizedType(
          [new ListType(new SimpleType("a", []), [])],
          new ListType(new SimpleType("b", []), []),
          [
            new Constraint("Num", [new SimpleType("a", [])]),
            new Constraint("Eq", [new SimpleType("b", [])]),
          ]
        )
      ),
    ]);
  });
  it("parses signatures without type restrictions", () => {
    assert.deepEqual(parser.parse("f :: [a] -> [a]"), [
      new TypeSignature(
        new SymbolPrimitive("f"),
        new ParameterizedType(
          [new ListType(new SimpleType("a", []), [])],
          new ListType(new SimpleType("a", []), []),
          []
        )
      ),
    ]);
  });
  it("parses type alias", () => {
    assert.deepEqual(parser.parse("type String = [Char]"), [
      new TypeAlias(
        new SymbolPrimitive("String"),
        [],
        new ListType(new SimpleType("Char", []), [])
      ),
    ]);
  });
  it("parses type alias with arguments", () => {
    assert.deepEqual(parser.parse("type List a = [a]"), [
      new TypeAlias(
        new SymbolPrimitive("List"),
        ["a"],
        new ListType(new SimpleType("a", []), [])
      ),
    ]);
  });
  it("parses inline type annotations", () => {
    const returnExpression = new Return(
      new TypeCast(new NumberPrimitive(1), new SimpleType("Int", []))
    );
    assert.deepEqual(parser.parse("x = 1 :: Int"), [
      new Function(new SymbolPrimitive("x"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses inline type annotations with restrictions", () => {
    const returnExpression = new Return(
      new TypeCast(
        new NumberPrimitive(1),
        new ParameterizedType(
          [],
          new TypeApplication(new SimpleType("t", []), new SimpleType("a", [])),
          [
            new Constraint("Num", [new SimpleType("a", [])]),
            new Constraint("Foldable", [new SimpleType("t", [])]),
          ]
        )
      )
    );
    assert.deepEqual(parser.parse("x = 1 :: (Num a, Foldable t) => t a"), [
      new Function(new SymbolPrimitive("x"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses chars and single char strings differently", () => {
    const stringAst: any = parser.parse('x = "a"');
    const charAst: any = parser.parse("x = 'a'");
    const stringExpr = stringAst[0].equations[0].returnExpr.body;
    const charExpr = charAst[0].equations[0].returnExpr.body;
    assert.instanceOf(stringExpr, StringPrimitive);
    assert.instanceOf(charExpr, CharPrimitive);
  });
  it("parses chars as YuChars", () => {
    const returnExpression = new Return(new CharPrimitive("a"));
    assert.deepEqual(parser.parse("x = 'a'"), [
      new Function(new SymbolPrimitive("x"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses concat of list as ListBinaryOperation", () => {
    const returnExpression = new Return(
      new ListBinaryOperation(
        "Concat",
        new ListPrimitive([new NumberPrimitive(2)]),
        new ListPrimitive([new NumberPrimitive(4)])
      )
    );
    assert.deepEqual(parser.parse("f = [2] ++ [4]"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses inline guards correctly", () => {
    assert.deepEqual(parser.parse("f x | x > 40 = 2 | otherwise = 1"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("x"))],
          [
            new GuardedBody(
              new ComparisonOperation(
                "GreaterThan",
                new SymbolPrimitive("x"),
                new NumberPrimitive(40)
              ),
              new NumberPrimitive(2)
            ),
            new GuardedBody(new Otherwise(), new NumberPrimitive(1)),
          ]
        ),
      ]),
    ]);
  });
  it("throws when guarded body is badly indented ", () => {
    assert.throw(
      () => parser.parse("f x | x < 1 = 10\n| x > 11 = 0"),
      "Parser: Unexpected 'pipe' token '|' at line 2 col 1."
    );
  });
  it("parses multi-line guards correctly", () => {
    const ast = [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("x"))],
          [
            new GuardedBody(
              new ComparisonOperation(
                "GreaterThan",
                new SymbolPrimitive("x"),
                new NumberPrimitive(40)
              ),
              new NumberPrimitive(2)
            ),
            new GuardedBody(new Otherwise(), new NumberPrimitive(1)),
          ]
        ),
      ]),
    ];

    assert.deepEqual(parser.parse("f x\n | x > 40 = 2\n | otherwise = 1"), ast);
    assert.deepEqual(parser.parse("f x\n | x > 40 = 2 | otherwise = 1"), ast);
    assert.deepEqual(parser.parse("f x | x > 40 = 2\n | otherwise = 1"), ast);
    assert.deepEqual(
      parser.parse("f x\n |\n x > 40 =\n 2 |\n otherwise\n =\n 1"),
      ast
    );
    assert.deepEqual(
      parser.parse("f x\n |\n x > 40 =\n 2 | otherwise = 1"),
      ast
    );
    assert.deepEqual(
      parser.parse("f x | x > 40 = 2 |\n otherwise\n =\n 1"),
      ast
    );
  });
  it("parses inline if then else correctly", () => {
    const returnExpression = new Return(
      new If(
        new ComparisonOperation(
          "LessThan",
          new SymbolPrimitive("x"),
          new NumberPrimitive(4)
        ),
        new NumberPrimitive(10),
        new NumberPrimitive(20)
      )
    );
    assert.deepEqual(parser.parse("f x = if x < 4 then 10 else 20"), [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("x"))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses multi-line if then else correctly", () => {
    const returnExpression = new Return(
      new If(
        new ComparisonOperation(
          "LessThan",
          new SymbolPrimitive("x"),
          new NumberPrimitive(4)
        ),
        new NumberPrimitive(10),
        new NumberPrimitive(20)
      )
    );
    const ast = [
      new Function(new SymbolPrimitive("f"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("x"))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ];

    assert.deepEqual(parser.parse("f x =\n if x < 4 then 10 else 20"), ast);
    assert.deepEqual(parser.parse("f x = if x < 4\n then 10\n else 20"), ast);
    assert.deepEqual(parser.parse("f x = \n if x < 4\nthen 10\n else 20"), ast);
    assert.deepEqual(parser.parse("f x = \n if x < 4\n then 10\nelse 20"), ast);
    assert.deepEqual(
      parser.parse("f x = \n if x < 4\n then 10\n else 20"),
      ast
    );
  });
  it("parses inline where clause correctly", () => {
    const returnExpression = new Return(
      new ArithmeticBinaryOperation(
        "Multiply",
        new SymbolPrimitive("pi"),
        new SymbolPrimitive("radius_squared")
      )
    );
    assert.deepEqual(
      parser.parse(
        "areaOfCircle radius = pi * radius_squared where pi = 3.14159; radius_squared = radius * radius"
      ),
      [
        new Function(new SymbolPrimitive("areaOfCircle"), [
          new Equation(
            [new VariablePattern(new SymbolPrimitive("radius"))],
            new UnguardedBody(
              new Sequence([
                new Function(new SymbolPrimitive("pi"), [
                  new Equation(
                    [],
                    new UnguardedBody(
                      new Sequence([new Return(new NumberPrimitive(3.14159))])
                    ),
                    new Return(new NumberPrimitive(3.14159))
                  ),
                ]),
                new Function(new SymbolPrimitive("radius_squared"), [
                  new Equation(
                    [],
                    new UnguardedBody(
                      new Sequence([
                        new Return(
                          new ArithmeticBinaryOperation(
                            "Multiply",
                            new SymbolPrimitive("radius"),
                            new SymbolPrimitive("radius")
                          )
                        ),
                      ])
                    ),
                    new Return(
                      new ArithmeticBinaryOperation(
                        "Multiply",
                        new SymbolPrimitive("radius"),
                        new SymbolPrimitive("radius")
                      )
                    )
                  ),
                ]),
                returnExpression,
              ])
            ),
            returnExpression
          ),
        ]),
      ]
    );
  });
  it("parses multi-line where clause correctly", () => {
    const returnExpression = new Return(
      new ArithmeticBinaryOperation(
        "Multiply",
        new SymbolPrimitive("pi"),
        new SymbolPrimitive("radius_squared")
      )
    );
    const ast = [
      new Function(new SymbolPrimitive("areaOfCircle"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("radius"))],
          new UnguardedBody(
            new Sequence([
              new Function(new SymbolPrimitive("pi"), [
                new Equation(
                  [],
                  new UnguardedBody(
                    new Sequence([new Return(new NumberPrimitive(3.14159))])
                  ),
                  new Return(new NumberPrimitive(3.14159))
                ),
              ]),
              new Function(new SymbolPrimitive("radius_squared"), [
                new Equation(
                  [],
                  new UnguardedBody(
                    new Sequence([
                      new Return(
                        new ArithmeticBinaryOperation(
                          "Multiply",
                          new SymbolPrimitive("radius"),
                          new SymbolPrimitive("radius")
                        )
                      ),
                    ])
                  ),
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("radius"),
                      new SymbolPrimitive("radius")
                    )
                  )
                ),
              ]),
              returnExpression,
            ])
          ),
          returnExpression
        ),
      ]),
    ];

    assert.deepEqual(
      parser.parse(
        `areaOfCircle radius = pi * radius_squared
  where pi = 3.14159
        radius_squared = radius * radius`
      ),
      ast
    );
  });
  it("parses inline let...in expression correctly", () => {
    const returnExpression = new Return(
      new LetInExpression(
        new Sequence([
          new Function(new SymbolPrimitive("a_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("a"),
                      new SymbolPrimitive("a")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("a"),
                  new SymbolPrimitive("a")
                )
              )
            ),
          ]),
          new Function(new SymbolPrimitive("b_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("b"),
                      new SymbolPrimitive("b")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("b"),
                  new SymbolPrimitive("b")
                )
              )
            ),
          ]),
          new Function(new SymbolPrimitive("sum_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Plus",
                      new SymbolPrimitive("a_sq"),
                      new SymbolPrimitive("b_sq")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Plus",
                  new SymbolPrimitive("a_sq"),
                  new SymbolPrimitive("b_sq")
                )
              )
            ),
          ]),
        ]),
        new Application(
          new SymbolPrimitive("sqrt"),
          new SymbolPrimitive("sum_sq")
        )
      )
    );
    assert.deepEqual(
      parser.parse(
        `hypotenuse a b = let a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq in sqrt sum_sq`
      ),
      [
        new Function(new SymbolPrimitive("hypotenuse"), [
          new Equation(
            [
              new VariablePattern(new SymbolPrimitive("a")),
              new VariablePattern(new SymbolPrimitive("b")),
            ],
            new UnguardedBody(new Sequence([returnExpression])),
            returnExpression
          ),
        ]),
      ]
    );
  });
  it("parses multi-line let...in clause correctly", () => {
    const returnExpression = new Return(
      new LetInExpression(
        new Sequence([
          new Function(new SymbolPrimitive("a_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("a"),
                      new SymbolPrimitive("a")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("a"),
                  new SymbolPrimitive("a")
                )
              )
            ),
          ]),
          new Function(new SymbolPrimitive("b_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Multiply",
                      new SymbolPrimitive("b"),
                      new SymbolPrimitive("b")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("b"),
                  new SymbolPrimitive("b")
                )
              )
            ),
          ]),
          new Function(new SymbolPrimitive("sum_sq"), [
            new Equation(
              [],
              new UnguardedBody(
                new Sequence([
                  new Return(
                    new ArithmeticBinaryOperation(
                      "Plus",
                      new SymbolPrimitive("a_sq"),
                      new SymbolPrimitive("b_sq")
                    )
                  ),
                ])
              ),
              new Return(
                new ArithmeticBinaryOperation(
                  "Plus",
                  new SymbolPrimitive("a_sq"),
                  new SymbolPrimitive("b_sq")
                )
              )
            ),
          ]),
        ]),
        new Application(
          new SymbolPrimitive("sqrt"),
          new SymbolPrimitive("sum_sq")
        )
      )
    );
    const ast = [
      new Function(new SymbolPrimitive("hypotenuse"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("a")),
            new VariablePattern(new SymbolPrimitive("b")),
          ],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ];

    assert.deepEqual(
      parser.parse(
        "hypotenuse a b =\n let a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq in sqrt sum_sq"
      ),
      ast
    );
    assert.deepEqual(
      parser.parse(
        "hypotenuse a b =\n let\n a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq in sqrt sum_sq"
      ),
      ast
    );
    assert.deepEqual(
      parser.parse(
        "hypotenuse a b =\n let\n a_sq = a * a\n b_sq = b * b\n sum_sq = a_sq + b_sq in sqrt sum_sq"
      ),
      ast
    );
    assert.deepEqual(
      parser.parse(
        "hypotenuse a b =\n let\n a_sq = a * a\n b_sq = b * b\n sum_sq = a_sq + b_sq\n in sqrt sum_sq"
      ),
      ast
    );
    assert.deepEqual(
      parser.parse(
        "hypotenuse a b =\n let\n a_sq = a * a\n b_sq = b * b\n sum_sq = a_sq + b_sq\n in\n sqrt sum_sq"
      ),
      ast
    );
  });
  it("parses partial infix operators", () => {
    const code = `doble numero = (*) numero 2`;
    const ast = parser.parse(code);
    const returnExpression = new Return(
      new Application(
        new Application(
          new SymbolPrimitive("*"),
          new SymbolPrimitive("numero")
        ),
        new NumberPrimitive(2)
      )
    );
    assert.deepEqual(ast, [
      new Function(new SymbolPrimitive("doble"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("numero"))],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
  it("parses range expression", () => {
    const code = `oneToTen = [1..10]`;
    const ast = parser.parse(code);
    const returnExpression = new Return(
      new RangeExpression(new NumberPrimitive(1), new NumberPrimitive(10))
    );
    assert.deepEqual(ast, [
      new Function(new SymbolPrimitive("oneToTen"), [
        new Equation(
          [],
          new UnguardedBody(new Sequence([returnExpression])),
          returnExpression
        ),
      ]),
    ]);
  });
});
