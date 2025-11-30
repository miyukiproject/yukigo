# Class: While

Represents a while loop control structure.

## Example

```ts
while (x > 0) { ... }
```

## Constructors

### Constructor

> **new While**(`condition`, `body`, `loc?`): `While`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | [`Expression`](../Other/index.Expression.md) |
| `body` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`While`

#### Overrides

`ASTNode.constructor`
