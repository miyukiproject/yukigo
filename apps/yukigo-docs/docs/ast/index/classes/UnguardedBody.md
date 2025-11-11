[yukigo-core](../../index.md) / [index](../index.md) / UnguardedBody

# Class: UnguardedBody

Defined in: [src/globals/generics.ts:618](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L618)

Represents the body of an Equation that does not have guards.
Most languages match the body of its equations to it.

## Examples

```ts
f x = x + 2
// The body is the `x + 2` part
```

```ts
function f(x) {
   return x + 2;
}
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new UnguardedBody**(`sequence`, `loc?`): `UnguardedBody`

Defined in: [src/globals/generics.ts:619](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L619)

#### Parameters

##### sequence

[`Sequence`](Sequence.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`UnguardedBody`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### sequence

> **sequence**: [`Sequence`](Sequence.md)

Defined in: [src/globals/generics.ts:619](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L619)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:622](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L622)

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

Defined in: [src/globals/generics.ts:625](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L625)

#### Returns

`object`

##### sequence

> **sequence**: `any`

##### type

> **type**: `string` = `"UnguardedBody"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
