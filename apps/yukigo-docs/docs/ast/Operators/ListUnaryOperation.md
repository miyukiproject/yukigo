# Class: ListUnaryOperation

Represents a unary operation on a list, such as getting the head or tail.

## Constructors

### Constructor

> **new ListUnaryOperation**(`operator`, `operand`, `loc?`): `ListUnaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`ListUnaryOperator`](../Other/index.ListUnaryOperator.md) |
| `operand` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ListUnaryOperation`

#### Overrides

`ASTNode.constructor`
