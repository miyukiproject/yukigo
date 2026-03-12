# Class: ComparisonOperation

Represents a comparison between two values (e.g., >, <, ==).

## Constructors

### Constructor

> **new ComparisonOperation**(`operator`, `left`, `right`, `loc?`): `ComparisonOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ComparisonOperatorType`](../Other/ComparisonOperatorType.md) |
| `left` | [`Expression`](../Other/Expression.md) |
| `right` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ComparisonOperation`

#### Overrides

`ASTNode.constructor`
