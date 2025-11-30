# Class: Class

Represents a class definition, a blueprint for objects.

## Example

```ts
class Bird inherits Animal { ... }
```

## Constructors

### Constructor

> **new Class**(`identifier`, `extendsSymbol`, `implementsNode`, `expression`, `loc?`): `Class`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `extendsSymbol` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `implementsNode` | [`Implement`](index.Implement.md) |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Class`

#### Overrides

`ASTNode.constructor`
