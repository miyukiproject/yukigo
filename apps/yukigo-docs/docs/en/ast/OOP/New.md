# Class: New

Represents the instantiation of a class.

## Example

```ts
new Bird()
```

## Constructors

### Constructor

> **new New**(`identifier`, `args`, `loc?`): `New`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `args` | [`Expression`](../Other/Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`New`

#### Overrides

`ASTNode.constructor`
