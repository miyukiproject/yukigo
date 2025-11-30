# Class: Method

Represents a method definition within a class or object.

## Example

```ts
method exhaust() {
   energy -= 5
}
```

## Constructors

### Constructor

> **new Method**(`identifier`, `equations`, `loc?`): `Method`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `equations` | [`Equation`](../Declarations/index.Equation.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`Method`

#### Overrides

`ASTNode.constructor`
