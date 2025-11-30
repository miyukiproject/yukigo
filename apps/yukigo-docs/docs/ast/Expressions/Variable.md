# Class: Variable

Represents a variable usage or reference in an expression.

## Constructors

### Constructor

> **new Variable**(`identifier`, `expression`, `variableType?`, `loc?`): `Variable`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/Expression.md) |
| `variableType?` | [`Type`](../Other/Type.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Variable`

#### Overrides

`ASTNode.constructor`
