# ❄️ Yukigo (WIP)
A universal, multi-language, multi-paradigm code analyzer highly inspired in [mulang](https://github.com/mumuki/mulang)

> [!WARNING]
> This project is still in a "work in progress" state. Everything is subject to change :)


## Components

### **Abstract Semantic Tree:**

This is the intermediate representation of any language. Allows us to analyse the semantics of the code independently of the paradigm or the language.

### **Inspector:**

We provide a set of built-in expectations for analysing code. Also allows to define custom expectations at runtime.

### **Translator:**

Translation AST-to-Typescript, this allows us to have an equivalent code to run input-output tests everywhere.

### **Tester:**

Runs tests for the Typescript translated code on an isolated enviroment.

# Usage

## Installation

We will be using Haskell as the target language in this example.

```
npm install yukigo yukigo-haskell-parser
```

or

```
yarn add yukigo yukigo-haskell-parser
```

## Example

```ts
import { ASTAnalyzer } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";

const code = "doble num = num * 2";
const expectations = [
  {
    inspection: "HasBinding",
    args: { name: "minimoEntre" },
    expected: false,
  },
  {
    inspection: "HasBinding",
    args: { name: "doble" },
    expected: true,
  },
];

const parser = new YukigoHaskellParser();
const ast = parser.parse(code);

const analyser = new ASTAnalyzer(ast);
const result = analyser.analyse(expectations);

console.log(results);
// [
//   {
//     rule: {
//       inspection: "HasBinding",
//       args: { name: "minimoEntre" },
//       expected: false,
//     },
//     passed: true,
//     actual: false,
//   },
//   {
//     rule: {
//       inspection: "HasBinding",
//       args: { name: "doble" },
//       expected: true,
//     },
//     passed: true,
//     actual: true,
//   },
// ];
```

## Example with Mulang's Inspections (in a YAML file)

```ts
import { ASTAnalyzer, translateMulangToInspectionRules } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";

const code = `
squareList :: [Int] -> [Int]
squareList xs = map (\n -> n * n) xs

square :: Int -> Int
square n = n * n

squareList2 :: [Int] -> [Int]
squareList2 = map square
`;

// Assuming the expectations are in a yaml file. Implement a way to load the actual file.
const mulangInspections = `
expectations:
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList
  inspection: HasBinding
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList
  inspection: HasLambdaExpression
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: square
  inspection: HasArithmetic
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: doble
  inspection: Not:HasBinding
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: square
  inspection: Uses:n
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList2
  inspection: Uses:map
`;

const expectations = translateMulangToInspectionRules(mulangInspections);

const parser = new YukigoHaskellParser();
const ast = parser.parse(code);

const analyser = new ASTAnalyzer(ast);
const result = analyser.analyse(expectations);

console.log(results);
// [
//   {
//     rule: { inspection: "HasBinding", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: {
//       inspection: "HasLambdaExpression",
//       args: [Object],
//       expected: true,
//     },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "HasArithmetic", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "HasBinding", args: [Object], expected: false },
//     passed: true,
//     actual: false,
//   },
//   {
//     rule: { inspection: "Uses", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "Uses", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
// ];
```

# Relevant tools
- yukigo-ast: A library of AST's node definitions
  
## Tools
- [CLI](https://github.com/noiseArch/yukigo-cli)
  
## Parsers
- Haskell
- Prolog

# How to make a parser

A yukigo's parser is a class that implements the interface `YukigoParser` which exposes a public method called `parse` and an `errors` array like this:
```ts
errors: string[];
parse: (code: string) => AST;
```

The package `yukigo-ast` has all the current supported AST nodes.
For the grammar, you can use a tool like Jison or Nearley.

Here's a tutorial for implementing a small custom language.
