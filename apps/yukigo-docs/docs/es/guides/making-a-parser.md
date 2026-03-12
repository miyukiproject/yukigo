# Cómo hacer un parser para Yukigo

En este tutorial vamos a cubrir los conceptos básicos para crear un parser compatible con el analizador de Yukigo.

Al final de este tutorial, vas a poder:
- Configurar un parser basado en nearley con TypeScript
- Diseñar un lexer usando `moo`
- Escribir reglas gramaticales con precedencia y asociatividad de operadores correctas
- Usar postprocesadores para construir un AST compatible con Yukigo
- Implementar soporte para variables, funciones, listas, condicionales y bucles
- Escribir y ejecutar pruebas unitarias para tu parser

## Configuración

Primero, veamos qué espera Yukigo de un parser.
```ts
interface YukigoParser {
  errors?: string[];
  parse: (code: string) => AST;
  parseExpression: (code: string) => Expression;
}
```

Todo parser necesita exponer un método `parse` y `parseExpression`, y puede incluir también un array de errores. La lógica interna no le importa a Yukigo. Por ejemplo, si el lenguaje tiene tipos, podríamos agregar un paso de verificación de tipos antes de retornar el AST parseado.

En este tutorial vamos a implementar un parser para un subconjunto de [mini-lang](https://github.com/mini-lang/mini-lang). Vamos a cubrir expresiones, sentencias, flujo de control, funciones, etc.

Vamos a usar [nearley.js](https://nearley.js.org/) como generador de parsers, pero podés usar cualquier herramienta que te resulte conveniente.

Iniciemos un nuevo proyecto de Yukigo Parser con `create-yukigo-parser`.
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

Podés elegir si inicializar el repositorio e instalar las dependencias según tus preferencias.

## Lexer

¡Genial! Tenemos una base para trabajar. Ahora trabajemos en el lexer, el componente responsable de la tokenización léxica: el proceso donde un conjunto de caracteres es agrupado y convertido en tokens con significado.

En el archivo `src/lexer.ts`, definamos los tokens significativos de nuestro lenguaje:
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

Como podés ver, definimos tokens primitivos como `number`, `string`, `char`, `bool`. También definimos cómo luce una `variable` y algunas `keywords`. Los tokens para espacios en blanco (`WS`), salto de línea (`NL`) y fin de archivo (`EOF`) van a ser útiles al diseñar nuestra gramática.

> Necesitamos definir cada token que nuestro lexer debe reconocer. Por eso definimos `assign` y `semicolon`.

## Gramática

Ahora empecemos con el archivo de gramática.
Creá un archivo `src/grammar.ne` y agregá este boilerplate por ahora:
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

> `_` y `__` son reglas para reconocer cero-o-más y uno-o-más espacios en blanco.

> nearley.js nos permite usar operadores [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form): `:+`, `:*`, `:?`

Empecemos de a poco con el soporte para asignación de variables. Queremos poder asignar y declarar variables así:
```
int x := 10;
```

Entonces necesitamos agregar varias cosas primero. Como vemos, la sentencia de asignación está compuesta por un `type`, una `variable` y una `expression` opcional (también queremos soportar `int x;`).

Modifiquemos la regla `program` y agreguemos una regla `statement` que podamos expandir más adelante:
```ne
program -> statement:+ _ %EOF

statement -> assignment _ ";" _

assignment -> type __ variable (_ ":=" _ expression):?
```

Continuemos con las expresiones. Una expresión es una notación sintáctica que puede evaluarse para obtener su valor. Vamos a necesitar agregar más reglas para soportar operaciones binarias aritméticas y valores primitivos.
```ne
# Debajo del código actual

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

Como habrás notado al leer estas nuevas reglas, son recursivas. Esto permite tener expresiones como `1 + 1 + 1` que se parsean como `(1 + 1) + 1`. Como el [no-terminal](https://en.wikipedia.org/wiki/Terminal_and_nonterminal_symbols) recursivo aparece como el símbolo más a la izquierda en la regla, decimos que la regla es recursiva por la izquierda, lo que nos ayuda a construir la [asociatividad](https://en.wikipedia.org/wiki/Operator_associativity) por izquierda.

> Si definiéramos estas reglas con asociatividad por derecha, tendríamos errores al evaluar operaciones como `5 − 3 − 2`, donde el parser interpretaría `5 − (3 − 2)`, que incorrectamente evaluaría a `5 − 1 = 4` en lugar de `2 − 2 = 0`.

También notá que definimos una regla `primary` que sirve como caso base para la recursión y como expresión de mayor precedencia.

¡Bien! Por último, para esta primera sentencia implementamos una regla de tipo simple que por ahora es suficiente:
```ne
# ...
type -> variable

variable -> %variable
```

Ahora agreguemos el postprocesamiento de estas reglas. Queremos que nuestro parser produzca cierta salida tras reconocer una regla. Para eso podemos usar una sintaxis que provee nearley. Usemos la regla `variable` como ejemplo:
```ne
variable -> %variable {% (d) => ... %}
```

Podemos definir código JavaScript/TypeScript dentro de `{%%}` después de una regla. Estos se llaman [postprocesadores](https://nearley.js.org/docs/grammar#postprocessors) y el argumento `d` es un array con los símbolos reconocidos.
```ne
variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}
```

Accedemos al símbolo `%variable` con `d[0]` y luego a su valor desde el token del lexer `moo`. Pero... ¿qué es `SymbolPrimitive`?

Yukigo provee una colección de nodos AST para construir tu parser más rápido y de forma compatible. `SymbolPrimitive` es el nodo que representa símbolos como variables.

> Podés consultar la referencia del AST de Yukigo [aquí](/en/ast/README).

La salida que retorna la regla va a estar disponible para otras reglas que usen el no-terminal. Por ejemplo:
```ne
type -> variable {% (d) => new SimpleType(d[0], []) %}
```

No necesitamos instanciar otro `SymbolPrimitive`, simplemente lo accedemos por su posición en la regla. Ahora usemos los nodos de Yukigo disponibles para procesar todas nuestras reglas:
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
} from "yukigo-ast"
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

> Como habrás notado, en la regla `program` usamos `.flat(Infinity)`. Esto se debe a que algunas reglas (como `function_statement`) retornan múltiples declaraciones de nivel superior. Aplanamos el resultado para producir una lista plana de sentencias.

### Usando la gramática

¡Excelente! Necesitamos cargar la gramática compilada en nuestra clase `YukigoParser`, donde también agregaremos manejo de errores:
```ts
import { YukigoParser } from "yukigo-ast";
import nearley from "nearley";
import grammar from "./grammar.js";

export class YukigoMiniParser implements YukigoParser {
  public errors: string[] = [];

  public parse(code: string): AST {
    return this.feedParser(code);
  }
  public parseExpression(code: string): Expression {
    return this.feedParser(code);
  }
  private feedParser(code: string): any {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      if ("token" in error) throw new UnexpectedToken(error.token);
      throw error
    }
    const results = parser.results;
    if (results.length > 1)
      throw Error(
        `Ambiguous grammar. The parser generated ${results.length} ASTs`
      );
    return results[0];
  }
}
```

> Necesitamos asegurarnos de que nuestra gramática produzca un único AST. nearley retorna todos los ASTs posibles, por eso debemos lanzar un error si el parser retorna más de uno.

### Testeando la gramática

Usemos `mocha` y `chai` para escribir un test en `tests/parser.spec.ts`:
```ts
import { assert } from "chai";
import {
  NilPrimitive,
  SimpleType,
  SymbolPrimitive,
  Variable,
  YukigoParser,
} from "yukigo-ast";
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

