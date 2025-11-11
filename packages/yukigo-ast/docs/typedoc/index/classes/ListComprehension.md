[yukigo-core](../../index.md) / [index](../index.md) / ListComprehension

# Class: ListComprehension

Defined in: [src/globals/generics.ts:364](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L364)

ListComprehension when the for expression is a yield.
Scala's for comprehensions, Erlang's and Haskell's list comprehensions

## Example

```ts
m = [ f x | x <- [1, 2, 3, 4] ]
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new ListComprehension**(`projection`, `generators`, `loc?`): `ListComprehension`

Defined in: [src/globals/generics.ts:365](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L365)

#### Parameters

##### projection

[`Expression`](../type-aliases/Expression.md)

##### generators

([`Generator`](Generator.md) \| [`Expression`](../type-aliases/Expression.md))[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`ListComprehension`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### generators

> **generators**: ([`Generator`](Generator.md) \| [`Expression`](../type-aliases/Expression.md))[]

Defined in: [src/globals/generics.ts:367](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L367)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### projection

> **projection**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:366](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L366)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:372](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L372)

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

Defined in: [src/globals/generics.ts:375](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L375)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
