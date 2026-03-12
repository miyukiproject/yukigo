# Class: LogicalUnaryOperation

Represents a unary logical operation like NOT.

## Constructors

### Constructor

> **new LogicalUnaryOperation**(`operator`, `operand`, `loc?`): `LogicalUnaryOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | `"Negation"` |
| `operand` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`LogicalUnaryOperation`

#### Overrides

`ASTNode.constructor`
