# Class: FunctorPattern

Represents a pattern matching a functor or compound term.

## Constructors

### Constructor

> **new FunctorPattern**(`identifier`, `args`, `loc?`): `FunctorPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `args` | [`Pattern`](../Other/index.Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`FunctorPattern`

#### Overrides

`ASTNode.constructor`
