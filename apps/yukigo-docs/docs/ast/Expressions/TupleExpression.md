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
| `elements` | [`Expression`](../Other/Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TupleExpression`

#### Overrides

`ASTNode.constructor`
