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
| `body` | [`Expression`](../Other/index.Expression.md) |
| `catchExpr` | [`Catch`](index.Catch.md)[] |
| `finallyExpr` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Try`

#### Overrides

`ASTNode.constructor`
