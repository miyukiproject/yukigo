# Class: Try

Represents a try block, wrapping code that might throw exceptions.

## Example

```ts
try { ... } catch e : DomainException { ... }
```

## Constructors

### Constructor

> **new Try**(`body`, `catchExpr`, `finallyExpr`, `loc?`): `Try`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `body` | [`Expression`](../Other/Expression.md) |
| `catchExpr` | [`Catch`](Catch.md)[] |
| `finallyExpr` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Try`

#### Overrides

`ASTNode.constructor`
