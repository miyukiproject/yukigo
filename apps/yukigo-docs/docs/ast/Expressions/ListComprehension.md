# Class: ListComprehension

ListComprehension when the for expression is a yield.
Scala's for comprehensions, Erlang's and Haskell's list comprehensions

## Example

```ts
m = [ f x | x <- [1, 2, 3, 4] ]
```

## Constructors

### Constructor

> **new ListComprehension**(`projection`, `generators`, `loc?`): `ListComprehension`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `projection` | [`Expression`](../Other/index.Expression.md) |
| `generators` | ([`Generator`](../Declarations/index.Generator.md) \| [`Expression`](../Other/index.Expression.md))[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ListComprehension`

#### Overrides

`ASTNode.constructor`
