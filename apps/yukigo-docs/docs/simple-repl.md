---
outline: deep
---

# Your first project with Yukigo

In this introductory guide you will learn to use Yukigo to build a small command line REPL for Haskell.

## Setup

First, let's make a NodeJS project

```sh
npm init -y
```

Now let's install `yukigo` and `yukigo-haskell-parser`

::: code-group

```bash [npm]
$ npm install yukigo yukigo-haskell-parser
```

```bash [Yarn]
$ yarn add yukigo yukigo-haskell-parser
```
:::

Create an `index.js` file in the folder, and import `YukigoHaskellParser` and `Interpreter`

```js
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Interpreter } from "yukigo";
```

## Basic Loop (Read-Print-Loop)

Let's make a loop that waits for user input, logs it to the console, and breaks if user inputs `exit`.

In NodeJS we prompt the user for input using the `readline` module
```js
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Interpreter } from "yukigo";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var readLoop = function () {
  rl.question('$', function (input) {
    if (input == 'exit')
      return rl.close();
    console.log(input);
    readLoop();
  });
};

readLoop()
```

Execute the code with `node .` and you should be able to send an input and get it echoed back

```sh
$ Hello!
Hello!
```

## Evaluation and Basic Error Handling

Now, lets integrate Yukigo. Lets instantiate the parser and the interpreter before our `readLoop` function:

```js
const parser = new YukigoHaskellParser();
const prelude = parser.parse("")

const interpreter = new Interpreter(prelude, { lazyLoading: true });
const replParser = new YukigoHaskellParser("");
```

As you can see, we need 2 different parsers. One that loads Prelude as the AST where the interpreter will evaluate the expressions, and another to parser the user inputted expressions.

For the `replParser` we pass an empty string so it does not load Prelude. We only want the `replParser` to output expressions.

The loop should Read the input, Evaluate it, and then Print the result. Let's update the `readLoop` function to achieve this:

```js
var readLoop = function () {
  rl.question("$ ", function (input) {
    if (input == "exit") return rl.close();
    try {
      const parsedInput = replParser.parse(input);
      const result = interpreter.evaluate(parsedInput[0]);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    readLoop();
  });
};
```

Note that the `parsedInput` is of type `AST` which is `(Statement | Expression)[]` thats why we access the first element.

When we run it, we can do things like:
```sh
$ 2 + 2
4
$ map (\x -> x * 2) [1, 2, 3]
[ 2, 4, 6 ]
```

The final code looks like this:

```js
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Interpreter } from "yukigo";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parser = new YukigoHaskellParser();
const prelude = parser.parse("")

const interpreter = new Interpreter(prelude, { lazyLoading: true });
const replParser = new YukigoHaskellParser("");

var readLoop = function () {
  rl.question("$ ", function (input) {
    if (input == "exit") return rl.close();
    try {
      const parsedInput = replParser.parse(input);
      const result = interpreter.evaluate(parsedInput[0]);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    readLoop();
  });
};

readLoop();
```

## Conclusion

And it's done!

In a couple of lines you have built a simple Haskell REPL in NodeJS. You can extend this implementation with better error handling, REPL commands with a certain prefix, context loading from a file, and more features.

