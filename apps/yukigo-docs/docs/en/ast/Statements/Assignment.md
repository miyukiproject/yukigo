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
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Assignment`

#### Overrides

`ASTNode.constructor`
