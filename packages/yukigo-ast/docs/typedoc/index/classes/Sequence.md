[yukigo-core](../../index.md) / [index](../index.md) / Sequence

# Class: Sequence

Defined in: [src/globals/generics.ts:929](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L929)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Sequence**(`statements`, `loc?`): `Sequence`

Defined in: [src/globals/generics.ts:930](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L930)

#### Parameters

##### statements

[`Statement`](../type-aliases/Statement.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Sequence`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### statements

> **statements**: [`Statement`](../type-aliases/Statement.md)[]

Defined in: [src/globals/generics.ts:930](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L930)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:933](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L933)

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

> **toJSON**(): `any`

Defined in: [src/globals/generics.ts:936](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L936)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
