[yukigo-core](../../index.md) / [index](../index.md) / StringOperation

# Class: StringOperation

Defined in: [src/globals/operators.ts:274](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L274)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new StringOperation**(`operator`, `left`, `right`, `loc?`): `StringOperation`

Defined in: [src/globals/operators.ts:275](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L275)

#### Parameters

##### operator

`"Concat"`

##### left

[`Expression`](../type-aliases/Expression.md)

##### right

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`StringOperation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### left

> **left**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:277](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L277)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operator

> **operator**: `"Concat"`

Defined in: [src/globals/operators.ts:276](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L276)

***

### right

> **right**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:278](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L278)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:283](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L283)

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

Defined in: [src/globals/operators.ts:286](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L286)

#### Returns

`object`

##### left

> **left**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: `"Concat"`

##### right

> **right**: [`Expression`](../type-aliases/Expression.md)

##### type

> **type**: `string` = `"StringOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
