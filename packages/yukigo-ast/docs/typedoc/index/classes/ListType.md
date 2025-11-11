[yukigo-core](../../index.md) / [index](../index.md) / ListType

# Class: ListType

Defined in: [src/globals/types.ts:75](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L75)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new ListType**(`values`, `constraints`, `loc?`): `ListType`

Defined in: [src/globals/types.ts:76](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L76)

#### Parameters

##### values

[`Type`](../type-aliases/Type.md)

##### constraints

[`Constraint`](Constraint.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`ListType`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### constraints

> **constraints**: [`Constraint`](Constraint.md)[]

Defined in: [src/globals/types.ts:78](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L78)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### values

> **values**: [`Type`](../type-aliases/Type.md)

Defined in: [src/globals/types.ts:77](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L77)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/types.ts:83](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L83)

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

Defined in: [src/globals/types.ts:86](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/types.ts#L86)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
