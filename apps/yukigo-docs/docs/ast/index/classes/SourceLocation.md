[yukigo-core](../../index.md) / [index](../index.md) / SourceLocation

# Class: SourceLocation

Defined in: [src/globals/generics.ts:211](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L211)

Source location information

## Constructors

### Constructor

> **new SourceLocation**(`line`, `column`): `SourceLocation`

Defined in: [src/globals/generics.ts:212](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L212)

#### Parameters

##### line

`number`

##### column

`number`

#### Returns

`SourceLocation`

## Properties

### column

> **column**: `number`

Defined in: [src/globals/generics.ts:212](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L212)

***

### line

> **line**: `number`

Defined in: [src/globals/generics.ts:212](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L212)

## Methods

### toJSON()

> **toJSON**(): `object`

Defined in: [src/globals/generics.ts:213](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L213)

#### Returns

`object`

##### column

> **column**: `number`

##### line

> **line**: `number`

##### type

> **type**: `string` = `"SourceLocation"`
