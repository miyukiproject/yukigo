# Primeros Pasos

## Descripción General

Yukigo (de la composición de los kanjis japoneses "雪", que significa "nieve", y "語" que significa "lenguaje") es un analizador de código estático e intérprete para múltiples lenguajes y paradigmas.

Yukigo está construido sobre 4 componentes principales:

1. Un Árbol Semántico Abstracto (AST), que permite expresar la semántica del código.
2. Las [Inspecciones](/en/inspections/generic) son consultas predefinidas sobre el AST que verifican patrones o propiedades específicas del código (por ejemplo, "¿existe esta función?"). Yukigo provee conjuntos de inspecciones integradas para cada paradigma, permitiendo analizar y definir expectativas explícitas sobre el codigo.
3. Un Analizador para ejecutar las inspecciones sobre el AST.
4. Un Intérprete para evaluar expresiones utilizando el AST como contexto.

### Lenguajes Soportados

Por ahora, Yukigo tiene soporte para:

- Haskell
- Prolog
- Wollok

La naturaleza modular de Yukigo permite que cualquiera pueda construir un parser para el lenguaje que desee, siempre que produzca un AST de Yukigo. Esto es más sencillo utilizando `yukigo-ast`, un paquete que provee todos los nodos del AST disponibles como clases instanciables en el parser.

Ver [Guía: Creando un Parser para Yukigo](/es/guides/making-a-parser.html) para más información sobre este tema.

### ¿Qué podés hacer con Yukigo?

- **Evaluación y Corrección Automática:** Usá el Analizador para verificar si una entrega de código cumple con requisitos estructurales específicos (como "¿El estudiante usó pattern matching?" o "¿La función es recursiva en cola?"), en lugar de simplemente comparar la salida esperada.

- **Ejecución en Entorno Aislado:** Ejecutá fragmentos de código de forma segura usando el Intérprete. Ideal para playgrounds web o plataformas educativas donde necesitás ejecutar lógica del usuario sin lanzar procesos de shell pesados e inseguros.

## Inicio Rápido

En tu proyecto, podés instalar `yukigo` y un parser (usaremos el parser de Haskell para este ejemplo) con:

::: code-group
```bash [npm]
$ npm install yukigo yukigo-haskell-parser
```
```bash [Yarn]
$ yarn add yukigo yukigo-haskell-parser
```

:::

Luego, en tu archivo `index.ts` podés usar:
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

## Filosofía

Yukigo busca proveer un framework flexible y extensible, capaz de entender y procesar código en distintos lenguajes de programación y paradigmas.

Los principios fundamentales de Yukigo son: Universalidad y Flexibilidad.

El diseño modular de Yukigo sienta las bases para alcanzar estos principios. Podés usar el Analizador y construir tu propio Intérprete que se adapte a tus necesidades, o incluso usar el AST definido para realizar optimizaciones sobre el código. Cada componente está desacoplado de los demás, pero todos "hablan" la misma definición de AST.

## Comunidad

Si tenés preguntas o necesitás ayuda, comunicate con la comunidad en [Discord](https://discord.gg/M3hpGEbbum) o [GitHub](https://github.com/miyukiproject/yukigo).