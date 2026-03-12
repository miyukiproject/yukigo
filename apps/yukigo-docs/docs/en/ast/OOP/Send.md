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
| `receiver` | [`Expression`](../Other/Expression.md) |
| `selector` | [`Expression`](../Other/Expression.md) |
| `args` | [`Expression`](../Other/Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Send`

#### Overrides

`ASTNode.constructor`
