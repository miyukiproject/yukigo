[yukigo-core](../../index.md) / [index](../index.md) / Equation

# Class: Equation

Defined in: [src/globals/generics.ts:665](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L665)

Represents one Equation with its arguments and body. Allows for overloading and pattern matching.
You may define the return statement to access it more easily.

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Equation**(`patterns`, `body`, `returnExpr?`, `loc?`): `Equation`

Defined in: [src/globals/generics.ts:666](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L666)

#### Parameters

##### patterns

[`Pattern`](../type-aliases/Pattern.md)[]

##### body

[`UnguardedBody`](UnguardedBody.md) | [`GuardedBody`](GuardedBody.md)[]

##### returnExpr?

[`Return`](Return.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Equation`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### body

> **body**: [`UnguardedBody`](UnguardedBody.md) \| [`GuardedBody`](GuardedBody.md)[]

Defined in: [src/globals/generics.ts:668](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L668)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### patterns

> **patterns**: [`Pattern`](../type-aliases/Pattern.md)[]

Defined in: [src/globals/generics.ts:667](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L667)

***

### returnExpr?

> `optional` **returnExpr**: [`Return`](Return.md)

Defined in: [src/globals/generics.ts:669](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L669)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:674](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L674)

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

Defined in: [src/globals/generics.ts:677](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L677)

#### Returns

`object`

##### body

> **body**: `object`[] \| \{ `sequence`: `any`; `type`: `string`; \}

##### patterns

> **patterns**: (() => `object` \| () => `object` \| () => `any` \| () => `any` \| () => `any` \| () => `any` \| () => `any` \| () => `object` \| () => `any` \| () => `any`)[]

##### return

> **return**: `object`

###### return.body

> **body**: `any`

###### return.type

> **type**: `string` = `"Return"`

##### type

> **type**: `string` = `"Equation"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
