# Class: DataExpression

Data expression, used to construct Records

## Example

```ts
f = DataName { fieldName = 2 }
```

## Constructors

### Constructor

> **new DataExpression**(`name`, `contents`, `loc?`): `DataExpression`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |
| `contents` | [`FieldExpression`](index.FieldExpression.md)[] |
| `loc?` | [`SourceLocation`](../Other/index.SourceLocation.md) |

#### Returns

`DataExpression`

#### Overrides

`ASTNode.constructor`
