[yukigo-core](../../index.md) / [index](../index.md) / AsPattern

# Class: AsPattern

Defined in: [src/globals/patterns.ts:109](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L109)

Base class for all AST nodes

## Extends

- [`ASTNode`](ASTNode.md)

## Constructors

### Constructor

> **new AsPattern**(`alias`, `pattern`, `loc?`): `AsPattern`

Defined in: [src/globals/patterns.ts:110](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L110)

#### Parameters

##### alias

[`VariablePattern`](VariablePattern.md) | [`WildcardPattern`](WildcardPattern.md)

##### pattern

[`Pattern`](../type-aliases/Pattern.md)

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`AsPattern`

#### Overrides

[`ASTNode`](ASTNode.md).[`constructor`](ASTNode.md#constructor)

## Properties

### alias

> **alias**: [`VariablePattern`](VariablePattern.md) \| [`WildcardPattern`](WildcardPattern.md)

Defined in: [src/globals/patterns.ts:111](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L111)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### pattern

> **pattern**: [`Pattern`](../type-aliases/Pattern.md)

Defined in: [src/globals/patterns.ts:112](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L112)

## Methods

### accept()

> **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/patterns.ts:117](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L117)

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

Defined in: [src/globals/patterns.ts:120](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/patterns.ts#L120)

#### Returns

`any`

#### Overrides

[`ASTNode`](ASTNode.md).[`toJSON`](ASTNode.md#tojson)
