# Class: ApplicationPattern

Represents a pattern matching a function application or constructor with arguments.

## Constructors

### Constructor

> **new ApplicationPattern**(`symbol`, `args`, `loc?`): `ApplicationPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `symbol` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `args` | [`Pattern`](../Other/Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ApplicationPattern`

#### Overrides

`ASTNode.constructor`
