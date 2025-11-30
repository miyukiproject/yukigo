# Class: ComparisonOperation

Represents a comparison between two values (e.g., >, <, ==).

## Constructors

### Constructor

> **new ComparisonOperation**(`operator`, `left`, `right`, `loc?`): `ComparisonOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ComparisonOperatorType`](../Other/index.ComparisonOperatorType.md) |
| `left` | [`Expression`](../Other/index.Expression.md) |
| `right` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ComparisonOperation`

#### Overrides

`ASTNode.constructor`
