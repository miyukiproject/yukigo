# Class: Fact

Represents a fact, a rule with no body (always true).

## Example

```ts
human(socrates).
```

## Constructors

### Constructor

> **new Fact**(`identifier`, `patterns`, `loc?`): `Fact`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `patterns` | [`Pattern`](../Other/index.Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Fact`

#### Overrides

`ASTNode.constructor`
