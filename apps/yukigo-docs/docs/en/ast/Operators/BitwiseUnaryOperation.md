# Class: BitwiseUnaryOperation

Represents a unary bitwise operation like NOT (complement).

## Constructors

### Constructor

> **new BitwiseUnaryOperation**(`operator`, `operand`, `loc?`): `BitwiseUnaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | `"BitwiseNot"` |
| `operand` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`BitwiseUnaryOperation`

#### Overrides

`ASTNode.constructor`
