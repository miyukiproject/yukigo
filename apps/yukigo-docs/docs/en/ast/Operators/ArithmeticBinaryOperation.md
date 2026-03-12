# Class: ArithmeticBinaryOperation

Represents a binary arithmetic operation like addition or multiplication.

## Constructors

### Constructor

> **new ArithmeticBinaryOperation**(`operator`, `left`, `right`, `loc?`): `ArithmeticBinaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ArithmeticBinaryOperator`](../Other/ArithmeticBinaryOperator.md) |
| `left` | [`Expression`](../Other/Expression.md) |
| `right` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ArithmeticBinaryOperation`

#### Overrides

`ASTNode.constructor`
