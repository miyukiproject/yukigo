# Class: NumberPrimitive

Generic number primitive

## Constructors

### Constructor

> **new NumberPrimitive**(`value`, `loc?`): `NumberPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `number` |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`NumberPrimitive`

#### Overrides

`ASTNode.constructor`

## Methods

### equals()

> **equals**(`other`): `boolean`

Compares the primitive to other Primitive passed by argument

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | [`Primitive`](../Other/Primitive.md) | Another Primitive to compare to. |

#### Returns

`boolean`

True if both primitive have the same value
