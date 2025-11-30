# Class: Equation

Represents one Equation with its arguments and body. Allows for overloading and pattern matching.
You may define the return statement to access it more easily.

## Example

```ts
add 0 y = y
add x y = x + y
```

## Constructors

### Constructor

> **new Equation**(`patterns`, `body`, `returnExpr?`, `loc?`): `Equation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `patterns` | [`Pattern`](../Other/index.Pattern.md)[] |
| `body` | [`UnguardedBody`](index.UnguardedBody.md) \| [`GuardedBody`](index.GuardedBody.md)[] |
| `returnExpr?` | [`Return`](../Statements/index.Return.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Equation`

#### Overrides

`ASTNode.constructor`
