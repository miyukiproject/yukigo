# Class: ParameterizedType

Represents a type that accepts type parameters.

## Constructors

### Constructor

> **new ParameterizedType**(`inputs`, `returnType`, `constraints`, `loc?`): `ParameterizedType`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | [`Type`](../Other/index.Type.md)[] |
| `returnType` | [`Type`](../Other/index.Type.md) |
| `constraints` | [`Constraint`](index.Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ParameterizedType`

#### Overrides

`ASTNode.constructor`
