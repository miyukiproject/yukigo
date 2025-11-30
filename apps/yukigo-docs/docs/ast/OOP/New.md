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
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `args` | [`Expression`](../Other/index.Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`New`

#### Overrides

`ASTNode.constructor`
