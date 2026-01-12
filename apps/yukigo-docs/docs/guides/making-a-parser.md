# How to make a Yukigo parser

In this tutorial we will cover some basics on making a parser compatible with the yukigo analyzer.

By the end of this tutorial, you will be able to:
- Set up a nearley-based parser with TypeScript
- Design a lexer using `moo`
- Write grammar rules with proper operator precedence and associativity
- Use postprocessors to build a Yukigo-compatible AST
- Implement support for variables, functions, lists, conditionals, and loops
- Write and run unit tests for your parser

## Set up

First, let's check what yukigo expects from a parser.

```ts
interface YukigoParser {
  errors?: string[];
  parse: (code: string) => AST;
}
```

Every parser needs to expose a `parse` method and can also include an errors array. The internal checks or functionality isn't important to Yukigo. For example, if the language is typed, we could add a type checker step before returning the parsed AST.

For this tutorial we will be implementing a parser for a subset of [mini-lang](https://github.com/mini-lang/mini-lang). We will cover expressions, statements, control flow, functions, etc.

We will be using [nearley.js](https://nearley.js.org/) as our parser generator, but feel free to use any tool you find convenient.

Let's start a new Yukigo Parser project with `create-yukigo-parser`.

```sh
mkdir yukigo-mini-parser
cd yukigo-mini-parser
npx create-yukigo-parser
```
```
Need to install the following packages:
create-yukigo-parser@0.1.1
Ok to proceed? (y)

✔ Project Name: mini

✨ Starting project setup for: yukigo-mini-parser

📁 Setting up project in ~/yukigo-mini-parser...
✅ Initial project setted up correctly.
✔ Do you want to initialize a git repository with the name 'yukigo-mini-parser'? No
✔ Do you want to install dependencies automatically? Yes

-----------------------------------------------------------------------------------
Success! Project yukigo-mini-parser is ready.
-----------------------------------------------------------------------------------

Next steps:
1. cd yukigo-mini-parser
2. Start coding: npm start (or npm run build)

Happy parsing! :)
```

You can choose to initialize the repository or install dependencies as you like.

## Lexer

Great! We have a base to work on. Now let's work on the lexer, this is the component reponsible for lexical tokenization, the process where a set of characters is grouped and converted into meaningful tokens.

In the `src/lexer.ts` file, let's define the meaningful tokens in our language:
```ts
import moo from "moo";
import { makeLexer } from "moo-ignore";

const keywords = []

export const MiniLexerConfig = {
  EOF: "*__EOF__*",
  wildcard: "_",
  WS: /[ \t]+/,
  comment: /--.*?$|{-[\s\S]*?-}/,
  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: /"(?:\\["\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^"\\\n\r])*"/,
  bool: {
    match: ["True", "False"],
  },
  semicolon: ";",
  assign: ":=",
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
    type: moo.keywords({
      keyword: keywords,
    }),
  },
  NL: { match: /\r?\n/, lineBreaks: true },
};

export const MiniLexer = makeLexer(MiniLexerConfig, [], {
  eof: true,
});
```
As you can see, we have defined primitive tokens like `number`, `string`, `char`, `bool`. We also defined how a `variable` looks like and some `keywords`. The tokens for whitespace (`WS`), newline (`NL`), end-of-file (`EOF`) will be useful when designing our grammar.

> We need to define every token that our lexer should expect. That's why we defined `assign` and `semicolon`

## Grammar

Now let's start with the grammar file.
Make a `src/grammar.ne` file and add this boilerplate for now

```nearley
@{%
import { MiniLexer } from "./lexer.js"
%}

@preprocessor typescript
@lexer MiniLexer

program -> %WS {% (d) => d %}

_ -> %WS:* {% d => null %}
__ -> %WS:+ {% d => null %}
```

> `_` and `__` are rules to match zero-or-more and one-or-more whitespaces. 

> nearley.js allows us to use [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) operators `:+`, `:*`, `:?`


Let's start small by supporting variable assignment, we want to be able to assign and declare variables like this
```
int x := 10;
```
So we need to add multiple things first. As we see, the assignment statement is composed of a `type` a `variable` and an optional `expression` (we want to support `int x;` also)

Let's modify our `program` rule and add a `statement` rule that we can later expand
```ne
program -> statement:+ _ %EOF

statement -> assignment _ ";" _

assignment -> type __ variable (_ ":=" _ expression):?
```

Let's continue with the expressions. An expression is a syntactic notation that can be evaluated to get its value. So we will need to add some more rules to support arithmetic binary operations and primitive values.

```ne
# Below our current code

expression -> addition

addition -> 
    addition _ "+" _ multiplication
    | addition _ "-" _ multiplication
    | multiplication

multiplication -> 
    multiplication _ "*" _ primary
    | multiplication _ "/" _ primary
    | primary

primary -> 
    variable
    | "(" _ expression _ ")"
    | primitive

# ...

primitive -> 
    %number
    | variable
    | %char
    | %string
    | %bool

variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}
```
As you may have notice reading these new rules, they are recursive. This allows to have expressions like `1 + 1 + 1` which parse like `(1 + 1) + 1`. Because the recursive [non-terminal](https://en.wikipedia.org/wiki/Terminal_and_nonterminal_symbols) appears as the leftmost symbol in the rule, we can say that the rule is left recursive which help us build the left [associativity](https://en.wikipedia.org/wiki/Operator_associativity)

> If we define these rules with right associativity we would have errors in the evaluation of operations like `5 − 3 − 2` where the parser would parse as `5 − (3 − 2)` which later would wrongly evaluate to `5 − 1 = 4` instead of `2 − 2 = 0`

Also notice that we defined a `primary` rule that serves the purpose of being the base case for recursion and the highest precedence expressions

Good! Finally for this first statement we will implement a simple type rule that for now it's enough.

```ne
# ...
type -> variable

variable -> %variable
```

Now let's add the post processing of these rules. We want our parser to produce certain output after matching a rule. For that we can use a syntax that nearley provides. Let's use the `variable` rule for example

```ne
variable -> %variable {% (d) => ... %}
```

We can define JavaScript/TypeScript code inside {%%} after a rule. These are called [postprocessors](https://nearley.js.org/docs/grammar#postprocessors) and the `d` argument is an array with the symbols matched.

```ne
variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}
```

We access the `%variable` symbol with `d[0]` and then it's value from the `moo` lexer token. But wait... What is `SymbolPrimitive`?

Yukigo provides a collection of AST nodes to build your parser quicker and yukigo compatible. `SymbolPrimitive` is the node that represents symbols like variables.

> You can check the Yukigo's AST reference [here](/ast/README) 

The output that the rule returns will be available for other rules that use the non-terminal. For example:

```ne
type -> variable {% (d) => new SimpleType(d[0], []) %}
```

We do not need to instantiate another `SymbolPrimitive` we just access it by it's position in the rule. Now let's use the available yukigo's nodes to process all of our rules.

```ne
@{%
import { MiniLexer } from "./lexer.js"
import { 
    SimpleType, 
    Assignment, 
    Variable,
    ArithmeticBinaryOperation, 
    SymbolPrimitive, 
    NumberPrimitive, 
    BooleanPrimitive, 
    StringPrimitive, 
    CharPrimitive,
    NilPrimitive
} from "yukigo-core"
%}

@preprocessor typescript
@lexer MiniLexer

program -> statement:+ _ %EOF {% (d) => d[0].flat(Infinity) %}

statement -> assignment _ ";" _ {% (d) => d[0] %}

assignment -> type __ variable (_ ":=" _ expression):? {% (d) => new Variable(d[2], d[3] ? d[3][3] : new NilPrimitive(null), d[0]) %}

expression -> addition {% (d) => d[0] %}

addition -> 
    addition _ "+" _ multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | addition _ "-" _ multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% (d) => d[0] %}

multiplication -> 
    multiplication _ "*" _ primary {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | multiplication _ "/" _ primary {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | primary {% (d) => d[0] %}

primary -> 
    variable {% (d) => d[0] %}
    | "(" _ expression _ ")" {% (d) => d[2] %}
    | primitive {% (d) => d[0] %}

primitive -> 
    %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %char {% (d) => new CharPrimitive(d[0].value) %}
    | variable {% (d) => d[0] %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}
    | %bool {% (d) => new BooleanPrimitive(d[0].value) %}

type -> variable {% (d) => new SimpleType(d[0].value, []) %}

variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}

_ -> %WS:* {% d => null %}
__ -> %WS:+ {% d => null %}
```

> As you may have notice, in the `program` rule we use `.flat(Infinity)` this is because some rules (like `function_statement`) return multiple top-level declarations. We flatten the result to produce a flat list of statements. 

### Using the grammar

Excellent! We need to load the compiled grammar into our `YukigoParser` class, where we will also add some error handling 

```ts
import { YukigoParser } from "yukigo-core";
import nearley from "nearley";
import grammar from "./grammar.js";

export class YukigoMiniParser implements YukigoParser {
  public errors: string[] = [];

  public parse(code: string) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      const token = error.token;
      const message = `Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
      this.errors.push(message)
    }
    const results = parser.results
    if(results.length > 1)
      throw Error(`Ambiguous grammar. The parser generated ${results} ASTs`)

    return results[0]
  }
}
```

> We need to ensure our grammar only produces one AST, nearley returns all possible ASTs so we need to throw in case that the parser returns more than one.

### Testing the grammar

Let's use `mocha` and `chai` to write a test in `tests/parser.spec.ts`

```ts
import { assert } from "chai";
import {
  NilPrimitive,
  SimpleType,
  SymbolPrimitive,
  Variable,
  YukigoParser,
} from "yukigo-core";
import { YukigoMiniParser } from "../src/index.js";

describe("Parser Tests", () => {
  let parser: YukigoParser;
  beforeEach(() => {
    parser = new YukigoMiniParser();
  });

  it("should parse assignment", () => {
    const code = `int n; int result;`;
    assert.deepEqual(parser.parse(code), [
      new Variable(
        new SymbolPrimitive("n"),
        new NilPrimitive(null),
        new SimpleType("int", [])
      ),
      new Variable(
        new SymbolPrimitive("result"),
        new NilPrimitive(null),
        new SimpleType("int", [])
      ),
    ]);
  });
});
```

```
  Parser Tests
    ✔ should parse assignment
```

Excellent! We have our first feature implemented with the test running

Now let's build some more advaced features

## Functions

We want to add support for functions like this
```
int add(int x, int y) {
  int result := x + y;
  return result;
};
int three := add(1, 2);
```
We see that the function `add` is a `Procedure` with one `Equation` that has two `VariablePattern` and an `UnguardedBody` with a `Sequence` of two statements: `Variable` and `Return`.

So let's start with the rule for the function statement.

```
# ...
function_statement -> type __ variable ("(" _ param_list:? _ ")" _ "{" _ body _ "}") {% (d) => {
    const paramTypeList = []
    const patternList = []
    if(d[3][2]) {
        for(const [paramType, paramPattern] of d[3][2]) {
            paramTypeList.push(paramType);
            patternList.push(paramPattern);
        }
    }
    const signatureType = new ParameterizedType(paramTypeList, d[0], []) 

    const signature = new TypeSignature(d[2], signatureType);
    const procedure =  new Procedure(d[2], [new Equation(patternList, d[3][8])])
    return [signature, procedure]
}%}

param_list -> param (_ "," _ param):* {% d => [d[0], ...d[1].map(x => x[3])] %}

param -> type __ variable {% d => [d[0], new VariablePattern(d[2])] %}

body -> statement:* {% (d) => new UnguardedBody(new Sequence(d[0])) %}
# ...
```

> Notice that, we also add a `TypeSignature` node which represents the signature of a function. In `paramTypeList` we collect the types of each argument to later add it to the `inputs` of the `ParameterizedType`. 

Also let's add a return statement

```
return_statement -> "return" _ expression {% (d) => new Return(d[2]) %}
```

And finally let's add them to our statement rule
```
statement -> (assignment | function_statement | return_statement) _ ";" _ {% (d) => d[0][0] %}
```

Finally let's add a test that validates this behaviour

```ts
it("should parse function declaration", () => {
  const code = `int add(int x, int y) {
  int result := x + y;
  return result;
};`;
  assert.deepEqual(parser.parse(code), [
    new TypeSignature(
      new SymbolPrimitive("add"),
      new ParameterizedType(
        [new SimpleType("int", []), new SimpleType("int", [])],
        new SimpleType("int", []),
        []
      )
    ),
    new Procedure(new SymbolPrimitive("add"), [
      new Equation(
        [
          new VariablePattern(new SymbolPrimitive("x")),
          new VariablePattern(new SymbolPrimitive("y")),
        ],
        new UnguardedBody(
          new Sequence([
            new Variable(
              new SymbolPrimitive("result"),
              new ArithmeticBinaryOperation(
                "Plus",
                new SymbolPrimitive("x"),
                new SymbolPrimitive("y")
              ),
              new SimpleType("int", [])
            ),
            new Return(new SymbolPrimitive("result")),
          ])
        )
      ),
    ]),
  ]);
});
```

Hopefully that will give us
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
```
It's a pretty simple workflow, if you like you could even make the tests first so you already have expectations setted for your grammar.

## Collection Primitive

We are missing a key primitive though. 

```
int[] numberList := [1, 2, 3 + 4];
```

This is not hard to implement. We need to define a primary rule `list` and use `ListPrimitive` node from `yukigo-core`. Let's add it

First, let's think about the test. We expect the example above to parse as a `Variable` with expression `ListPrimitive` and type `ListType` which has int for it's elements. We might think of something like this:

```ts
it("should parse list primitive", () => {
  const code = `int[] numberList := [1, 2, 3 + 4];`;
  assert.deepEqual(parser.parse(code), [
    new Variable(
      new SymbolPrimitive("numberList"),
      new ListPrimitive([
        new NumberPrimitive(1),
        new NumberPrimitive(2),
        new ArithmeticBinaryOperation(
          "Plus",
          new NumberPrimitive(3),
          new NumberPrimitive(4)
        ),
      ]),
      new ListType(new SimpleType("int", []), [])
    ),
  ]);
});
```
Let's modify our type rule to support this new list type
```
type -> 
    variable {% (d) => new SimpleType(d[0].value, []) %}
    | type "[" "]" {% (d) => new ListType(d[0], []) %}
```
Good! Now for the expression we have something like
```
list_primitive -> "[" _ expression_list _ "]" {% (d) => new ListPrimitive(d[2]) %}

expression_list -> expression _ ("," _ expression _):* {% (d) => ([d[0], ...d[2].map(x => x[2])]) %}
```
So lastly we add the `list_primitive` rule to the `primitive` rule
```
primitive -> 
    %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %char {% (d) => new CharPrimitive(d[0].value) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}
    | %bool {% (d) => new BooleanPrimitive(d[0].value) %}
    | variable {% (d) => d[0] %}
    | list_primitive {% d => d[0] %}
```

Let's run the tests and check if we got it right
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
  ✔ should parse list primitive
```


## Control Flow: If & While statements

Finally, we want our language to have if statements and while loops. So we will need to implement some rules that produce `If` and `While` nodes

We expect something like this for if statements
```ts
  it("should parse if statement", () => {
    const code = `if(a != b) { c := a + b; } else { c := a * 2; };`;
    assert.deepEqual(parser.parse(code), [
      new If(
        new ComparisonOperation(
          "NotEqual",
          new SymbolPrimitive("a"),
          new SymbolPrimitive("b")
        ),
        new Sequence([
          new Assignment(
            new SymbolPrimitive("c"),
            new ArithmeticBinaryOperation(
              "Plus",
              new SymbolPrimitive("a"),
              new SymbolPrimitive("b")
            )
          ),
        ]),
        new Sequence([
          new Assignment(
            new SymbolPrimitive("c"),
            new ArithmeticBinaryOperation(
              "Multiply",
              new SymbolPrimitive("a"),
              new NumberPrimitive(2)
            )
          ),
        ]),
      ),
    ]);
  });
});
```

First, let's add the `!=`, `==`, `*`, `if`, and `else` tokens to our lexer.
```ts
// ...
const keywords = [
  "return",
  "if",
  "else"
]

