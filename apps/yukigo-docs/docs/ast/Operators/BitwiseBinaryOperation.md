# Class: BitwiseBinaryOperation

Represents a binary bitwise operation like AND, OR, XOR.

## Constructors

### Constructor

> **new BitwiseBinaryOperation**(`operator`, `left`, `right`, `loc?`): `BitwiseBinaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`BitwiseBinaryOperator`](../Other/BitwiseBinaryOperator.md) |
| `left` | [`Expression`](../Other/Expression.md) |
| `right` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`BitwiseBinaryOperation`

#### Overrides

`ASTNode.constructor`
