# Class: Constructor

Generic constructor node.
Holds an array of Field nodes.

## Example

```ts
data Record = Constructor { field :: String }
```

## Constructors

### Constructor

> **new Constructor**(`name`, `fields`, `loc?`): `Constructor`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `fields` | [`Field`](index.Field.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Constructor`

#### Overrides

`ASTNode.constructor`
