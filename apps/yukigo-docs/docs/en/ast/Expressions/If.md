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
| `condition` | [`Expression`](../Other/Expression.md) |
| `then` | [`Expression`](../Other/Expression.md) |
| `elseExpr` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`If`

#### Overrides

`ASTNode.constructor`
