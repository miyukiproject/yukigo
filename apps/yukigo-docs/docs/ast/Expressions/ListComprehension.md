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
| `projection` | [`Expression`](../Other/Expression.md) |
| `generators` | ([`Generator`](../Declarations/Generator.md) \| [`Expression`](../Other/Expression.md))[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ListComprehension`

#### Overrides

`ASTNode.constructor`
