# Class: LetInExpression

Represent let...in expressions normally used in Haskell

## Example

```ts
f = let x = 2 in x * 4
```

## Constructors

### Constructor

> **new LetInExpression**(`declarations`, `expression`, `loc?`): `LetInExpression`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | [`Sequence`](../Statements/index.Sequence.md) |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`LetInExpression`

#### Overrides

`ASTNode.constructor`
