import { describe, it } from "mocha";
import { assert } from "chai";
import { YukigoPrologParser } from "../src/index.js";
import { inspect } from "util";
import { readFileSync } from "fs";
import {
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  AssignOperation,
  ComparisonOperation,
  Exist,
  Fact,
  Findall,
  Forall,
  FunctorPattern,
  If,
  ListPrimitive,
  ListPattern,
  ConsExpression,
  ConsPattern,
  LiteralPattern,
  Not,
  NumberPrimitive,
  Return,
  Rule,
  Sequence,
  SymbolPrimitive,
  TuplePattern,
  UnifyOperation,
  VariablePattern,
  WildcardPattern,
  YukigoParser,
  Equation,
  UnguardedBody,
} from "yukigo-ast";
import { stdCode } from "../src/std.js";
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

describe("Parser Test", () => {
  let parser: YukigoParser;
  beforeEach(() => {
    parser = new YukigoPrologParser("");
  });
  it("std.pl", () => {
    assert.doesNotThrow(() => parser.parse(stdCode));
  });
  it("simplest fact/0", () => {
    assert.deepEqual(parser.parse("foo."), [
      new Fact(new SymbolPrimitive("foo"), []),
    ]);
  });
  it("simplest fact/1", () => {
    assert.deepEqual(parser.parse("foo(bar)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
    ]);
  });
  it("literal integer", () => {
    assert.deepEqual(parser.parse("foo(3)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new NumberPrimitive(3)),
      ]),
    ]);
  });
  it("literal float", () => {
    assert.deepEqual(parser.parse("foo(3.4)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new NumberPrimitive(3.4)),
      ]),
    ]);
  });
  it("wildcard", () => {
    assert.deepEqual(parser.parse("foo(_)."), [
      new Fact(new SymbolPrimitive("foo"), [new WildcardPattern()]),
    ]);
  });
  it("multiple facts", () => {
    assert.deepEqual(parser.parse("foo(bar).baz(bar)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
      new Fact(new SymbolPrimitive("baz"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
    ]);
  });
  it("multiple facts, whitespaces separated", () => {
    assert.deepEqual(parser.parse("foo(bar). baz(bar)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
      new Fact(new SymbolPrimitive("baz"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
    ]);
  });
  it("multiple facts, newline separated", () => {
    assert.deepEqual(parser.parse("foo(bar).\nbaz(bar)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
      new Fact(new SymbolPrimitive("baz"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
      ]),
    ]);
  });
  it("simplest fact/2", () => {
    assert.deepEqual(parser.parse("foo(bar, baz)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new LiteralPattern(new SymbolPrimitive("bar")),
        new LiteralPattern(new SymbolPrimitive("baz")),
      ]),
    ]);
  });
  it("simplest rule/1", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([new Exist(new SymbolPrimitive("foo"), [])])
          )
        ),
      ]),
    ]);
  });
  it("simplest rule/0", () => {
    assert.deepEqual(parser.parse("baz:-foo."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [],
          new UnguardedBody(
            new Sequence([new Exist(new SymbolPrimitive("foo"), [])])
          )
        ),
      ]),
    ]);
  });
  it("rules with withiespaces", () => {
    assert.deepEqual(
      parser.parse("baz:-foo(X), baz(X,Y)."),
      parser.parse("baz :- foo( X) ,baz( X , Y) .")
    );
  });
  it("rules with bang", () => {
    assert.deepEqual(parser.parse("baz:-fail,!."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("fail"), []),
              new Exist(new SymbolPrimitive("!"), []),
            ])
          )
        ),
      ]),
    ]);
  });
  it("simplest rule/1 with condition/1", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo(bar)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("fact with functors", () => {
    assert.deepEqual(parser.parse("foo(f(bar))."), [
      new Fact(new SymbolPrimitive("foo"), [
        new FunctorPattern(new SymbolPrimitive("f"), [
          new LiteralPattern(new SymbolPrimitive("bar")),
        ]),
      ]),
    ]);
  });
  it("fact with functor with variables", () => {
    assert.deepEqual(parser.parse("foo(f(X))."), [
      new Fact(new SymbolPrimitive("foo"), [
        new FunctorPattern(new SymbolPrimitive("f"), [
          new VariablePattern(new SymbolPrimitive("X")),
        ]),
      ]),
    ]);
  });
  it("fact with multiple variables", () => {
    assert.deepEqual(parser.parse("foo(X, Y)."), [
      new Fact(new SymbolPrimitive("foo"), [
        new VariablePattern(new SymbolPrimitive("X")),
        new VariablePattern(new SymbolPrimitive("Y")),
      ]),
    ]);
  });
  it("multiple rules", () => {
    assert.deepEqual(
      parser.parse("baz(bar) :- foo(bar).foo(bar) :- bar(bar)."),
      [
        new Rule(new SymbolPrimitive("baz"), [
          new Equation(
            [new LiteralPattern(new SymbolPrimitive("bar"))],
            new UnguardedBody(
              new Sequence([
                new Exist(new SymbolPrimitive("foo"), [
                  new LiteralPattern(new SymbolPrimitive("bar")),
                ]),
              ])
            )
          ),
        ]),
        new Rule(new SymbolPrimitive("foo"), [
          new Equation(
            [new LiteralPattern(new SymbolPrimitive("bar"))],
            new UnguardedBody(
              new Sequence([
                new Exist(new SymbolPrimitive("bar"), [
                  new LiteralPattern(new SymbolPrimitive("bar")),
                ]),
              ])
            )
          ),
        ]),
      ]
    );
  });
  it("simplest rule/2 with condition/2", () => {
    assert.deepEqual(parser.parse("baz(bar,fux):-foo(bar,goo)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new LiteralPattern(new SymbolPrimitive("bar")),
            new LiteralPattern(new SymbolPrimitive("fux")),
          ],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
                new LiteralPattern(new SymbolPrimitive("goo")),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with not", () => {
    assert.deepEqual(parser.parse("baz(X):-not(bar(X))."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new Not([
                new Exist(new SymbolPrimitive("bar"), [
                  new VariablePattern(new SymbolPrimitive("X")),
                ]),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rules with infix not", () => {
    assert.deepEqual(parser.parse("baz(X):-\\+ bar(X)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new Not([
                new Exist(new SymbolPrimitive("bar"), [
                  new VariablePattern(new SymbolPrimitive("X")),
                ]),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with complex not", () => {
    assert.deepEqual(parser.parse("baz(X):-not((bar(X), baz(Y)))."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new Not([
                new Sequence([
                  new Exist(new SymbolPrimitive("bar"), [
                    new VariablePattern(new SymbolPrimitive("X")),
                  ]),
                  new Exist(new SymbolPrimitive("baz"), [
                    new VariablePattern(new SymbolPrimitive("Y")),
                  ]),
                ]),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with forall", () => {
    assert.deepEqual(parser.parse("baz(X):- forall(bar(X), bar(X))."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new Forall(
                new Exist(new SymbolPrimitive("bar"), [
                  new VariablePattern(new SymbolPrimitive("X")),
                ]),

                new Exist(new SymbolPrimitive("bar"), [
                  new VariablePattern(new SymbolPrimitive("X")),
                ])
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with findall", () => {
    assert.deepEqual(parser.parse("baz(X):- findall(Y, bar(X, Y), Z)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new Findall(
                new Exist(new SymbolPrimitive("Y"), []),
                new Exist(new SymbolPrimitive("bar"), [
                  new VariablePattern(new SymbolPrimitive("X")),
                  new VariablePattern(new SymbolPrimitive("Y")),
                ]),
                new Exist(new SymbolPrimitive("Z"), [])
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with major", () => {
    assert.deepEqual(parser.parse("baz(X):- X > 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "GreaterThan",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with minor", () => {
    assert.deepEqual(parser.parse("baz(X):- X < 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "LessThan",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with greater or equal", () => {
    assert.deepEqual(parser.parse("baz(X):- X >= 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "GreaterOrEqualThan",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with minor or equal", () => {
    assert.deepEqual(parser.parse("baz(X):- X =< 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "LessOrEqualThan",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with distinct", () => {
    assert.deepEqual(parser.parse("baz(X):- X \\= 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "NotSame",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with unify operator", () => {
    assert.deepEqual(parser.parse("baz(X):- X = 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new UnifyOperation(
                "Unify",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with simple is", () => {
    assert.deepEqual(parser.parse("baz(X):- X is 4."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with is with parenthesis", () => {
    assert.deepEqual(parser.parse("baz(X):- X is (4)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new NumberPrimitive(4)
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("fact/1 with tuples", () => {
    assert.deepEqual(parser.parse("baz((1, 2))."), [
      new Fact(new SymbolPrimitive("baz"), [
        new TuplePattern([
          new LiteralPattern(new NumberPrimitive(1)),
          new LiteralPattern(new NumberPrimitive(2)),
        ]),
      ]),
    ]);
  });
  it("rule/1 with is and -", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is Y - 5  ."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticBinaryOperation(
                  "Minus",
                  new SymbolPrimitive("Y"),
                  new NumberPrimitive(5)
                )
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with is and +", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is Y + 5."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticBinaryOperation(
                  "Plus",
                  new SymbolPrimitive("Y"),
                  new NumberPrimitive(5)
                )
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with =:=", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X =:= Y."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "Equal",
                new SymbolPrimitive("X"),
                new SymbolPrimitive("Y")
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with ==", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X == Y."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "Same",
                new SymbolPrimitive("X"),
                new SymbolPrimitive("Y")
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with is and parenthesis", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is (Y / 5) + 20."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticBinaryOperation(
                  "Plus",
                  new ArithmeticBinaryOperation(
                    "Divide",
                    new SymbolPrimitive("Y"),
                    new NumberPrimitive(5)
                  ),
                  new NumberPrimitive(20)
                )
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with is and functions", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is f(Y)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new Exist(new SymbolPrimitive("f"), [
                  new VariablePattern(new SymbolPrimitive("Y")),
                ])
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with round function", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is round(3.5)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticUnaryOperation("Round", new NumberPrimitive(3.5))
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with abs function", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is abs(-3.5)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticUnaryOperation(
                  "Absolute",
                  new ArithmeticUnaryOperation(
                    "Negation",
                    new NumberPrimitive(3.5)
                  )
                )
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with sqrt function", () => {
    assert.deepEqual(parser.parse("baz(X, Y):- X is sqrt(3.5)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [
            new VariablePattern(new SymbolPrimitive("X")),
            new VariablePattern(new SymbolPrimitive("Y")),
          ],
          new UnguardedBody(
            new Sequence([
              new AssignOperation(
                "Assign",
                new SymbolPrimitive("X"),
                new ArithmeticUnaryOperation("Sqrt", new NumberPrimitive(3.5))
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with > and math", () => {
    assert.deepEqual(parser.parse("baz(X):- X + 50 > x * 2."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new VariablePattern(new SymbolPrimitive("X"))],
          new UnguardedBody(
            new Sequence([
              new ComparisonOperation(
                "GreaterThan",
                new ArithmeticBinaryOperation(
                  "Plus",
                  new SymbolPrimitive("X"),
                  new NumberPrimitive(50)
                ),
                new ArithmeticBinaryOperation(
                  "Multiply",
                  new SymbolPrimitive("x"),
                  new NumberPrimitive(2)
                )
              ),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with multiple conditions", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo(bar),goo(bar)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
              new Exist(new SymbolPrimitive("goo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with multiple conditions", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo(bar) ; goo(bar)."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
              new Exist(new SymbolPrimitive("goo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with multiple mixed conditions", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo(bar),goo(bar),baz."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
              new Exist(new SymbolPrimitive("goo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
              new Exist(new SymbolPrimitive("baz"), []),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with whitespaces among individuals", () => {
    assert.deepEqual(parser.parse("baz(bar):-foo(bar, baz) , goo(bar), baz."), [
      new Rule(new SymbolPrimitive("baz"), [
        new Equation(
          [new LiteralPattern(new SymbolPrimitive("bar"))],
          new UnguardedBody(
            new Sequence([
              new Exist(new SymbolPrimitive("foo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
                new LiteralPattern(new SymbolPrimitive("baz")),
              ]),
              new Exist(new SymbolPrimitive("goo"), [
                new LiteralPattern(new SymbolPrimitive("bar")),
              ]),
              new Exist(new SymbolPrimitive("baz"), []),
            ])
          )
        ),
      ]),
    ]);
  });
  it("rule/1 with if-then-else construct", () => {
    assert.deepEqual(
      parser.parse(
        `classify_number(X, Classification) :- ( X > 0 -> Classification = positive ; ( X < 0 -> Classification = negative ; Classification = zero )).`
      ),
      [
        new Rule(new SymbolPrimitive("classify_number"), [
          new Equation(
            [
              new VariablePattern(new SymbolPrimitive("X")),
              new VariablePattern(new SymbolPrimitive("Classification")),
            ],
            new UnguardedBody(
              new Sequence([
                new If(
                  new ComparisonOperation(
                    "GreaterThan",
                    new SymbolPrimitive("X"),
                    new NumberPrimitive(0)
                  ),
                  new UnifyOperation(
                    "Unify",
                    new SymbolPrimitive("Classification"),
                    new SymbolPrimitive("positive")
                  ),
                  new If(
                    new ComparisonOperation(
                      "LessThan",
                      new SymbolPrimitive("X"),
                      new NumberPrimitive(0)
                    ),
                    new UnifyOperation(
                      "Unify",
                      new SymbolPrimitive("Classification"),
                      new SymbolPrimitive("negative")
                    ),
                    new UnifyOperation(
                      "Unify",
                      new SymbolPrimitive("Classification"),
                      new SymbolPrimitive("zero")
                    )
                  )
                ),
              ])
            )
          ),
        ]),
      ]
    );
  });
  it("rule/1 with multiple whitespaces", () => {
    const expectedAST = parser.parse("baz(bar) :- foo(bar), goo(bar), baz.");

    assert.deepEqual(
      parser.parse("baz(bar):-foo(bar) , goo(bar), baz."),
      expectedAST
    );
    assert.deepEqual(
      parser.parse("baz(bar) :- foo(bar) , goo(bar) , baz."),
      expectedAST
    );
    assert.deepEqual(
      parser.parse("baz(bar) :- foo( bar ) , goo( bar ) , baz."),
      expectedAST
    );
    assert.deepEqual(
      parser.parse("baz( bar ) :- foo( bar ) , goo( bar ) , baz."),
      expectedAST
    );
    assert.deepEqual(
      parser.parse("baz( bar ) :- \n foo( bar ) , \n goo( bar ), \n  baz."),
      expectedAST
    );
    assert.deepEqual(
      parser.parse("baz(bar) :-\n  foo(bar),\n  goo(bar),\n  baz.\n"),
      expectedAST
    );
  });
  it("can handle single line comments", () => {
    assert.deepEqual(
      parser.parse("%this is a comment\r\nfoo. %this is another comment"),
      [new Fact(new SymbolPrimitive("foo"), [])]
    );
  });
  it("can handle multi line comments", () => {
    const code = `
/*
  this is a
  multiline comment
*/
foo.`;
    assert.deepEqual(parser.parse(code), [
      new Fact(new SymbolPrimitive("foo"), []),
    ]);
  });
  it("there can be characters in the same line as multiline comment delimiter", () => {
    const code = `/*something
  this is a
  multiline comment
something else*/
foo.`;
    assert.deepEqual(parser.parse(code), [
      new Fact(new SymbolPrimitive("foo"), []),
    ]);
  });
  describe("List and Cons", () => {
    it("list pattern [1, 2, 3]", () => {
      assert.deepEqual(parser.parse("foo([1, 2, 3])."), [
        new Fact(new SymbolPrimitive("foo"), [
          new ListPattern([
            new LiteralPattern(new NumberPrimitive(1)),
            new LiteralPattern(new NumberPrimitive(2)),
            new LiteralPattern(new NumberPrimitive(3)),
          ]),
        ]),
      ]);
    });
    it("cons pattern [H|T]", () => {
      assert.deepEqual(parser.parse("foo([H|T])."), [
        new Fact(new SymbolPrimitive("foo"), [
          new ConsPattern(
            new VariablePattern(new SymbolPrimitive("H")),
            new VariablePattern(new SymbolPrimitive("T"))
          ),
        ]),
      ]);
    });
    it("complex cons pattern [H1, H2 | T]", () => {
      assert.deepEqual(parser.parse("foo([H1, H2 | T])."), [
        new Fact(new SymbolPrimitive("foo"), [
          new ConsPattern(
            new VariablePattern(new SymbolPrimitive("H1")),
            new ConsPattern(
              new VariablePattern(new SymbolPrimitive("H2")),
              new VariablePattern(new SymbolPrimitive("T"))
            )
          ),
        ]),
      ]);
    });
    it("list expression [1, 2, 3]", () => {
      assert.deepEqual(parser.parse("foo :- X = [1, 2, 3]."), [
        new Rule(new SymbolPrimitive("foo"), [
          new Equation(
            [],
            new UnguardedBody(
              new Sequence([
                new UnifyOperation(
                  "Unify",
                  new SymbolPrimitive("X"),
                  new ListPrimitive([
                    new NumberPrimitive(1),
                    new NumberPrimitive(2),
                    new NumberPrimitive(3),
                  ])
                ),
              ])
            )
          ),
        ]),
      ]);
    });
    it("cons expression [1, 2 | T]", () => {
      assert.deepEqual(parser.parse("foo :- X = [1, 2 | T]."), [
        new Rule(new SymbolPrimitive("foo"), [
          new Equation(
            [],

            new UnguardedBody(
              new Sequence([
                new UnifyOperation(
                  "Unify",
                  new SymbolPrimitive("X"),
                  new ConsExpression(
                    new NumberPrimitive(1),
                    new ConsExpression(
                      new NumberPrimitive(2),
                      new SymbolPrimitive("T")
                    )
                  )
                ),
              ])
            )
          ),
        ]),
      ]);
    });
  });
});
