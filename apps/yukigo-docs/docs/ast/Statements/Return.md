# Class: Return

Generic return statement.

## Examples

```ts
// In Haskell
f x = x * 2
// The parser takes the body and uses it as a Return
```

```ts
function f(x) {
   return x * 2 // The node holds this expression
}
```

## Constructors

### Constructor

> **new Return**(`body`, `loc?`): `Return`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `body` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Return`

#### Overrides

`ASTNode.constructor`
