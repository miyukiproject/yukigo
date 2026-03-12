# Class: ListUnaryOperation

Represents a unary operation on a list, such as getting the head or tail.

## Constructors

### Constructor

> **new ListUnaryOperation**(`operator`, `operand`, `loc?`): `ListUnaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ListUnaryOperator`](../Other/ListUnaryOperator.md) |
| `operand` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ListUnaryOperation`

#### Overrides

`ASTNode.constructor`
