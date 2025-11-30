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
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `equations` | [`Equation`](../Declarations/Equation.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Method`

#### Overrides

`ASTNode.constructor`
