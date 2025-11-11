[yukigo-core](../../index.md) / [index](../index.md) / If

# Class: If

Defined in: [src/globals/generics.ts:479](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L479)

Generic conditional If statements.
Nested `else if` need to be desugared into `else { if ... }`

## Example

```ts
if (condition) { ... } else { ... }
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new If**(`condition`, `then`, `elseExpr`, `loc?`): `If`

Defined in: [src/globals/generics.ts:480](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L480)

#### Parameters

##### condition

[`Expression`](../type-aliases/Expression.md)

##### then

[`Expression`](../type-aliases/Expression.md)

##### elseExpr

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`If`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### condition

> **condition**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:481](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L481)

***

### elseExpr

> **elseExpr**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:483](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L483)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### then

> **then**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:482](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L482)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:488](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L488)

#### Type Parameters

##### R

`R`

#### Parameters

##### visitor

[`Visitor`](../../visitor/type-aliases/Visitor.md)\<`R`\>

#### Returns

`R`

#### Overrides

[`ASTNode`](ASTNode.md).[`accept`](ASTNode.md#accept)

***

### toJSON()

> **toJSON**(): `object`

Defined in: [src/globals/generics.ts:491](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L491)

#### Returns

`object`

##### condition

> **condition**: `any`

##### else

> **else**: `any`

##### then

> **then**: `any`

##### type

> **type**: `string` = `"If"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
