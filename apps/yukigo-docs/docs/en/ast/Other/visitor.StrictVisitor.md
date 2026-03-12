# Interface: StrictVisitor\<TReturn\>

## Type Parameters

| Type Parameter |
| ------ |
| `TReturn` |

## Methods

### visit()

> **visit**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `ASTNode` |

#### Returns

`TReturn`

***

### visitApplication()

> **visitApplication**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Application`](../Expressions/Application.md) |

#### Returns

`TReturn`

***

### visitApplicationPattern()

> **visitApplicationPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ApplicationPattern`](../Patterns/ApplicationPattern.md) |

#### Returns

`TReturn`

***

### visitArithmeticBinaryOperation()

> **visitArithmeticBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticBinaryOperation`](../Operators/ArithmeticBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitArithmeticUnaryOperation()

> **visitArithmeticUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticUnaryOperation`](../Operators/ArithmeticUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitAsPattern()

> **visitAsPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AsPattern`](../Patterns/AsPattern.md) |

#### Returns

`TReturn`

***

### visitAssignment()

> **visitAssignment**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Assignment`](../Statements/Assignment.md) |

#### Returns

`TReturn`

***

### visitAssignOperation()

> **visitAssignOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AssignOperation`](../Operators/AssignOperation.md) |

#### Returns

`TReturn`

***

### visitAttribute()

> **visitAttribute**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Attribute`](../OOP/Attribute.md) |

#### Returns

`TReturn`

***

### visitBitwiseBinaryOperation()

> **visitBitwiseBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseBinaryOperation`](../Operators/BitwiseBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitBitwiseUnaryOperation()

> **visitBitwiseUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseUnaryOperation`](../Operators/BitwiseUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitBooleanPrimitive()

> **visitBooleanPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BooleanPrimitive`](../Literals/BooleanPrimitive.md) |

#### Returns

`TReturn`

***

### visitBreak()

> **visitBreak**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Break`](../Statements/Break.md) |

#### Returns

`TReturn`

***

### visitCall()

> **visitCall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Call`](../Logic/Call.md) |

#### Returns

`TReturn`

***

### visitCase()

> **visitCase**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Case`](../Expressions/Case.md) |

#### Returns

`TReturn`

***

### visitCatch()

> **visitCatch**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Catch`](../Statements/Catch.md) |

#### Returns

`TReturn`

***

### visitCharPrimitive()

> **visitCharPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CharPrimitive`](../Literals/CharPrimitive.md) |

#### Returns

`TReturn`

***

### visitClass()

> **visitClass**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Class`](../OOP/Class.md) |

#### Returns

`TReturn`

***

### visitComparisonOperation()

> **visitComparisonOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ComparisonOperation`](../Operators/ComparisonOperation.md) |

#### Returns

`TReturn`

***

### visitCompositionExpression()

> **visitCompositionExpression**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CompositionExpression`](../Expressions/CompositionExpression.md) |

#### Returns

`TReturn`

***

### visitConsExpr()

> **visitConsExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsExpression`](../Expressions/ConsExpression.md) |

#### Returns

`TReturn`

***

### visitConsPattern()

> **visitConsPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsPattern`](../Patterns/ConsPattern.md) |

#### Returns

`TReturn`

***

### visitConstrainedType()

> **visitConstrainedType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstrainedType`](../Types/ConstrainedType.md) |

#### Returns

`TReturn`

***

### visitConstraint()

> **visitConstraint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constraint`](../Types/Constraint.md) |

#### Returns

`TReturn`

***

### visitConstructor()

> **visitConstructor**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constructor`](../Declarations/Constructor.md) |

#### Returns

`TReturn`

***

### visitConstructorPattern()

> **visitConstructorPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstructorPattern`](../Patterns/ConstructorPattern.md) |

#### Returns

`TReturn`

***

### visitContinue()

> **visitContinue**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Continue`](../Statements/Continue.md) |

#### Returns

`TReturn`

***

### visitDataExpr()

> **visitDataExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`DataExpression`](../Expressions/DataExpression.md) |

#### Returns

`TReturn`

***

### visitEntryPoint()

> **visitEntryPoint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`EntryPoint`](../Declarations/EntryPoint.md) |

#### Returns

`TReturn`

***

### visitEnumeration()

> **visitEnumeration**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Enumeration`](../Declarations/Enumeration.md) |

#### Returns

`TReturn`

***

### visitEquation()

> **visitEquation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Equation`](../Declarations/Equation.md) |

#### Returns

`TReturn`

***

### visitExist()

> **visitExist**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Exist`](../Logic/Exist.md) |

#### Returns

`TReturn`

***

### visitFact()

> **visitFact**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Fact`](../Logic/Fact.md) |

#### Returns

