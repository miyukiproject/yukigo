# Class: TypeSignature

Represents an explicit type signature declaration for a function or variable.

## Example

```ts
add :: Int -> Int -> Int
```

## Constructors

### Constructor

> **new TypeSignature**(`identifier`, `body`, `loc?`): `TypeSignature`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `body` | [`Type`](../Other/index.Type.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`TypeSignature`

#### Overrides

`ASTNode.constructor`
