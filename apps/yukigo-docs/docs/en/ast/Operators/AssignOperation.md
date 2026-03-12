# Class: AssignOperation

Represents an in-place assignment operation (e.g., +=, -=).

## Constructors

### Constructor

> **new AssignOperation**(`operator`, `left`, `right`, `loc?`): `AssignOperation`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | `"Assign"` |
| `left` | [`Expression`](../Other/Expression.md) |
| `right` | [`Expression`](../Other/Expression.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`AssignOperation`

#### Overrides

`ASTNode.constructor`
