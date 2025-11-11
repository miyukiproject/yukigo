[yukigo-core](../../index.md) / [index](../index.md) / Interface

# Class: Interface

Defined in: [src/paradigms/object.ts:94](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L94)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Interface**(`identifier`, `extendsSymbol`, `expression`, `loc?`): `Interface`

Defined in: [src/paradigms/object.ts:95](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L95)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### extendsSymbol

[`SymbolPrimitive`](SymbolPrimitive.md)[]

##### expression

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Interface`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### expression

> **expression**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/object.ts:98](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L98)

***

### extendsSymbol

> **extendsSymbol**: [`SymbolPrimitive`](SymbolPrimitive.md)[]

Defined in: [src/paradigms/object.ts:97](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L97)

***

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/paradigms/object.ts:96](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L96)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/object.ts:103](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L103)

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

Defined in: [src/paradigms/object.ts:106](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/object.ts#L106)

#### Returns

`object`

##### expression

> **expression**: `any`

##### extends

> **extends**: `object`[]

##### identifier

> **identifier**: `object`

###### identifier.type

> **type**: `string` = `"YuSymbol"`

###### identifier.value

> **value**: `string`

##### type

> **type**: `string` = `"Interface"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
