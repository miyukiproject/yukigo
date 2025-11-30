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
| `node` | [`Application`](../Expressions/index.Application.md) |

#### Returns

`TReturn`

***

### visitApplicationPattern()

> **visitApplicationPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ApplicationPattern`](../Patterns/index.ApplicationPattern.md) |

#### Returns

`TReturn`

***

### visitArithmeticBinaryOperation()

> **visitArithmeticBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticBinaryOperation`](../Operators/index.ArithmeticBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitArithmeticUnaryOperation()

> **visitArithmeticUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticUnaryOperation`](../Operators/index.ArithmeticUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitAsPattern()

> **visitAsPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AsPattern`](../Patterns/index.AsPattern.md) |

#### Returns

`TReturn`

***

### visitAssignment()

> **visitAssignment**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Assignment`](../Statements/index.Assignment.md) |

#### Returns

`TReturn`

***

### visitAssignOperation()

> **visitAssignOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AssignOperation`](../Operators/index.AssignOperation.md) |

#### Returns

`TReturn`

***

### visitAttribute()

> **visitAttribute**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Attribute`](../OOP/index.Attribute.md) |

#### Returns

`TReturn`

***

### visitBitwiseBinaryOperation()

> **visitBitwiseBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseBinaryOperation`](../Operators/index.BitwiseBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitBitwiseUnaryOperation()

> **visitBitwiseUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseUnaryOperation`](../Operators/index.BitwiseUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitBooleanPrimitive()

> **visitBooleanPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BooleanPrimitive`](../Literals/index.BooleanPrimitive.md) |

#### Returns

`TReturn`

***

### visitBreak()

> **visitBreak**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Break`](../Statements/index.Break.md) |

#### Returns

`TReturn`

***

### visitCall()

> **visitCall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Call`](../Logic/index.Call.md) |

#### Returns

`TReturn`

***

### visitCase()

> **visitCase**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Case`](../Expressions/index.Case.md) |

#### Returns

`TReturn`

***

### visitCatch()

> **visitCatch**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Catch`](../Statements/index.Catch.md) |

#### Returns

`TReturn`

***

### visitCharPrimitive()

> **visitCharPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CharPrimitive`](../Literals/index.CharPrimitive.md) |

#### Returns

`TReturn`

***

### visitClass()

> **visitClass**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Class`](../OOP/index.Class.md) |

#### Returns

`TReturn`

***

### visitComparisonOperation()

> **visitComparisonOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ComparisonOperation`](../Operators/index.ComparisonOperation.md) |

#### Returns

`TReturn`

***

### visitCompositionExpression()

> **visitCompositionExpression**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CompositionExpression`](../Expressions/index.CompositionExpression.md) |

#### Returns

`TReturn`

***

### visitConsExpr()

> **visitConsExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsExpression`](../Expressions/index.ConsExpression.md) |

#### Returns

`TReturn`

***

### visitConsPattern()

> **visitConsPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsPattern`](../Patterns/index.ConsPattern.md) |

#### Returns

`TReturn`

***

### visitConstrainedType()

> **visitConstrainedType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstrainedType`](../Types/index.ConstrainedType.md) |

#### Returns

`TReturn`

***

### visitConstraint()

> **visitConstraint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constraint`](../Types/index.Constraint.md) |

#### Returns

`TReturn`

***

### visitConstructor()

> **visitConstructor**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constructor`](../Declarations/index.Constructor.md) |

#### Returns

`TReturn`

***

### visitConstructorPattern()

> **visitConstructorPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstructorPattern`](../Patterns/index.ConstructorPattern.md) |

#### Returns

`TReturn`

***

### visitContinue()

> **visitContinue**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Continue`](../Statements/index.Continue.md) |

#### Returns

`TReturn`

***

### visitDataExpr()

> **visitDataExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`DataExpression`](../Expressions/index.DataExpression.md) |

#### Returns

`TReturn`

***

### visitEntryPoint()

> **visitEntryPoint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`EntryPoint`](../Declarations/index.EntryPoint.md) |

#### Returns

`TReturn`

***

### visitEnumeration()

> **visitEnumeration**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Enumeration`](../Declarations/index.Enumeration.md) |

#### Returns

`TReturn`

***

### visitEquation()

> **visitEquation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Equation`](../Declarations/index.Equation.md) |

#### Returns

`TReturn`

***

### visitExist()

> **visitExist**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Exist`](../Logic/index.Exist.md) |

#### Returns

`TReturn`

***

### visitFact()

> **visitFact**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Fact`](../Logic/index.Fact.md) |

#### Returns

`TReturn`

***

### visitField()

> **visitField**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Field`](../Declarations/index.Field.md) |

#### Returns

`TReturn`

***

### visitFieldExpr()

> **visitFieldExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FieldExpression`](../Expressions/index.FieldExpression.md) |

#### Returns

`TReturn`

***

### visitFindall()

> **visitFindall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Findall`](../Logic/index.Findall.md) |

