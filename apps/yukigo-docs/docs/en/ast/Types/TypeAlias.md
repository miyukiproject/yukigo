# Class: TypeAlias

Represents a type alias definition, giving a new name to an existing type.

## Example

```ts
type String = [Char]
```

## Constructors

### Constructor

> **new TypeAlias**(`identifier`, `variables`, `value`, `loc?`): `TypeAlias`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `variables` | `string`[] |
| `value` | [`Type`](../Other/Type.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`TypeAlias`

#### Overrides

`ASTNode.constructor`
