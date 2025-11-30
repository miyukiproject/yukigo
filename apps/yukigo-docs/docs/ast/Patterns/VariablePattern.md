# Class: VariablePattern

Represents a pattern that matches any value and binds it to a variable.

## Example

```ts
map (\x -> x + 1)
```

## Constructors

### Constructor

> **new VariablePattern**(`name`, `loc?`): `VariablePattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`VariablePattern`

#### Overrides

`ASTNode.constructor`
