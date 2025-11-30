# Class: ForLoop

Represents a C-style or range-based for loop.

## Constructors

### Constructor

> **new ForLoop**(`initialization`, `condition`, `update`, `body`, `loc?`): `ForLoop`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initialization` | [`Expression`](../Other/index.Expression.md) |
| `condition` | [`Expression`](../Other/index.Expression.md) |
| `update` | [`Expression`](../Other/index.Expression.md) |
| `body` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ForLoop`

#### Overrides

`ASTNode.constructor`
