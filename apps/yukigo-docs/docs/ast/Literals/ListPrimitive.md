# Class: ListPrimitive

Represent lists - generic uniform variable-size collection of elements. Lists typically map to arrays, lists or sequence-like structures.

## Constructors

### Constructor

> **new ListPrimitive**(`elements`, `loc?`): `ListPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `elements` | [`Expression`](../Other/index.Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ListPrimitive`

#### Overrides

`ASTNode.constructor`

## Methods

### equals()

> **equals**(`other`): `boolean`

Compares the primitive to other Primitive passed by argument

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Primitive`](../Other/index.Primitive.md) | Another Primitive to compare to. |

#### Returns

`boolean`

True if both primitive have the same value
