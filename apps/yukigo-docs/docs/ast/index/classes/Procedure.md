[yukigo-core](../../index.md) / [index](../index.md) / Procedure

# Class: Procedure

Defined in: [src/paradigms/imperative.ts:30](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L30)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Procedure**(`identifier`, `equations`, `loc?`): `Procedure`

Defined in: [src/paradigms/imperative.ts:31](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L31)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### equations

[`Equation`](Equation.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Procedure`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### equations

> **equations**: [`Equation`](Equation.md)[]

Defined in: [src/paradigms/imperative.ts:33](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L33)

***

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/paradigms/imperative.ts:32](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L32)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/paradigms/imperative.ts:38](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L38)

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

Defined in: [src/paradigms/imperative.ts:41](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/paradigms/imperative.ts#L41)

#### Returns

`object`

##### equations

> **equations**: `object`[]

##### identifier

> **identifier**: `object`

###### identifier.type

> **type**: `string` = `"YuSymbol"`

###### identifier.value

> **value**: `string`

##### type

> **type**: `string` = `"Procedure"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
