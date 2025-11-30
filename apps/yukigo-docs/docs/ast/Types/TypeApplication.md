# Class: TypeApplication

Represents the application of a type constructor to arguments (e.g., List Int).

## Constructors

### Constructor

> **new TypeApplication**(`functionType`, `argument`, `loc?`): `TypeApplication`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `functionType` | [`Type`](../Other/Type.md) |
| `argument` | [`Type`](../Other/Type.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TypeApplication`

#### Overrides

`ASTNode.constructor`
