# Class: Assignment

Represents an assignment operation, binding a value to a variable.

## Example

```ts
count = count + 1
```

## Constructors

### Constructor

> **new Assignment**(`identifier`, `expression`, `loc?`): `Assignment`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Assignment`

#### Overrides

`ASTNode.constructor`
