[yukigo-core](../../index.md) / [index](../index.md) / Findall

# Class: Findall

Defined in: [src/paradigms/logic.ts:123](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L123)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Findall**(`template`, `goal`, `bag`, `loc?`): `Findall`

Defined in: [src/paradigms/logic.ts:124](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L124)

#### Parameters

##### template

[`Expression`](../type-aliases/Expression.md)

##### goal

[`Expression`](../type-aliases/Expression.md)

##### bag

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Findall`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### bag

> **bag**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/logic.ts:127](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L127)

***

### goal

> **goal**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/logic.ts:126](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L126)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### template

> **template**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/paradigms/logic.ts:125](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L125)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/logic.ts:132](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L132)

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

Defined in: [src/paradigms/logic.ts:135](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/logic.ts#L135)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
