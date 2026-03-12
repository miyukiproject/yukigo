# Class: TupleType

Represents a tuple type (e.g., (Int, Bool)).

## Constructors

### Constructor

> **new TupleType**(`values`, `constraints`, `loc?`): `TupleType`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `values` | [`Type`](../Other/Type.md)[] |
| `constraints` | [`Constraint`](Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TupleType`

#### Overrides

`ASTNode.constructor`
