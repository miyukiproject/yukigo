# Class: Case

Represents a case expression, selecting a branch based on pattern matching against a value.

## Example

```ts
case x of
  [] -> 0
  (x:xs) -> 1 + length xs
```

## Constructors

### Constructor

> **new Case**(`condition`, `body`, `loc?`): `Case`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | [`Expression`](../Other/Expression.md) |
| `body` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Case`

#### Overrides

`ASTNode.constructor`
