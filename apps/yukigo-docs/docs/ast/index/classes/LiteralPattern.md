[yukigo-core](../../index.md) / [index](../index.md) / LiteralPattern

# Class: LiteralPattern

Defined in: [src/globals/patterns.ts:24](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L24)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new LiteralPattern**(`name`, `loc?`): `LiteralPattern`

Defined in: [src/globals/patterns.ts:25](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L25)

#### Parameters

##### name

[`Primitive`](../type-aliases/Primitive.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`LiteralPattern`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### name

> **name**: [`Primitive`](../type-aliases/Primitive.md)

Defined in: [src/globals/patterns.ts:25](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L25)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/patterns.ts:28](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L28)

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

Defined in: [src/globals/patterns.ts:31](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L31)

#### Returns

`object`

##### name

> **name**: \{ `type`: `string`; `value`: `string`; \} \| \{ `type`: `string`; `value`: `number`; \} \| \{ `type`: `string`; `value`: `boolean`; \} \| \{ `type`: `string`; `value`: [`Expression`](../type-aliases/Expression.md)[]; \}

##### type

> **type**: `string` = `"LiteralPattern"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
