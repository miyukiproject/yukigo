[yukigo-core](../../index.md) / [index](../index.md) / TypeAlias

# Class: TypeAlias

Defined in: [src/globals/types.ts:170](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L170)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new TypeAlias**(`identifier`, `variables`, `value`, `loc?`): `TypeAlias`

Defined in: [src/globals/types.ts:171](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L171)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### variables

`string`[]

##### value

[`Type`](../type-aliases/Type.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`TypeAlias`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/globals/types.ts:172](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L172)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### value

> **value**: [`Type`](../type-aliases/Type.md)

Defined in: [src/globals/types.ts:174](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L174)

***

### variables

> **variables**: `string`[]

Defined in: [src/globals/types.ts:173](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L173)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/types.ts:179](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L179)

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

Defined in: [src/globals/types.ts:182](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L182)

#### Returns

`object`

##### identifier

> **identifier**: `object`

###### identifier.type

> **type**: `string` = `"YuSymbol"`

###### identifier.value

> **value**: `string`

##### type

> **type**: `string` = `"TypeAlias"`

##### value

> **value**: `any`

##### variables

> **variables**: `string`[]

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