¡Excelente! Tenemos nuestra primera funcionalidad implementada con el test pasando.

Ahora construyamos algunas características más avanzadas.

## Funciones

Queremos agregar soporte para funciones como esta:
```
int add(int x, int y) {
  int result := x + y;
  return result;
};
int three := add(1, 2);
```

Vemos que la función `add` es un `Procedure` con una `Equation` que tiene dos `VariablePattern` y un `UnguardedBody` con una `Sequence` de dos sentencias: `Variable` y `Return`.

Empecemos con la regla para la sentencia de función:
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

> Notá que también agregamos un nodo `TypeSignature` que representa la firma de una función. En `paramTypeList` recolectamos los tipos de cada argumento para luego agregarlos a los `inputs` del `ParameterizedType`.

Agreguemos también una sentencia de retorno:
```
return_statement -> "return" _ expression {% (d) => new Return(d[2]) %}
```

Y finalmente agreguémoslas a nuestra regla `statement`:
```
statement -> (assignment | function_statement | return_statement) _ ";" _ {% (d) => d[0][0] %}
```

Ahora escribamos un test que valide este comportamiento:
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

Deberíamos obtener:
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
```

Es un flujo de trabajo bastante simple. Si querés, podés incluso escribir los tests primero para tener las expectativas definidas antes de escribir la gramática.

## Primitiva de Colección

Nos falta un primitivo clave:
```
int[] numberList := [1, 2, 3 + 4];
```

Esto no es difícil de implementar. Necesitamos definir una regla primaria `list` y usar el nodo `ListPrimitive` de `yukigo-ast`. Agreguémoslo.

Primero, pensemos en el test. Esperamos que el ejemplo anterior se parsee como un `Variable` con expresión `ListPrimitive` y tipo `ListType` que tiene `int` para sus elementos:
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

Modifiquemos la regla `type` para soportar este nuevo tipo lista:
```
type -> 
    variable {% (d) => new SimpleType(d[0].value, []) %}
    | type "[" "]" {% (d) => new ListType(d[0], []) %}
