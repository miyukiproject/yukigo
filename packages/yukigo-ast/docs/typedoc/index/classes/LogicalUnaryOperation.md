[yukigo-core](../../index.md) / [index](../index.md) / LogicalUnaryOperation

# Class: LogicalUnaryOperation

Defined in: [src/globals/operators.ts:213](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L213)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new LogicalUnaryOperation**(`operator`, `operand`, `loc?`): `LogicalUnaryOperation`

Defined in: [src/globals/operators.ts:214](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L214)

#### Parameters

##### operator

`"Negation"`

##### operand

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`LogicalUnaryOperation`

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

Defined in: [src/globals/operators.ts:216](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L216)

***

### operator

> **operator**: `"Negation"`

Defined in: [src/globals/operators.ts:215](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L215)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/operators.ts:221](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L221)

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

Defined in: [src/globals/operators.ts:224](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/operators.ts#L224)

#### Returns

`object`

##### operand

> **operand**: [`Expression`](../type-aliases/Expression.md)

##### operator

> **operator**: `"Negation"`

##### type

> **type**: `string` = `"LogicalUnaryOperation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
