# Class: UnifyOperation

Represents a unification operation (=), fundamental to logic programming.

## Example

```ts
X = 5
```

## Constructors

### Constructor

> **new UnifyOperation**(`operator`, `left`, `right`, `loc?`): `UnifyOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | `"Unify"` |
| `left` | [`Expression`](../Other/index.Expression.md) |
| `right` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`UnifyOperation`

#### Overrides

`ASTNode.constructor`
