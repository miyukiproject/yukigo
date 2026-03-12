# Class: Lambda

Represents an anonymous function or lambda abstraction.

## Example

```ts
\x -> x + 1
```

## Constructors

### Constructor

> **new Lambda**(`parameters`, `body`, `loc?`): `Lambda`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parameters` | [`Pattern`](../Other/Pattern.md)[] |
| `body` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Lambda`

#### Overrides

`ASTNode.constructor`