`TReturn`

***

### visitField()

> **visitField**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Field`](../Declarations/Field.md) |

#### Returns

`TReturn`

***

### visitFieldExpr()

> **visitFieldExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FieldExpression`](../Expressions/FieldExpression.md) |

#### Returns

`TReturn`

***

### visitFindall()

> **visitFindall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Findall`](../Logic/Findall.md) |

#### Returns

`TReturn`

***

### visitFor()

> **visitFor**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`For`](../Statements/For.md) |

#### Returns

`TReturn`

***

### visitForall()

> **visitForall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Forall`](../Logic/Forall.md) |

#### Returns

`TReturn`

***

### visitForLoop()

> **visitForLoop**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ForLoop`](../Statements/ForLoop.md) |

#### Returns

`TReturn`

***

### visitFunction()

> **visitFunction**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Function`](../Declarations/Function.md) |

#### Returns

`TReturn`

***

### visitFunctorPattern()

> **visitFunctorPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FunctorPattern`](../Patterns/FunctorPattern.md) |

#### Returns

`TReturn`

***

### visitGenerator()

> **visitGenerator**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Generator`](../Declarations/Generator.md) |

#### Returns

`TReturn`

***

### visitGoal()

> **visitGoal**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Goal`](../Logic/Goal.md) |

#### Returns

`TReturn`

***

### visitGuardedBody()

> **visitGuardedBody**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`GuardedBody`](../Declarations/GuardedBody.md) |

#### Returns

`TReturn`

***

### visitIf()

> **visitIf**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`If`](../Expressions/If.md) |

#### Returns

`TReturn`

***

### visitImplement()

> **visitImplement**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Implement`](../OOP/Implement.md) |

#### Returns

`TReturn`

***

### visitInclude()

> **visitInclude**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Include`](../OOP/Include.md) |

#### Returns

`TReturn`

***

### visitInput()

> **visitInput**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Input`](../Statements/Input.md) |

#### Returns

`TReturn`

***

### visitInterface()

> **visitInterface**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Interface`](../OOP/Interface.md) |

#### Returns

`TReturn`

***

### visitLambda()

> **visitLambda**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Lambda`](../Expressions/Lambda.md) |

#### Returns

`TReturn`

***

### visitLetInExpr()

> **visitLetInExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LetInExpression`](../Expressions/LetInExpression.md) |

#### Returns

`TReturn`

***

### visitListBinaryOperation()

> **visitListBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListBinaryOperation`](../Operators/ListBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitListComprehension()

> **visitListComprehension**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListComprehension`](../Expressions/ListComprehension.md) |

#### Returns

`TReturn`

***

### visitListPattern()

> **visitListPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPattern`](../Patterns/ListPattern.md) |

#### Returns

`TReturn`

***

### visitListPrimitive()

> **visitListPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPrimitive`](../Literals/ListPrimitive.md) |

#### Returns

`TReturn`

***

### visitListType()

> **visitListType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListType`](../Types/ListType.md) |

#### Returns

`TReturn`

***

### visitListUnaryOperation()

> **visitListUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListUnaryOperation`](../Operators/ListUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitLiteralPattern()

> **visitLiteralPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LiteralPattern`](../Patterns/LiteralPattern.md) |

#### Returns

`TReturn`

***

### visitLogicalBinaryOperation()

> **visitLogicalBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalBinaryOperation`](../Operators/LogicalBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitLogicalUnaryOperation()

> **visitLogicalUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalUnaryOperation`](../Operators/LogicalUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitMethod()

> **visitMethod**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Method`](../OOP/Method.md) |

#### Returns

`TReturn`

***

### visitNew()

> **visitNew**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`New`](../OOP/New.md) |

#### Returns

`TReturn`

***

### visitNilPrimitive()

> **visitNilPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NilPrimitive`](../Literals/NilPrimitive.md) |

#### Returns

`TReturn`

***

### visitNot()

> **visitNot**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Not`](../Logic/Not.md) |

#### Returns

`TReturn`

***

### visitNumberPrimitive()

> **visitNumberPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NumberPrimitive`](../Literals/NumberPrimitive.md) |

#### Returns

`TReturn`

***

### visitObject()

> **visitObject**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Object`](../OOP/Object.md) |

#### Returns

`TReturn`

***

### visitOtherwise()

> **visitOtherwise**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Otherwise`](../Declarations/Otherwise.md) |

#### Returns

`TReturn`

***

### visitParameterizedType()

> **visitParameterizedType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ParameterizedType`](../Types/ParameterizedType.md) |

#### Returns

`TReturn`

***

### visitPrint()

> **visitPrint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Print`](../Statements/Print.md) |

#### Returns

`TReturn`

***

### visitProcedure()

