# Class: LogicalBinaryOperation

Represents a binary logical operation like AND or OR.

## Constructors

### Constructor

> **new LogicalBinaryOperation**(`operator`, `left`, `right`, `loc?`): `LogicalBinaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`LogicalBinaryOperator`](../Other/index.LogicalBinaryOperator.md) |
| `left` | [`Expression`](../Other/index.Expression.md) |
| `right` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`LogicalBinaryOperation`

#### Overrides

`ASTNode.constructor`
