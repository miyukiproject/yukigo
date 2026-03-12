# Intérprete

El `Interpreter` es el punto de entrada principal para evaluar nodos del Árbol Semántico Abstracto (AST). Evalúa todos los nodos `Expression` (y algunos `Statement`) y devuelve un `PrimitiveValue`.

## PrimitiveValue

El `PrimitiveValue` es la abstracción de datos central en Yukigo. Es un tipo unión exhaustivo que integra los primitivos nativos de JavaScript con entidades de tiempo de ejecución personalizadas, necesarias para el soporte multiparadigma.
```ts
export type PrimitiveValue =
  | number
  | boolean
  | string
  | null
  | void
  | undefined
  | PrimitiveValue[]
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | RuntimeObject
  | RuntimeClass
```

En Yukigo, el `PrimitiveValue` es un **ciudadano de primera clase**. Este diseño garantiza que cualquier resultado producido por el intérprete, ya sea un escalar simple, una clausura funcional, un predicado lógico o una estructura lazy, pueda:

1. Ser pasado como argumento a funciones o predicados.
2. Ser retornado desde cualquier bloque evaluable.
3. Ser asignado a identificadores dentro del contexto `EnvBuilder`.

## ¿Por qué "evalúa" Statements?

El propósito de evaluar nodos `Statement` es proveer una forma de declarar cosas en tiempo de ejecución. Por ejemplo, podemos declarar un nodo `Variable` con identificador `x` y cuerpo `2` así:
```
> x = 2
```

El `Interpreter` procesa el `Variable` (un `Statement`), registra el símbolo `x` en el contexto y devuelve `void`.

Luego, al evaluar el símbolo `x`:
```
> x
2
```

El `Interpreter` recupera el `PrimitiveValue` asociado desde el entorno.