```

Para la expresión tenemos algo como:
```
list_primitive -> "[" _ expression_list _ "]" {% (d) => new ListPrimitive(d[2]) %}

expression_list -> expression _ ("," _ expression _):* {% (d) => ([d[0], ...d[2].map(x => x[2])]) %}
```

Por último, agregamos la regla `list_primitive` a la regla `primitive`:
```
primitive -> 
    %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %char {% (d) => new CharPrimitive(d[0].value) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}
    | %bool {% (d) => new BooleanPrimitive(d[0].value) %}
    | variable {% (d) => d[0] %}
    | list_primitive {% d => d[0] %}
```

Corramos los tests y verifiquemos que todo esté bien:
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
  ✔ should parse list primitive
```

## Flujo de Control: If & While

Por último, queremos que nuestro lenguaje tenga sentencias `if` y bucles `while`. Para eso vamos a implementar reglas que produzcan nodos `If` y `While`.

Esperamos algo así para las sentencias `if`:
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

Primero, agreguemos los tokens `!=`, `==`, `*`, `if` y `else` a nuestro lexer:
```ts
// ...
const keywords = [
  "return",
  "if",
  "else"
]

export const MiniLexerConfig = {
  // otros tokens
  semicolon: ";",
  assign: ":=",
  notEqual: "!=",
  equal: "==",
  // otros tokens
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

Ahora definamos la producción para la sentencia `if`:
```
if_statement -> "if" _ condition _ statement_list _ "else" _ statement_list {% d => new If(d[2], d[4], d[8]) %}

condition -> "(" _ expression _ ")" {% (d) => d[2] %}

statement_list -> "{" _ statement:* _ "}" {% d => new Sequence(d[2]) %}
```

Nos falta la regla que produce nodos `ComparisonOperation`. Modifiquemos la sección de operaciones para agregar comparación **antes** de las operaciones aritméticas:
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

# el resto de la gramática

comparison_operator -> 
    %equal {% d => "Equal" %}
    | %notEqual {% d => "NotEqual" %}
```

La regla `comparison_operator` nos ayuda a asignar valor semántico a la operación a partir del operador recibido del lexer.

También nos falta la sentencia de asignación, así que la agregamos a nuestra regla `statement`:
```
assignment -> variable _ ":=" _ expression {% (d) => new Assignment(d[0], d[4]) %}
```

Ahora implementemos los bucles `while`, que tienen una `condition` y un `body` para parsear algo como esto:
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

En el lexer necesitamos agregar:
```ts
export const MiniLexerConfig = {
  // otros tokens
  gte: ">=",
  gt: ">",
  lte: "<=",
  lt: "<",
  // otros tokens
};
```

> Notá el orden en que definimos estos tokens. Si el token `gt` estuviera antes que `gte`, el lexer retornaría el token `gt` incluso al leer `>=`. Esto se llama [maximal munch](https://en.wikipedia.org/wiki/Maximal_munch) o principio de la coincidencia más larga.

Actualicemos la regla `comparison_operator` con estos nuevos operadores:
```
comparison_operator -> 
    %equal {% d => "Equal" %}
    | %notEqual {% d => "NotEqual" %}
    | %lt {% d => "LessThan" %}
    | %lte {% d => "LessOrEqualThan" %}
    | %gt {% d => "GreaterThan" %}
    | %gte {% d => "GreaterOrEqualThan" %}
```

Y ahora definamos la regla `while_statement` reutilizando la condición y el cuerpo de la regla `if_statement`:
```
while_statement -> "while" _ condition _ statement_list {% d => new While(d[2], d[4]) %}
```

¡Con esto deberíamos tener todos los tests pasando!
```
Parser Tests
  ✔ should parse assignment
  ✔ should parse function declaration
  ✔ should parse list primitive
  ✔ should parse if statement
  ✔ should parse while loop statement
```