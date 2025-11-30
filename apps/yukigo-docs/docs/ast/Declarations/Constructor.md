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
| `name` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `fields` | [`Field`](Field.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Constructor`

#### Overrides

`ASTNode.constructor`
