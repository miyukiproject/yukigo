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
| `name` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `contents` | [`Constructor`](index.Constructor.md)[] |
| `deriving?` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Record`

#### Overrides

`ASTNode.constructor`
