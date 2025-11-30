# Class: Constraint

Represents a type constraint or class constraint (e.g., Eq a).

## Example

```ts
(Eq a) => a -> a -> Bool
```

## Constructors

### Constructor

> **new Constraint**(`name`, `parameters`, `loc?`): `Constraint`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `parameters` | [`Type`](../Other/Type.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Constraint`

#### Overrides

`ASTNode.constructor`
