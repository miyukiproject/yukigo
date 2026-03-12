# Class: ParameterizedType

Represents a type that accepts type parameters.

## Constructors

### Constructor

> **new ParameterizedType**(`inputs`, `returnType`, `constraints`, `loc?`): `ParameterizedType`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | [`Type`](../Other/Type.md)[] |
| `returnType` | [`Type`](../Other/Type.md) |
| `constraints` | [`Constraint`](Constraint.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ParameterizedType`

#### Overrides

`ASTNode.constructor`
