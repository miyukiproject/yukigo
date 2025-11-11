[yukigo-core](../../index.md) / [index](../index.md) / LogicalBinaryOperation

# Class: LogicalBinaryOperation

Defined in: [src/globals/operators.ts:192](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L192)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new LogicalBinaryOperation**(`operator`, `left`, `right`, `loc?`): `LogicalBinaryOperation`

Defined in: [src/globals/operators.ts:193](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L193)

#### Parameters

##### operator

[`LogicalBinaryOperator`](../type-aliases/LogicalBinaryOperator.md)

##### left

[`Expression`](../type-aliases/Expression.md)

##### right

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`LogicalBinaryOperation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### left

> **left**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:195](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L195)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operator

> **operator**: [`LogicalBinaryOperator`](../type-aliases/LogicalBinaryOperator.md)

Defined in: [src/globals/operators.ts:194](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L194)

***

### right

> **right**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:196](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L196)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:201](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L201)

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

Defined in: [src/globals/operators.ts:204](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L204)

#### Returns

`object`

##### left

> **left**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: [`LogicalBinaryOperator`](../type-aliases/LogicalBinaryOperator.md)

##### right

> **right**: [`Expression`](../type-aliases/Expression.md)

##### type

> **type**: `string` = `"LogicalBinaryOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