export const MiniLexerConfig = {
  // other tokens
  semicolon: ";",
  assign: ":=",
  notEqual: "!=",
  equal: "==",
  // other tokens
  operator: /\+|\*/,
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
    type: moo.keywords({
      keyword: keywords,
    }),
  },
  NL: { match: /\r?\n/, lineBreaks: true },
};
// ...
```

Now, let's define the production for the if statement

```
if_statement -> "if" _ condition _ statement_list _ "else" _ statement_list {% d => new If(d[2], d[4], d[8]) %}

condition -> "(" _ expression _ ")" {% (d) => d[2] %}

statement_list -> "{" _ statement:* _ "}" {% d => new Sequence(d[2]) %}
```

Good, now we are missing the rule that produces `ComparisonOperation` nodes. Let's modify the operations section to add comparison **before** arithmetic operations

```
expression -> comparison {% (d) => d[0] %}

comparison ->
    addition _ comparison_operator _ addition {% (d) => new ComparisonOperation(d[2], d[0], d[4]) %}
    | addition {% (d) => d[0] %}

addition -> 
    addition _ "+" _ multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | addition _ "-" _ multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% (d) => d[0] %}

multiplication -> 
    multiplication _ "*" _ primary {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | multiplication _ "/" _ primary {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | primary {% (d) => d[0] %}

# the rest of the grammar

comparison_operator -> 
    %equal {% d => "Equal" %}
    | %notEqual {% d => "NotEqual" %}

```

The `comparison_operator` rule helps us assign semantic value to the operation by the operator we received from the lexer.

Also we are missing assignment statements so we can add in our statement rule

```
assignment -> variable _ ":=" _ expression {% (d) => new Assignment(d[0], d[4]) %}
```

And that should work, let's now implement `while` loops which have a `condition` and a `body` to parse something like this

```ts
it("should parse while loop statement", () => {
  const code = `while(a < 10) { a := a + 1; };`;
  assert.deepEqual(parser.parse(code), [
    new While(
      new ComparisonOperation(
        "LessThan",
        new SymbolPrimitive("a"),
        new NumberPrimitive(10)
      ),
      new Sequence([
        new Assignment(
          new SymbolPrimitive("a"),
          new ArithmeticBinaryOperation(
            "Plus",
            new SymbolPrimitive("a"),
            new NumberPrimitive(1)
          )
        ),
      ]),
    ),
  ]);
});
```

In the lexer we need to add
```ts
export const MiniLexerConfig = {
  // other tokens
  gte: ">=",
  gt: ">",
  lte: "<=",
  lt: "<",
  // other tokens
};
```

> Notice the order in which we defined these tokens. If the `gt` token were to be before the `gte` token, then the lexer would return the token `gt` even if it read `>=`. This is called [maximal munch](https://en.wikipedia.org/wiki/Maximal_munch) or longest match principle.

Let's update our `comparison_operator` rule with these new operators

```
comparison_operator -> 
    %equal {% d => "Equal" %}
    | %notEqual {% d => "NotEqual" %}
    | %lt {% d => "LessThan" %}
    | %lte {% d => "LessOrEqualThan" %}
    | %gt {% d => "GreaterThan" %}
    | %gte {% d => "GreaterOrEqualThan" %}
```

And now define the `while_statement` rule reusing the condition and body from the `if_statement` rule

```
while_statement -> "while" _ condition _ statement_list {% d => new While(d[2], d[4]) %}
```

Finally we should have all tests working 
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
  ✔ should parse list primitive
  ✔ should parse if statement
  ✔ should parse while loop statement
```