# Class: AsPattern

Represents an alias pattern (e.g., x@pat), binding the whole value to a name while matching inner patterns.

## Example

```ts
f p@(x, y) = ...
```

## Constructors

### Constructor

> **new AsPattern**(`alias`, `pattern`, `loc?`): `AsPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `alias` | [`VariablePattern`](VariablePattern.md) \| [`WildcardPattern`](WildcardPattern.md) |
| `pattern` | [`Pattern`](../Other/Pattern.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`AsPattern`

#### Overrides

`ASTNode.constructor`
