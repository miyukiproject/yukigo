[yukigo-core](../../index.md) / [index](../index.md) / ASTNode

# Abstract Class: ASTNode

Defined in: [src/globals/generics.ts:41](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L41)

Base class for all AST nodes

## Extended by

- [`NumberPrimitive`](NumberPrimitive.md)
- [`BooleanPrimitive`](BooleanPrimitive.md)
- [`ListPrimitive`](ListPrimitive.md)
- [`CharPrimitive`](CharPrimitive.md)
- [`StringPrimitive`](StringPrimitive.md)
- [`NilPrimitive`](NilPrimitive.md)
- [`SymbolPrimitive`](SymbolPrimitive.md)
- [`TupleExpression`](TupleExpression.md)
- [`FieldExpression`](FieldExpression.md)
- [`DataExpression`](DataExpression.md)
- [`ConsExpression`](ConsExpression.md)
- [`LetInExpression`](LetInExpression.md)
- [`Otherwise`](Otherwise.md)
- [`ListComprehension`](ListComprehension.md)
- [`Generator`](Generator.md)
- [`RangeExpression`](RangeExpression.md)
- [`If`](If.md)
- [`Return`](Return.md)
- [`Field`](Field.md)
- [`Constructor`](Constructor.md)
- [`Record`](Record.md)
- [`UnguardedBody`](UnguardedBody.md)
- [`GuardedBody`](GuardedBody.md)
- [`Equation`](Equation.md)
- [`Function`](Function.md)
- [`Case`](Case.md)
- [`Switch`](Switch.md)
- [`Catch`](Catch.md)
- [`Try`](Try.md)
- [`Raise`](Raise.md)
- [`Print`](Print.md)
- [`For`](For.md)
- [`Break`](Break.md)
- [`Continue`](Continue.md)
- [`Variable`](Variable.md)
- [`Assignment`](Assignment.md)
- [`Sequence`](Sequence.md)
- [`ArithmeticUnaryOperation`](ArithmeticUnaryOperation.md)
- [`ArithmeticBinaryOperation`](ArithmeticBinaryOperation.md)
- [`ListUnaryOperation`](ListUnaryOperation.md)
- [`ListBinaryOperation`](ListBinaryOperation.md)
- [`ComparisonOperation`](ComparisonOperation.md)
- [`LogicalBinaryOperation`](LogicalBinaryOperation.md)
- [`LogicalUnaryOperation`](LogicalUnaryOperation.md)
- [`BitwiseBinaryOperation`](BitwiseBinaryOperation.md)
- [`BitwiseUnaryOperation`](BitwiseUnaryOperation.md)
- [`StringOperation`](StringOperation.md)
- [`UnifyOperation`](UnifyOperation.md)
- [`AssignOperation`](AssignOperation.md)
- [`VariablePattern`](VariablePattern.md)
- [`LiteralPattern`](LiteralPattern.md)
- [`ApplicationPattern`](ApplicationPattern.md)
- [`TuplePattern`](TuplePattern.md)
- [`ListPattern`](ListPattern.md)
- [`FunctorPattern`](FunctorPattern.md)
- [`AsPattern`](AsPattern.md)
- [`WildcardPattern`](WildcardPattern.md)
- [`UnionPattern`](UnionPattern.md)
- [`ConstructorPattern`](ConstructorPattern.md)
- [`ConsPattern`](ConsPattern.md)
- [`SimpleType`](SimpleType.md)
- [`TypeVar`](TypeVar.md)
- [`TypeApplication`](TypeApplication.md)
- [`ListType`](ListType.md)
- [`TupleType`](TupleType.md)
- [`Constraint`](Constraint.md)
- [`ParameterizedType`](ParameterizedType.md)
- [`ConstrainedType`](ConstrainedType.md)
- [`TypeAlias`](TypeAlias.md)
- [`TypeSignature`](TypeSignature.md)
- [`TypeCast`](TypeCast.md)
- [`CompositionExpression`](CompositionExpression.md)
- [`Lambda`](Lambda.md)
- [`Yield`](Yield.md)
- [`Application`](Application.md)
- [`Method`](Method.md)
- [`Attribute`](Attribute.md)
- [`Object`](Object.md)
- [`Class`](Class.md)
- [`Interface`](Interface.md)
- [`Send`](Send.md)
- [`New`](New.md)
- [`Implement`](Implement.md)
- [`Include`](Include.md)
- [`Self`](Self.md)
- [`EntryPoint`](EntryPoint.md)
- [`Procedure`](Procedure.md)
- [`Enumeration`](Enumeration.md)
- [`While`](While.md)
- [`Repeat`](Repeat.md)
- [`ForLoop`](ForLoop.md)
- [`Rule`](Rule.md)
- [`Call`](Call.md)
- [`Fact`](Fact.md)
- [`Query`](Query.md)
- [`Exist`](Exist.md)
- [`Not`](Not.md)
- [`Findall`](Findall.md)
- [`Forall`](Forall.md)
- [`Goal`](Goal.md)

## Constructors

### Constructor

> **new ASTNode**(`loc?`): `ASTNode`

Defined in: [src/globals/generics.ts:43](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L43)

#### Parameters

##### loc?

[`SourceLocation`](SourceLocation.md)

#### Returns

`ASTNode`

## Properties

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [src/globals/generics.ts:42](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L42)

## Methods

### accept()

> `abstract` **accept**\<`R`\>(`visitor`): `R`

Defined in: [src/globals/generics.ts:46](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L46)

#### Type Parameters

##### R

`R`

#### Parameters

##### visitor

[`Visitor`](../../visitor/type-aliases/Visitor.md)\<`R`\>

#### Returns

`R`

***

### toJSON()

> `abstract` **toJSON**(): `object`

Defined in: [src/globals/generics.ts:47](https://github.com/noiseArch/yukigo-core/blob/dfedf47ead6d2e8b1a27873288c910c616b8b5f4/src/globals/generics.ts#L47)

#### Returns

`object`
