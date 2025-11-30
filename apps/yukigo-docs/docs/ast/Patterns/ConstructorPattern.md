# Class: ConstructorPattern

Represents a pattern matching a specific data constructor.

## Example

```ts
safeDiv (Just x) y = x / y
```

## Constructors

### Constructor

> **new ConstructorPattern**(`constr`, `patterns`, `loc?`): `ConstructorPattern`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `constr` | `string` |
| `patterns` | [`Pattern`](../Other/Pattern.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`ConstructorPattern`

#### Overrides

`ASTNode.constructor`
