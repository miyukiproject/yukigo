# Class: Record

Generic Record statement node.

## Example

```ts
data Record = Constructor { field :: String }
data PositionalRecord = Constructor String String
```

## Constructors

### Constructor

> **new Record**(`name`, `contents`, `deriving?`, `loc?`): `Record`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `contents` | [`Constructor`](Constructor.md)[] |
| `deriving?` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Record`

#### Overrides

`ASTNode.constructor`
