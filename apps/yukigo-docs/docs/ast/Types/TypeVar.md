# Class: TypeVar

Represents a type variable (e.g., 'a), used in polymorphic types.

## Constructors

### Constructor

> **new TypeVar**(`value`, `constraints`, `loc?`): `TypeVar`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` |
| `constraints` | [`Constraint`](index.Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`TypeVar`

#### Overrides

`ASTNode.constructor`
