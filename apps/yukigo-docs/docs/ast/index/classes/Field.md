[yukigo-core](../../index.md) / [index](../index.md) / Field

# Class: Field

Defined in: [src/globals/generics.ts:533](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L533)

Generic field in a Record statement.
The name can be undefined to support positional-only Records

## Example

```ts
... { name :: String }
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Field**(`name`, `value`, `loc?`): `Field`

Defined in: [src/globals/generics.ts:534](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L534)

#### Parameters

##### name

[`SymbolPrimitive`](SymbolPrimitive.md)

##### value

[`Type`](../type-aliases/Type.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Field`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### name

> **name**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/globals/generics.ts:535](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L535)

***

### value

> **value**: [`Type`](../type-aliases/Type.md)

Defined in: [src/globals/generics.ts:536](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L536)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:541](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L541)

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

Defined in: [src/globals/generics.ts:544](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L544)

#### Returns

`object`

##### name

> **name**: `object`

###### name.type

> **type**: `string` = `"YuSymbol"`

###### name.value

> **value**: `string`

##### type

> **type**: `string` = `"Field"`

##### value

> **value**: `any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
