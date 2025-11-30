# Class: Query

Represents a query or goal to be proven.

## Example

```ts
?- human(X).
```

## Constructors

### Constructor

> **new Query**(`expression`, `loc?`): `Query`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Query`

#### Overrides

`ASTNode.constructor`
