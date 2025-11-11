[yukigo-core](../../index.md) / [index](../index.md) / RangeExpression

# Class: RangeExpression

Defined in: [src/globals/generics.ts:418](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L418)

RangeExpression represents when a list is given by comprehension in a defined range

## Examples

```ts
(1..10)
```

```ts
(1, 2..10)
```

```ts
(1..)
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new RangeExpression**(`start`, `end?`, `step?`, `loc?`): `RangeExpression`

Defined in: [src/globals/generics.ts:419](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L419)

#### Parameters

##### start

[`Expression`](../type-aliases/Expression.md)

##### end?

[`Expression`](../type-aliases/Expression.md)

##### step?

[`Expression`](../type-aliases/Expression.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`RangeExpression`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### end?

> `optional` **end**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:421](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L421)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### start

> **start**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:420](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L420)

***

### step?

> `optional` **step**: [`Expression`](../type-aliases/Expression.md)

Defined in: [src/globals/generics.ts:422](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L422)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:427](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L427)

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

Defined in: [src/globals/generics.ts:430](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L430)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
