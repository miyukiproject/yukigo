[yukigo-core](../../index.md) / [index](../index.md) / ForLoop

# Class: ForLoop

Defined in: [src/paradigms/imperative.ts:109](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L109)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new ForLoop**(`initialization`, `condition`, `update`, `body`, `loc?`): `ForLoop`

Defined in: [src/paradigms/imperative.ts:110](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L110)

#### Parameters

##### initialization

[`Expression`](../type-aliases/Expression.md)

##### condition

[`Expression`](../type-aliases/Expression.md)

##### update

[`Expression`](../type-aliases/Expression.md)

##### body

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`ForLoop`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### body

> **body**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/imperative.ts:114](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L114)

***

### condition

> **condition**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/imperative.ts:112](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L112)

***

### initialization

> **initialization**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/imperative.ts:111](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L111)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### update

> **update**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/imperative.ts:113](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L113)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/imperative.ts:119](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L119)

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

Defined in: [src/paradigms/imperative.ts:122](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L122)

#### Returns

`object`

##### body

> **body**: `any`

##### condition

> **condition**: `any`

##### initialization

> **initialization**: `any`

##### type

> **type**: `string` = `"ForLoop"`

##### update

> **update**: `any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
