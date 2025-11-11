[yukigo-core](../../index.md) / [index](../index.md) / Rule

# Class: Rule

Defined in: [src/paradigms/logic.ts:13](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L13)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Rule**(`identifier`, `patterns`, `expressions`, `loc?`): `Rule`

Defined in: [src/paradigms/logic.ts:14](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L14)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### patterns

[`Pattern`](../type-aliases/Pattern.md)[]

##### expressions

[`Expression`](../type-aliases/Expression.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Rule`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### expressions

> **expressions**: [`Expression`](../type-aliases/Expression.md)[]

Defined in: [src/paradigms/logic.ts:17](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L17)

***

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/paradigms/logic.ts:15](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L15)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### patterns

> **patterns**: [`Pattern`](../type-aliases/Pattern.md)[]

Defined in: [src/paradigms/logic.ts:16](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L16)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/logic.ts:22](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L22)

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

Defined in: [src/paradigms/logic.ts:25](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L25)

#### Returns

`object`

##### expressions

> **expressions**: `any`[]

##### identifier

> **identifier**: `object`

###### identifier.type

> **type**: `string` = `"YuSymbol"`

###### identifier.value

> **value**: `string`

##### patterns

> **patterns**: `any`[]

##### type

> **type**: `string` = `"Rule"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
