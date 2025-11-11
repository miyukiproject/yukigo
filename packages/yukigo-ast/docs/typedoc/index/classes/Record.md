[yukigo-core](../../index.md) / [index](../index.md) / Record

# Class: Record

Defined in: [src/globals/generics.ts:585](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L585)

Generic Record statement node.

## Example

```ts
data Record = Constructor { field :: String }
data PositionalRecord = Constructor String String
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Record**(`name`, `contents`, `deriving?`, `loc?`): `Record`

Defined in: [src/globals/generics.ts:586](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L586)

#### Parameters

##### name

[`SymbolPrimitive`](SymbolPrimitive.md)

##### contents

[`Constructor`](Constructor.md)[]

##### deriving?

[`SymbolPrimitive`](SymbolPrimitive.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Record`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### contents

> **contents**: [`Constructor`](Constructor.md)[]

Defined in: [src/globals/generics.ts:588](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L588)

***

### deriving?

> `optional` **deriving**: [`SymbolPrimitive`](SymbolPrimitive.md)[]

Defined in: [src/globals/generics.ts:589](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L589)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### name

> **name**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/globals/generics.ts:587](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L587)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:594](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L594)

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

Defined in: [src/globals/generics.ts:597](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L597)

#### Returns

`object`

##### contents

> **contents**: `object`[]

##### deriving

> **deriving**: `object`[]

##### name

> **name**: `object`

###### name.type

> **type**: `string` = `"YuSymbol"`

###### name.value

> **value**: `string`

##### type

> **type**: `string` = `"Record"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
