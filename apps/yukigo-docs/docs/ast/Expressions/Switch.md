# Class: Switch

Represents a switch statement, selecting execution paths based on value equality.

## Constructors

### Constructor

> **new Switch**(`value`, `cases`, `defaultExpr?`, `loc?`): `Switch`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | [`Expression`](../Other/index.Expression.md) |
| `cases` | [`Case`](index.Case.md)[] |
| `defaultExpr?` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Switch`

#### Overrides

`ASTNode.constructor`