> **visitProcedure**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Procedure`](../Declarations/Procedure.md) |

#### Returns

`TReturn`

***

### visitQuery()

> **visitQuery**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Query`](../Logic/Query.md) |

#### Returns

`TReturn`

***

### visitRaise()

> **visitRaise**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Raise`](../Statements/Raise.md) |

#### Returns

`TReturn`

***

### visitRangeExpression()

> **visitRangeExpression**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`RangeExpression`](../Expressions/RangeExpression.md) |

#### Returns

`TReturn`

***

### visitRecord()

> **visitRecord**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Record`](../Declarations/Record.md) |

#### Returns

`TReturn`

***

### visitRepeat()

> **visitRepeat**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Repeat`](../Statements/Repeat.md) |

#### Returns

`TReturn`

***

### visitReturn()

> **visitReturn**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Return`](../Statements/Return.md) |

#### Returns

`TReturn`

***

### visitRule()

> **visitRule**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Rule`](../Logic/Rule.md) |

#### Returns

`TReturn`

***

### visitSelf()

> **visitSelf**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Self`](../OOP/Self.md) |

#### Returns

`TReturn`

***

### visitSend()

> **visitSend**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Send`](../OOP/Send.md) |

#### Returns

`TReturn`

***

### visitSequence()

> **visitSequence**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Sequence`](../Statements/Sequence.md) |

#### Returns

`TReturn`

***

### visitSimpleType()

> **visitSimpleType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SimpleType`](../Types/SimpleType.md) |

#### Returns

`TReturn`

***

### visitStringOperation()

> **visitStringOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringOperation`](../Operators/StringOperation.md) |

#### Returns

`TReturn`

***

### visitStringPrimitive()

> **visitStringPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringPrimitive`](../Literals/StringPrimitive.md) |

#### Returns

`TReturn`

***

### visitStructure()

> **visitStructure**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Structure`](../Declarations/Structure.md) |

#### Returns

`TReturn`

***

### visitSuper()

> **visitSuper**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Super`](../OOP/Super.md) |

#### Returns

`TReturn`

***

### visitSwitch()

> **visitSwitch**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Switch`](../Expressions/Switch.md) |

#### Returns

`TReturn`

***

### visitSymbolPrimitive()

> **visitSymbolPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |

#### Returns

`TReturn`

***

### visitTry()

> **visitTry**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Try`](../Statements/Try.md) |

#### Returns

`TReturn`

***

### visitTupleExpr()

> **visitTupleExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleExpression`](../Expressions/TupleExpression.md) |

#### Returns

`TReturn`

***

### visitTuplePattern()

> **visitTuplePattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TuplePattern`](../Patterns/TuplePattern.md) |

#### Returns

`TReturn`

***

### visitTupleType()

> **visitTupleType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleType`](../Types/TupleType.md) |

#### Returns

`TReturn`

***

### visitTypeAlias()

> **visitTypeAlias**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeAlias`](../Types/TypeAlias.md) |

#### Returns

`TReturn`

***

### visitTypeApplication()

> **visitTypeApplication**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeApplication`](../Types/TypeApplication.md) |

#### Returns

`TReturn`

***

### visitTypeCast()

> **visitTypeCast**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeCast`](../Types/TypeCast.md) |

#### Returns

`TReturn`

***

### visitTypeSignature()

> **visitTypeSignature**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeSignature`](../Types/TypeSignature.md) |

#### Returns

`TReturn`

***

### visitTypeVar()

> **visitTypeVar**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeVar`](../Types/TypeVar.md) |

#### Returns

`TReturn`

***

### visitUnguardedBody()

> **visitUnguardedBody**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnguardedBody`](../Declarations/UnguardedBody.md) |

#### Returns

`TReturn`

***

### visitUnifyOperation()

> **visitUnifyOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnifyOperation`](../Logic/UnifyOperation.md) |

#### Returns

`TReturn`

***

### visitUnionPattern()

> **visitUnionPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnionPattern`](../Patterns/UnionPattern.md) |

#### Returns

`TReturn`

***

### visitVariable()

> **visitVariable**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Variable`](../Expressions/Variable.md) |

#### Returns

`TReturn`

***

### visitVariablePattern()

> **visitVariablePattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`VariablePattern`](../Patterns/VariablePattern.md) |

#### Returns

`TReturn`

***

### visitWhile()

> **visitWhile**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`While`](../Statements/While.md) |

#### Returns

`TReturn`

***

### visitWildcardPattern()

> **visitWildcardPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`WildcardPattern`](../Patterns/WildcardPattern.md) |

#### Returns

`TReturn`

***

### visitYield()

> **visitYield**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Yield`](../Statements/Yield.md) |

#### Returns

`TReturn`
