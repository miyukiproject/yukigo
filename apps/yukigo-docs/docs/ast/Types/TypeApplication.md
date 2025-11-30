# Class: TypeApplication

Represents the application of a type constructor to arguments (e.g., List Int).

## Constructors

### Constructor

> **new TypeApplication**(`functionType`, `argument`, `loc?`): `TypeApplication`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `functionType` | [`Type`](../Other/index.Type.md) |
| `argument` | [`Type`](../Other/index.Type.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`TypeApplication`

#### Overrides

`ASTNode.constructor`
