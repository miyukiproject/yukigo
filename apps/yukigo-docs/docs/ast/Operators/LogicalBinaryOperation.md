# Class: LogicalBinaryOperation

Represents a binary logical operation like AND or OR.

## Constructors

### Constructor

> **new LogicalBinaryOperation**(`operator`, `left`, `right`, `loc?`): `LogicalBinaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`LogicalBinaryOperator`](../Other/LogicalBinaryOperator.md) |
| `left` | [`Expression`](../Other/Expression.md) |
| `right` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`LogicalBinaryOperation`

#### Overrides

`ASTNode.constructor`
