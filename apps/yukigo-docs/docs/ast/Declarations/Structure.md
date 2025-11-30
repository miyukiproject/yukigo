# Class: Structure

Represents a definition of a structured data type (struct).

## Constructors

### Constructor

> **new Structure**(`identifier`, `elements`, `loc?`): `Structure`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `elements` | ([`Variable`](../Expressions/index.Variable.md) \| `Structure`)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Structure`

#### Overrides

`ASTNode.constructor`
