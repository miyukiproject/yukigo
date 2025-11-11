[yukigo-core](../../index.md) / [index](../index.md) / Constructor

# Class: Constructor

Defined in: [src/globals/generics.ts:559](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L559)

Generic constructor node.
Holds an array of Field nodes.

## Example

```ts
data Record = Constructor { field :: String }
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Constructor**(`name`, `fields`, `loc?`): `Constructor`

Defined in: [src/globals/generics.ts:560](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L560)

#### Parameters

##### name

[`SymbolPrimitive`](SymbolPrimitive.md)

##### fields

[`Field`](Field.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Constructor`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### fields

> **fields**: [`Field`](Field.md)[]

Defined in: [src/globals/generics.ts:562](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L562)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### name

> **name**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/globals/generics.ts:561](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L561)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:567](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L567)

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

Defined in: [src/globals/generics.ts:570](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L570)

#### Returns

`object`

##### fields

> **fields**: `object`[]

##### name

> **name**: `object`

###### name.type

> **type**: `string` = `"YuSymbol"`

###### name.value

> **value**: `string`

##### type

> **type**: `string` = `"Constructor"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
