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
| `head` | [`Expression`](../Other/index.Expression.md) |
| `tail` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ConsExpression`

#### Overrides

`ASTNode.constructor`
