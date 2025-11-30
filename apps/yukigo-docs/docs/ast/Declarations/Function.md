# Class: Function

Functional / Imperative programming function declaration.
It is is composed by an identifier and one or more equations

## Examples

```ts
int foo (int bar) {
   return bar;
}
```

```ts
def foo(bar):
   return bar
```

## Constructors

### Constructor

> **new Function**(`identifier`, `equations`, `loc?`): `Function`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `identifier` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `equations` | [`Equation`](Equation.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`Function`

#### Overrides

`ASTNode.constructor`
