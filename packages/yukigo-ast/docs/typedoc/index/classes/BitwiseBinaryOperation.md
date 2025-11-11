[yukigo-core](../../index.md) / [index](../index.md) / BitwiseBinaryOperation

# Class: BitwiseBinaryOperation

Defined in: [src/globals/operators.ts:233](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L233)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new BitwiseBinaryOperation**(`operator`, `left`, `right`, `loc?`): `BitwiseBinaryOperation`

Defined in: [src/globals/operators.ts:234](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L234)

#### Parameters

##### operator

[`BitwiseBinaryOperator`](../type-aliases/BitwiseBinaryOperator.md)

##### left

[`Expression`](../type-aliases/Expression.md)

##### right

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`BitwiseBinaryOperation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### left

> **left**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:236](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L236)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operator

> **operator**: [`BitwiseBinaryOperator`](../type-aliases/BitwiseBinaryOperator.md)

Defined in: [src/globals/operators.ts:235](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L235)

***

### right

> **right**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:237](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L237)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:242](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L242)

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

Defined in: [src/globals/operators.ts:245](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L245)

#### Returns

`object`

##### left

> **left**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: [`BitwiseBinaryOperator`](../type-aliases/BitwiseBinaryOperator.md)

##### right

> **right**: [`Expression`](../type-aliases/Expression.md)

##### type

> **type**: `string` = `"BitwiseBinaryOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
