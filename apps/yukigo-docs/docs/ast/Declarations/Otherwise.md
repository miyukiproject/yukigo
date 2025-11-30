# Class: Otherwise

Otherwise used as the default case in GuardBody

## Example

```ts
f x
 | x == 2 = 16
 | otherwise = x * 8
```

## Constructors

### Constructor

> **new Otherwise**(`loc?`): `Otherwise`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Otherwise`

#### Inherited from

`ASTNode.constructor`
