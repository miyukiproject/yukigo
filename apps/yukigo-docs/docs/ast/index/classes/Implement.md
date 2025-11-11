[yukigo-core](../../index.md) / [index](../index.md) / Implement

# Class: Implement

Defined in: [src/paradigms/object.ts:158](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L158)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Implement**(`identifier`, `loc?`): `Implement`

Defined in: [src/paradigms/object.ts:159](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L159)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Implement`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/paradigms/object.ts:159](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L159)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/object.ts:162](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L162)

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

Defined in: [src/paradigms/object.ts:165](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L165)

#### Returns

`object`

##### identifier

> **identifier**: `object`

###### identifier.type

> **type**: `string` = `"YuSymbol"`

###### identifier.value

> **value**: `string`

##### type

> **type**: `string` = `"Implement"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
