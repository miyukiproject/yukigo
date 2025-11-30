# Class: CharPrimitive

Generic char primitive

## Constructors

### Constructor

> **new CharPrimitive**(`value`, `loc?`): `CharPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`CharPrimitive`

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
