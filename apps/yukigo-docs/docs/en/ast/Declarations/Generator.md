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
| `variable` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Generator`

#### Overrides

`ASTNode.constructor`
