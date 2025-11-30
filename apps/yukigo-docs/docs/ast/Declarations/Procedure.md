# Class: Procedure

Represents a procedure definition, typically a function without a return value.

## Constructors

### Constructor

> **new Procedure**(`identifier`, `equations`, `loc?`): `Procedure`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `equations` | [`Equation`](index.Equation.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Procedure`

#### Overrides

`ASTNode.constructor`
