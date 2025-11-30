# Class: Generator

Generator represents patterns like "Just m <- ms" or "x <- [1,2,3]"

## Example

```ts
x <- [1, 2, 3, 4]
```

## Constructors

### Constructor

> **new Generator**(`variable`, `expression`, `loc?`): `Generator`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `variable` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Generator`

#### Overrides

`ASTNode.constructor`
