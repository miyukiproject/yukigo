# Class: Application

Represents the application of a function to an argument.

## Example

```ts
map (*2) [1..5]
```

## Constructors

### Constructor

> **new Application**(`functionExpr`, `parameter`, `loc?`): `Application`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `functionExpr` | [`Expression`](../Other/index.Expression.md) |
| `parameter` | [`Expression`](../Other/index.Expression.md) |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Application`

#### Overrides

`ASTNode.constructor`
