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
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `body` | [`Type`](../Other/Type.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TypeSignature`

#### Overrides

`ASTNode.constructor`
