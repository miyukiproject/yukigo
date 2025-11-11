[yukigo-core](../../index.md) / [index](../index.md) / UnifyOperation

# Class: UnifyOperation

Defined in: [src/globals/operators.ts:296](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L296)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new UnifyOperation**(`operator`, `left`, `right`, `loc?`): `UnifyOperation`

Defined in: [src/globals/operators.ts:297](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L297)

#### Parameters

##### operator

`"Unify"`

##### left

[`Expression`](../type-aliases/Expression.md)

##### right

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`UnifyOperation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### left

> **left**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:299](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L299)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operator

> **operator**: `"Unify"`

Defined in: [src/globals/operators.ts:298](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L298)

***

### right

> **right**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:300](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L300)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:305](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L305)

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

Defined in: [src/globals/operators.ts:308](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L308)

#### Returns

`object`

##### left

> **left**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: `"Unify"`

##### right

> **right**: [`Expression`](../type-aliases/Expression.md)

##### type

> **type**: `string` = `"UnifyOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
