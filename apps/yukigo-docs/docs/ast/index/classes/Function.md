[yukigo-core](../../index.md) / [index](../index.md) / Function

# Class: Function

Defined in: [src/globals/generics.ts:701](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L701)

Functional / Imperative programming function declaration.
It is is composed by an identifier and one or more equations

## Examples

```ts
int foo (int bar) {
   return bar;
}
```

```ts
def foo(bar):
   return bar
```

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new Function**(`identifier`, `equations`, `loc?`): `Function`

Defined in: [src/globals/generics.ts:702](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L702)

#### Parameters

##### identifier

[`SymbolPrimitive`](SymbolPrimitive.md)

##### equations

[`Equation`](Equation.md)[]

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`Function`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### equations

> **equations**: [`Equation`](Equation.md)[]

Defined in: [src/globals/generics.ts:704](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L704)

***

### identifier

> **identifier**: [`SymbolPrimitive`](SymbolPrimitive.md)

Defined in: [src/globals/generics.ts:703](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L703)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:709](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L709)

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

Defined in: [src/globals/generics.ts:712](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L712)

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

> **type**: `string` = `"Function"`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
