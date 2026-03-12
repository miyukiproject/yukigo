# Class: FunctorPattern

Represents a pattern matching a functor or compound term.

## Constructors

### Constructor

> **new FunctorPattern**(`identifier`, `args`, `loc?`): `FunctorPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `args` | [`Pattern`](../Other/Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`FunctorPattern`

#### Overrides

`ASTNode.constructor`
