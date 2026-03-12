# Class: GuardedBody

Represents the body of an Equation that does have guards.
For example, Haskell's guards

## Example

```ts
f x
   | x > 2 = x * 2
   | otherwise = x / 2
```

## Constructors

### Constructor

> **new GuardedBody**(`condition`, `body`, `loc?`): `GuardedBody`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | [`Expression`](../Other/Expression.md) |
| `body` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`GuardedBody`

#### Overrides

`ASTNode.constructor`
