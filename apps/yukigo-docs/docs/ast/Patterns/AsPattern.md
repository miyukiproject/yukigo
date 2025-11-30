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
| `alias` | [`VariablePattern`](index.VariablePattern.md) \| [`WildcardPattern`](index.WildcardPattern.md) |
| `pattern` | [`Pattern`](../Other/index.Pattern.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`AsPattern`

#### Overrides

`ASTNode.constructor`
