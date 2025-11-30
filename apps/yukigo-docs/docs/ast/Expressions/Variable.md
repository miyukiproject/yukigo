# Class: Variable

Represents a variable usage or reference in an expression.

## Constructors

### Constructor

> **new Variable**(`identifier`, `expression`, `variableType?`, `loc?`): `Variable`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `expression` | [`Expression`](../Other/index.Expression.md) |
| `variableType?` | [`Type`](../Other/index.Type.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Variable`

#### Overrides

`ASTNode.constructor`
