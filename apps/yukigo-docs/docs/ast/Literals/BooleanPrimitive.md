# Class: BooleanPrimitive

Generic boolean primitive

## Constructors

### Constructor

> **new BooleanPrimitive**(`value`, `loc?`): `BooleanPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `boolean` |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`BooleanPrimitive`

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
