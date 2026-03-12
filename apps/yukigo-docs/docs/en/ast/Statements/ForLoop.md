# Class: ForLoop

Represents a C-style or range-based for loop.

## Constructors

### Constructor

> **new ForLoop**(`initialization`, `condition`, `update`, `body`, `loc?`): `ForLoop`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initialization` | [`Expression`](../Other/Expression.md) |
| `condition` | [`Expression`](../Other/Expression.md) |
| `update` | [`Expression`](../Other/Expression.md) |
| `body` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ForLoop`

#### Overrides

`ASTNode.constructor`
