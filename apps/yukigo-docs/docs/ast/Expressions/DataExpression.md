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
| `name` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |
| `contents` | [`FieldExpression`](FieldExpression.md)[] |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`DataExpression`

#### Overrides

`ASTNode.constructor`
