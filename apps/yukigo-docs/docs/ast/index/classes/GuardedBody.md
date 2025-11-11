[yukigo-core](../../index.md) / [index](../index.md) / GuardedBody

# Class: GuardedBody

Defined in: [src/globals/generics.ts:641](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L641)

Represents the body of an Equation that does have guards.
For example, Haskell's guards

## Example

```ts
f x
   | x > 2 = x * 2
   | otherwise = x / 2
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new GuardedBody**(`condition`, `body`, `loc?`): `GuardedBody`

Defined in: [src/globals/generics.ts:642](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L642)

#### Parameters

##### condition

[`Expression`](../type-aliases/Expression.md)

##### body

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`GuardedBody`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### body

> **body**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:644](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L644)

***

### condition

> **condition**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:643](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L643)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:649](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L649)

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

Defined in: [src/globals/generics.ts:652](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L652)

#### Returns

`object`

##### body

> **body**: `any`

##### condition

> **condition**: `any`

##### type

> **type**: `string` = `"GuardedBody"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