#### Returns

`TReturn`

***

### visitFor()

> **visitFor**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`For`](../Statements/index.For.md) |

#### Returns

`TReturn`

***

### visitForall()

> **visitForall**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Forall`](../Logic/index.Forall.md) |

#### Returns

`TReturn`

***

### visitForLoop()

> **visitForLoop**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ForLoop`](../Statements/index.ForLoop.md) |

#### Returns

`TReturn`

***

### visitFunction()

> **visitFunction**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Function`](../Declarations/index.Function.md) |

#### Returns

`TReturn`

***

### visitFunctorPattern()

> **visitFunctorPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FunctorPattern`](../Patterns/index.FunctorPattern.md) |

#### Returns

`TReturn`

***

### visitGenerator()

> **visitGenerator**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Generator`](../Declarations/index.Generator.md) |

#### Returns

`TReturn`

***

### visitGoal()

> **visitGoal**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Goal`](../Logic/index.Goal.md) |

#### Returns

`TReturn`

***

### visitGuardedBody()

> **visitGuardedBody**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`GuardedBody`](../Declarations/index.GuardedBody.md) |

#### Returns

`TReturn`

***

### visitIf()

> **visitIf**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`If`](../Expressions/index.If.md) |

#### Returns

`TReturn`

***

### visitImplement()

> **visitImplement**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Implement`](../OOP/index.Implement.md) |

#### Returns

`TReturn`

***

### visitInclude()

> **visitInclude**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Include`](../OOP/index.Include.md) |

#### Returns

`TReturn`

***

### visitInput()

> **visitInput**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Input`](../Statements/index.Input.md) |

#### Returns

`TReturn`

***

### visitInterface()

> **visitInterface**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Interface`](../OOP/index.Interface.md) |

#### Returns

`TReturn`

***

### visitLambda()

> **visitLambda**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Lambda`](../Expressions/index.Lambda.md) |

#### Returns

`TReturn`

***

### visitLetInExpr()

> **visitLetInExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LetInExpression`](../Expressions/index.LetInExpression.md) |

#### Returns

`TReturn`

***

### visitListBinaryOperation()

> **visitListBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListBinaryOperation`](../Operators/index.ListBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitListComprehension()

> **visitListComprehension**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListComprehension`](../Expressions/index.ListComprehension.md) |

#### Returns

`TReturn`

***

### visitListPattern()

> **visitListPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPattern`](../Patterns/index.ListPattern.md) |

#### Returns

`TReturn`

***

### visitListPrimitive()

> **visitListPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPrimitive`](../Literals/index.ListPrimitive.md) |

#### Returns

`TReturn`

***

### visitListType()

> **visitListType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListType`](../Types/index.ListType.md) |

#### Returns

`TReturn`

***

### visitListUnaryOperation()

> **visitListUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListUnaryOperation`](../Operators/index.ListUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitLiteralPattern()

> **visitLiteralPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LiteralPattern`](../Patterns/index.LiteralPattern.md) |

#### Returns

`TReturn`

***

### visitLogicalBinaryOperation()

> **visitLogicalBinaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalBinaryOperation`](../Operators/index.LogicalBinaryOperation.md) |

#### Returns

`TReturn`

***

### visitLogicalUnaryOperation()

> **visitLogicalUnaryOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalUnaryOperation`](../Operators/index.LogicalUnaryOperation.md) |

#### Returns

`TReturn`

***

### visitMethod()

> **visitMethod**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Method`](../OOP/index.Method.md) |

#### Returns

`TReturn`

***

### visitNew()

> **visitNew**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`New`](../OOP/index.New.md) |

#### Returns

`TReturn`

***

### visitNilPrimitive()

> **visitNilPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NilPrimitive`](../Literals/index.NilPrimitive.md) |

#### Returns

`TReturn`

***

### visitNot()

> **visitNot**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Not`](../Logic/index.Not.md) |

#### Returns

`TReturn`

***

### visitNumberPrimitive()

> **visitNumberPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NumberPrimitive`](../Literals/index.NumberPrimitive.md) |

#### Returns

`TReturn`

***

### visitObject()

> **visitObject**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Object`](../OOP/index.Object.md) |

#### Returns

`TReturn`

***

### visitOtherwise()

> **visitOtherwise**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Otherwise`](../Declarations/index.Otherwise.md) |

#### Returns

`TReturn`

***

### visitParameterizedType()

> **visitParameterizedType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ParameterizedType`](../Types/index.ParameterizedType.md) |

#### Returns

`TReturn`

***

### visitPrint()

> **visitPrint**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Print`](../Statements/index.Print.md) |

#### Returns

`TReturn`

***

### visitProcedure()

> **visitProcedure**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Procedure`](../Declarations/index.Procedure.md) |

#### Returns

