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
| `expression` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Query`

#### Overrides

`ASTNode.constructor`
