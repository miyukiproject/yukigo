# Getting Started

## Overview

Yukigo (From the composition of the japanese kanjis "雪", for "snow", and "語" for "language") is a static code analyzer and interpreter for multiple languages and paradigms.

Yukigo is built on top of 4 main components:

1. An Abstract Semantic Tree (AST), which allows to express the semantic of the code.
2. [Inspections](/inspections/generic) are predefined queries over the AST that check for specific code patterns or properties (e.g., "does this function exist?"). Yukigo provides sets of built-in inspections for each paradigm to analyze the code and define explicit expectations of the input.
3. An Analyzer for running the inspections in the AST.
4. An Interpreter for running expressions using the AST as the context.

### Supported Languages

For now, Yukigo provides support for:

- Haskell
- Prolog
- Wollok (WIP)

The modular nature of Yukigo allows for everyone to build a parser for their desired language, as long as it produces a Yukigo AST which is easier using `@yukigo/ast`, a package that provides all the available AST nodes as classes that can be instantiated in the parser.

See [Guide: Making a Yukigo Parser](/guides/making-a-parser.html) for more on that topic.

### What can you do with Yukigo?

#### TODO

## Quickstart

In your project, you can install `yukigo` and a parser (we will use the Haskell parser for this example) using:

::: code-group

```bash [npm]
$ npm install yukigo yukigo-haskell-parser
```

```bash [Yarn]
$ yarn add yukigo yukigo-haskell-parser
```

:::

Then, in your `index.ts` file you can use:

```ts [index.ts]
import { Analyzer } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";

const code = "double x = x * 2";

const parser = new YukigoHaskellParser();
const ast = parser.parse(code);

const analyzer = new Analyzer(ast);

const expectations = [
  {
    inspection: "HasBinding",
    args: { name: "minimoEntre" },
    expected: false,
  },
  {
    inspection: "HasBinding",
    args: { name: "double" },
    expected: true,
  },
];

const results = analyzer.analyse(expectations);

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
//       args: { name: "double" },
//       expected: true,
//     },
//     passed: true,
//     actual: true,
//   },
// ];
```

## Philosophy

Yukigo aims to provide a flexible and extensible framework capable of understanding and processing code across different programming languages and paradigms.

The main principles behind Yukigo are: Universality and Flexibility.

The modular design of Yukigo provides a foundation to achieve these principles. You can use the Analyzer but build your own Interpreter that satisfies your needs, you can even use the defined AST to perform optimizations on the code. Every component is detatch from the other, but all "talk" the same AST definition.

## Community

If you have questions or need help, reach out to the community at [Discord](https://discord.gg/M3hpGEbbum) or [GitHub](https://github.com/noiseArch/yukigo).
