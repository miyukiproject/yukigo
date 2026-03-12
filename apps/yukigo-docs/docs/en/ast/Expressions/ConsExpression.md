# Class: ConsExpression

Cons expression, represent a concatenation of a head and a tail

## Example

```ts
f = x : xs
```

## Constructors

### Constructor

> **new ConsExpression**(`head`, `tail`, `loc?`): `ConsExpression`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `head` | [`Expression`](../Other/Expression.md) |
| `tail` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ConsExpression`

#### Overrides

`ASTNode.constructor`
