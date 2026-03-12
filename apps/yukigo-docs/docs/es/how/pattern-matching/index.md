# Pattern Matching

El pattern matching es el acto de verificar si una expresión dada coincide con un patrón.
Por ejemplo, veamos este fragmento de código:
```hs
describeNumber :: Int -> String
describeNumber 0 = "You entered exactly zero."
describeNumber x = "You entered a different number: " ++ show x
```

Si cargamos ese código en el `Interpreter` y evaluamos la siguiente expresión:
```hs
describeNumber 0
```

Va a coincidir con la primera ecuacion, donde `0` es un [LiteralPattern](/en/ast/Patterns/LiteralPattern.md):
```text
[EnvBuilder] Defining function: `describeNumber`
[FunctionRuntime] Applying function: `describeNumber` with args: [ '0' ]
[FunctionRuntime] Trying to match value `0` with `0`
[FunctionRuntime] Match successful for `describeNumber` equation 0

You entered exactly zero.
```

Pero si probamos con otro número:
```hs
describeNumber 10
```

El `Interpreter` no va a coincidir con `0`, sino que va a **vincular** `x -> 10` porque `x` es un [VariablePattern](/en/ast/Patterns/VariablePattern.md):
```text
[EnvBuilder] Defining function: `describeNumber`
[FunctionRuntime] Applying function: `describeNumber` with args: [ '10' ]
[FunctionRuntime] Trying to match value `10` with `0`
[FunctionRuntime] Could not match value `10` with `0`
[FunctionRuntime] Trying to match value `10` with `x`
[FunctionRuntime] Match successful for `describeNumber` equation 1

You entered a different number: 10
```

Cuando el `FunctionRuntime` aplica una expresión a esa función, el `PatternMatcher` prueba cada ecuación de arriba hacia abajo hasta encontrar la primera que coincida. En el segundo ejemplo, la variable comodín `x` coincide exitosamente con la entrada y vincula el valor `10` para que pueda ser usado en la expresión resultante.

## Flujo de Evaluación

El siguiente diagrama de secuencia ilustra el proceso interno ejecutado por el `Interpreter` cuando evalúa una expresión que requiere pattern matching con fallback, como `describeNumber 10`.

![Flujo de Evaluación](./pattern-matching.svg)

## Ver también

- [Wikipedia - Pattern matching](https://en.wikipedia.org/wiki/Pattern_matching)

- [The Haskell 98 Report - Pattern matching](https://www.haskell.org/onlinereport/exps.html#pattern-matching)