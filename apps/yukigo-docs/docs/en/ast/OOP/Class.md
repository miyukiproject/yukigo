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
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `extendsSymbol` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `implementsNode` | [`Implement`](Implement.md) |
| `expression` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Class`

#### Overrides

`ASTNode.constructor`
