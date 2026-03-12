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
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `patterns` | [`Pattern`](../Other/Pattern.md)[] |
| `expressions` | [`Expression`](../Other/Expression.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Rule`

#### Overrides

`ASTNode.constructor`
