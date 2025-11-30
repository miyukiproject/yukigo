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
| `start` | [`Expression`](../Other/Expression.md) |
| `end?` | [`Expression`](../Other/Expression.md) |
| `step?` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`RangeExpression`

#### Overrides

`ASTNode.constructor`
