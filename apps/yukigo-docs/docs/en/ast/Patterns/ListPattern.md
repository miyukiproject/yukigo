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
| `elements` | [`Pattern`](../Other/Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ListPattern`

#### Overrides

`ASTNode.constructor`
