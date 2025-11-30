# Class: Procedure

Represents a procedure definition, typically a function without a return value.

## Constructors

### Constructor

> **new Procedure**(`identifier`, `equations`, `loc?`): `Procedure`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `equations` | [`Equation`](Equation.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Procedure`

#### Overrides

`ASTNode.constructor`
