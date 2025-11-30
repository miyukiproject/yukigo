# Class: Send

Represents a message send or method invocation on an object.

## Example

```ts
pepita.fly(10)
```

## Constructors

### Constructor

> **new Send**(`receiver`, `selector`, `args`, `loc?`): `Send`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `receiver` | [`Expression`](../Other/index.Expression.md) |
| `selector` | [`Expression`](../Other/index.Expression.md) |
| `args` | [`Expression`](../Other/index.Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Send`

#### Overrides

`ASTNode.constructor`
