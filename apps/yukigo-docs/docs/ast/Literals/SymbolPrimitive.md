# Class: SymbolPrimitive

Generic symbol primitive

## Constructors

### Constructor

> **new SymbolPrimitive**(`value`, `loc?`): `SymbolPrimitive`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`SymbolPrimitive`

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
