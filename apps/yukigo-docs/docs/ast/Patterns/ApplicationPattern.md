# Class: ApplicationPattern

Represents a pattern matching a function application or constructor with arguments.

## Constructors

### Constructor

> **new ApplicationPattern**(`symbol`, `args`, `loc?`): `ApplicationPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `symbol` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `args` | [`Pattern`](../Other/index.Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`ApplicationPattern`

#### Overrides

`ASTNode.constructor`
