# Class: Field

Generic field in a Record statement.
The name can be undefined to support positional-only Records

## Example

```ts
... { name :: String }
```

## Constructors

### Constructor

> **new Field**(`name`, `value`, `loc?`): `Field`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `value` | [`Type`](../Other/index.Type.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Field`

#### Overrides

`ASTNode.constructor`
