# Class: UnionPattern

Represents a union of patterns, matching if any of the sub-patterns match.

## Constructors

### Constructor

> **new UnionPattern**(`patterns`, `loc?`): `UnionPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `patterns` | [`Pattern`](../Other/Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`UnionPattern`

#### Overrides

`ASTNode.constructor`
