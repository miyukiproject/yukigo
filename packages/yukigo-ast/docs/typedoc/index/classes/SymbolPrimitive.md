[yukigo-core](../../index.md) / [index](../index.md) / SymbolPrimitive

# Class: SymbolPrimitive

Defined in: [src/globals/generics.ts:161](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L161)

Generic symbol primitive

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new SymbolPrimitive**(`value`, `loc?`): `SymbolPrimitive`

Defined in: [src/globals/generics.ts:162](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L162)

#### Parameters

##### value

`string`

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`SymbolPrimitive`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### value

> **value**: `string`

Defined in: [src/globals/generics.ts:162](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L162)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:165](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L165)

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

Defined in: [src/globals/generics.ts:168](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L168)

#### Returns

`object`

##### type

> **type**: `string` = `"YuSymbol"`

##### value

> **value**: `string`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