`TReturn`

***

### visitQuery()

> **visitQuery**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Query`](../Logic/index.Query.md) |

#### Returns

`TReturn`

***

### visitRaise()

> **visitRaise**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Raise`](../Statements/index.Raise.md) |

#### Returns

`TReturn`

***

### visitRangeExpression()

> **visitRangeExpression**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`RangeExpression`](../Expressions/index.RangeExpression.md) |

#### Returns

`TReturn`

***

### visitRecord()

> **visitRecord**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Record`](../Declarations/index.Record.md) |

#### Returns

`TReturn`

***

### visitRepeat()

> **visitRepeat**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Repeat`](../Statements/index.Repeat.md) |

#### Returns

`TReturn`

***

### visitReturn()

> **visitReturn**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Return`](../Statements/index.Return.md) |

#### Returns

`TReturn`

***

### visitRule()

> **visitRule**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Rule`](../Logic/index.Rule.md) |

#### Returns

`TReturn`

***

### visitSelf()

> **visitSelf**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Self`](../OOP/index.Self.md) |

#### Returns

`TReturn`

***

### visitSend()

> **visitSend**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Send`](../OOP/index.Send.md) |

#### Returns

`TReturn`

***

### visitSequence()

> **visitSequence**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Sequence`](../Statements/index.Sequence.md) |

#### Returns

`TReturn`

***

### visitSimpleType()

> **visitSimpleType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SimpleType`](../Types/index.SimpleType.md) |

#### Returns

`TReturn`

***

### visitStringOperation()

> **visitStringOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringOperation`](../Operators/index.StringOperation.md) |

#### Returns

`TReturn`

***

### visitStringPrimitive()

> **visitStringPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringPrimitive`](../Literals/index.StringPrimitive.md) |

#### Returns

`TReturn`

***

### visitStructure()

> **visitStructure**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Structure`](../Declarations/index.Structure.md) |

#### Returns

`TReturn`

***

### visitSuper()

> **visitSuper**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Super`](../OOP/index.Super.md) |

#### Returns

`TReturn`

***

### visitSwitch()

> **visitSwitch**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Switch`](../Expressions/index.Switch.md) |

#### Returns

`TReturn`

***

### visitSymbolPrimitive()

> **visitSymbolPrimitive**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |

#### Returns

`TReturn`

***

### visitTry()

> **visitTry**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Try`](../Statements/index.Try.md) |

#### Returns

`TReturn`

***

### visitTupleExpr()

> **visitTupleExpr**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleExpression`](../Expressions/index.TupleExpression.md) |

#### Returns

`TReturn`

***

### visitTuplePattern()

> **visitTuplePattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TuplePattern`](../Patterns/index.TuplePattern.md) |

#### Returns

`TReturn`

***

### visitTupleType()

> **visitTupleType**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleType`](../Types/index.TupleType.md) |

#### Returns

`TReturn`

***

### visitTypeAlias()

> **visitTypeAlias**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeAlias`](../Types/index.TypeAlias.md) |

#### Returns

`TReturn`

***

### visitTypeApplication()

> **visitTypeApplication**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeApplication`](../Types/index.TypeApplication.md) |

#### Returns

`TReturn`

***

### visitTypeCast()

> **visitTypeCast**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeCast`](../Types/index.TypeCast.md) |

#### Returns

`TReturn`

***

### visitTypeSignature()

> **visitTypeSignature**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeSignature`](../Types/index.TypeSignature.md) |

#### Returns

`TReturn`

***

### visitTypeVar()

> **visitTypeVar**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeVar`](../Types/index.TypeVar.md) |

#### Returns

`TReturn`

***

### visitUnguardedBody()

> **visitUnguardedBody**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnguardedBody`](../Declarations/index.UnguardedBody.md) |

#### Returns

`TReturn`

***

### visitUnifyOperation()

> **visitUnifyOperation**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnifyOperation`](../Logic/index.UnifyOperation.md) |

#### Returns

`TReturn`

***

### visitUnionPattern()

> **visitUnionPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnionPattern`](../Patterns/index.UnionPattern.md) |

#### Returns

`TReturn`

***

### visitVariable()

> **visitVariable**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Variable`](../Expressions/index.Variable.md) |

#### Returns

`TReturn`

***

### visitVariablePattern()

> **visitVariablePattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`VariablePattern`](../Patterns/index.VariablePattern.md) |

#### Returns

`TReturn`

***

### visitWhile()

> **visitWhile**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`While`](../Statements/index.While.md) |

#### Returns

`TReturn`

***

### visitWildcardPattern()

> **visitWildcardPattern**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`WildcardPattern`](../Patterns/index.WildcardPattern.md) |

#### Returns

`TReturn`

***

### visitYield()

> **visitYield**(`node`): `TReturn`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Yield`](../Statements/index.Yield.md) |

#### Returns

`TReturn`
