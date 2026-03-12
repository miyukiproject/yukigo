# Class: Structure

Represents a definition of a structured data type (struct).

## Constructors

### Constructor

> **new Structure**(`identifier`, `elements`, `loc?`): `Structure`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `elements` | ([`Variable`](../Expressions/Variable.md) \| `Structure`)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Structure`

#### Overrides

`ASTNode.constructor`
