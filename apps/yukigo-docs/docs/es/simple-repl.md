---
outline: deep
---

# Tu primer proyecto con Yukigo

En esta guía introductoria vas a aprender a usar Yukigo para construir un pequeño REPL de línea de comandos para Haskell.

## Configuración

Primero, creemos un proyecto NodeJS:
```sh
npm init -y
```

Ahora instalemos `yukigo` y `yukigo-haskell-parser`:

::: code-group
```bash [npm]
$ npm install yukigo yukigo-haskell-parser
```
```bash [Yarn]
$ yarn add yukigo yukigo-haskell-parser
```
:::

Creá un archivo `index.js` en la carpeta e importá `YukigoHaskellParser` e `Interpreter`:
```js
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Interpreter } from "yukigo";
```

## Bucle Básico (Read-Print-Loop)

Hagamos un bucle que espere la entrada del usuario, la muestre en consola y se detenga si el usuario ingresa `exit`.

En NodeJS pedimos la entrada del usuario usando el módulo `readline`:
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

Ejecutá el código con `node .` y deberías poder ingresar texto y verlo repetido en la consola:
```sh
$ Hello!
Hello!
```

## Evaluación y Manejo Básico de Errores

Ahora, integremos Yukigo. Instanciemos el parser y el intérprete antes de nuestra función `readLoop`:
```js
const parser = new YukigoHaskellParser();
const prelude = parser.parse("")
const interpreter = new Interpreter(prelude, { lazyLoading: true });
```

El bucle debe Leer la entrada, Evaluarla y luego Imprimir el resultado. Actualicemos la función `readLoop` para lograr esto:
```js
var readLoop = function () {
  rl.question("$ ", function (input) {
    if (input == "exit") return rl.close();
    try {
      const expr = parser.parseExpression(input);
      const result = interpreter.evaluate(expr);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    readLoop();
  });
};
```

Al ejecutarlo, podemos hacer cosas como:
```sh
$ 2 + 2
4
$ map (\x -> x * 2) [1, 2, 3]
[ 2, 4, 6 ]
```

El código final queda así:
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

var readLoop = function () {
  rl.question("$ ", function (input) {
    if (input == "exit") return rl.close();
    try {
      const expr = parser.parseExpression(input);
      const result = interpreter.evaluate(expr);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    readLoop();
  });
};

readLoop();
```

## Conclusión

¡Y listo!

En pocas líneas construiste un REPL de Haskell simple en NodeJS. Podés extender esta implementación con un mejor manejo de errores, comandos del REPL con algún prefijo especial, carga de contexto desde un archivo, y muchas más funcionalidades.