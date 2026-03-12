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
| `patterns` | [`Pattern`](../Other/Pattern.md)[] |
| `body` | [`UnguardedBody`](UnguardedBody.md) \| [`GuardedBody`](GuardedBody.md)[] |
| `returnExpr?` | [`Return`](../Statements/Return.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Equation`

#### Overrides

`ASTNode.constructor`
