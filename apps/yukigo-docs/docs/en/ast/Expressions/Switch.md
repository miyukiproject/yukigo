# Class: Switch

Represents a switch statement, selecting execution paths based on value equality.

## Constructors

### Constructor

> **new Switch**(`value`, `cases`, `defaultExpr?`, `loc?`): `Switch`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | [`Expression`](../Other/Expression.md) |
| `cases` | [`Case`](Case.md)[] |
| `defaultExpr?` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Switch`

#### Overrides

`ASTNode.constructor`
