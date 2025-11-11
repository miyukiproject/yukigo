[yukigo-core](../../index.md) / [index](../index.md) / LetInExpression

# Class: LetInExpression

Defined in: [src/globals/generics.ts:320](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L320)

Represent let...in expressions normally used in Haskell

## Example

```ts
f = let x = 2 in x * 4
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new LetInExpression**(`declarations`, `expression`, `loc?`): `LetInExpression`

Defined in: [src/globals/generics.ts:321](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L321)

#### Parameters

##### declarations

[`Sequence`](Sequence.md)

##### expression

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`LetInExpression`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### declarations

> **declarations**: [`Sequence`](Sequence.md)

Defined in: [src/globals/generics.ts:322](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L322)

***

### expression

> **expression**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:323](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L323)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:328](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L328)

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

Defined in: [src/globals/generics.ts:331](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L331)

#### Returns

`object`

##### declarations

> **declarations**: `any`

##### expression

> **expression**: `any`

##### type

> **type**: `string` = `"LetInExpression"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
