# Class: RangeExpression

RangeExpression represents when a list is given by comprehension in a defined range

## Examples

```ts
(1..10)
```

```ts
(1, 2..10)
```

```ts
(1..)
```

## Constructors

### Constructor

> **new RangeExpression**(`start`, `end?`, `step?`, `loc?`): `RangeExpression`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `start` | [`Expression`](../Other/index.Expression.md) |
| `end?` | [`Expression`](../Other/index.Expression.md) |
| `step?` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`RangeExpression`

#### Overrides

`ASTNode.constructor`
