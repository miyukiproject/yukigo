# Class: If

Generic conditional If statements.
Nested `else if` need to be desugared into `else { if ... }`

## Example

```ts
if (condition) { ... } else { ... }
```

## Constructors

### Constructor

> **new If**(`condition`, `then`, `elseExpr`, `loc?`): `If`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | [`Expression`](../Other/index.Expression.md) |
| `then` | [`Expression`](../Other/index.Expression.md) |
| `elseExpr` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`If`

#### Overrides

`ASTNode.constructor`
