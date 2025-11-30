# Class: ListPattern

Represents a pattern matching a list structure.

## Example

```ts
sum (x:xs) = x + sum xs
```

## Constructors

### Constructor

> **new ListPattern**(`elements`, `loc?`): `ListPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `elements` | [`Pattern`](../Other/index.Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ListPattern`

#### Overrides

`ASTNode.constructor`
