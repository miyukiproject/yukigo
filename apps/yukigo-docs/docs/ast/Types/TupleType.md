# Class: TupleType

Represents a tuple type (e.g., (Int, Bool)).

## Constructors

### Constructor

> **new TupleType**(`values`, `constraints`, `loc?`): `TupleType`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `values` | [`Type`](../Other/index.Type.md)[] |
| `constraints` | [`Constraint`](index.Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`TupleType`

#### Overrides

`ASTNode.constructor`
