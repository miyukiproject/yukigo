# Class: TupleExpression

Represent tuples - generic non-uniform fixed-size collection of elements

## Example

```ts
(1, "Hello", true)
```

## Constructors

### Constructor

> **new TupleExpression**(`elements`, `loc?`): `TupleExpression`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `elements` | [`Expression`](../Other/index.Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`TupleExpression`

#### Overrides

`ASTNode.constructor`
