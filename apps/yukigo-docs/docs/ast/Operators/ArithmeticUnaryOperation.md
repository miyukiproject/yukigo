# Class: ArithmeticUnaryOperation

Represents a unary arithmetic operation like negation (-x).

## Constructors

### Constructor

> **new ArithmeticUnaryOperation**(`operator`, `operand`, `loc?`): `ArithmeticUnaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ArithmeticUnaryOperator`](../Other/ArithmeticUnaryOperator.md) |
| `operand` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ArithmeticUnaryOperation`

#### Overrides

`ASTNode.constructor`
