[yukigo-core](../../index.md) / [index](../index.md) / ArithmeticUnaryOperation

# Class: ArithmeticUnaryOperation

Defined in: [src/globals/operators.ts:87](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L87)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new ArithmeticUnaryOperation**(`operator`, `operand`, `loc?`): `ArithmeticUnaryOperation`

Defined in: [src/globals/operators.ts:88](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L88)

#### Parameters

##### operator

[`ArithmeticUnaryOperator`](../type-aliases/ArithmeticUnaryOperator.md)

##### operand

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`ArithmeticUnaryOperation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operand

> **operand**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/operators.ts:90](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L90)

***

### operator

> **operator**: [`ArithmeticUnaryOperator`](../type-aliases/ArithmeticUnaryOperator.md)

Defined in: [src/globals/operators.ts:89](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L89)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:95](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L95)

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

Defined in: [src/globals/operators.ts:98](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L98)

#### Returns

`object`

##### operand

> **operand**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: [`ArithmeticUnaryOperator`](../type-aliases/ArithmeticUnaryOperator.md)

##### type

> **type**: `string` = `"ArithmeticUnaryOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
