# Class: ConsPattern

Represents a pattern matching the head and tail of a list (x:xs).

## Constructors

### Constructor

> **new ConsPattern**(`head`, `tail`, `loc?`): `ConsPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `head` | [`Pattern`](../Other/Pattern.md) |
| `tail` | [`Pattern`](../Other/Pattern.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ConsPattern`

#### Overrides

`ASTNode.constructor`
