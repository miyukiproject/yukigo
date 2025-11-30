# Class: Rule

Represents a logic programming rule (Head :- Body).

## Example

```ts
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
```

## Constructors

### Constructor

> **new Rule**(`identifier`, `patterns`, `expressions`, `loc?`): `Rule`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `patterns` | [`Pattern`](../Other/index.Pattern.md)[] |
| `expressions` | [`Expression`](../Other/index.Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Rule`

#### Overrides

`ASTNode.constructor`
