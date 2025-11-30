# Class: NilPrimitive

Generic null/undefined primitive

## Constructors

### Constructor

> **new NilPrimitive**(`value`, `loc?`): `NilPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `null` |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`NilPrimitive`

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
