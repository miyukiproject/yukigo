# Class: TypeVar

Represents a type variable (e.g., 'a), used in polymorphic types.

## Constructors

### Constructor

> **new TypeVar**(`value`, `constraints`, `loc?`): `TypeVar`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` |
| `constraints` | [`Constraint`](Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TypeVar`

#### Overrides

`ASTNode.constructor`
