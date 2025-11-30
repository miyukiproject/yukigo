# Class: TraverseVisitor

## Implements

- [`StrictVisitor`](visitor.StrictVisitor.md)\<`void`\>

## Constructors

### Constructor

> **new TraverseVisitor**(): `TraverseVisitor`

#### Returns

`TraverseVisitor`

## Methods

### traverseCollection()

> `protected` **traverseCollection**(`nodes`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `nodes` | `ASTNode`[] |

#### Returns

`void`

***

### visit()

> **visit**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `ASTNode` |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visit`](visitor.StrictVisitor.md#visit)

***

### visitApplication()

> **visitApplication**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Application`](../Expressions/index.Application.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitApplication`](visitor.StrictVisitor.md#visitapplication)

***

### visitApplicationPattern()

> **visitApplicationPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ApplicationPattern`](../Patterns/index.ApplicationPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitApplicationPattern`](visitor.StrictVisitor.md#visitapplicationpattern)

***

### visitArithmeticBinaryOperation()

> **visitArithmeticBinaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticBinaryOperation`](../Operators/index.ArithmeticBinaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitArithmeticBinaryOperation`](visitor.StrictVisitor.md#visitarithmeticbinaryoperation)

***

### visitArithmeticUnaryOperation()

> **visitArithmeticUnaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ArithmeticUnaryOperation`](../Operators/index.ArithmeticUnaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitArithmeticUnaryOperation`](visitor.StrictVisitor.md#visitarithmeticunaryoperation)

***

### visitAsPattern()

> **visitAsPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AsPattern`](../Patterns/index.AsPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitAsPattern`](visitor.StrictVisitor.md#visitaspattern)

***

### visitAssignment()

> **visitAssignment**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Assignment`](../Statements/index.Assignment.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitAssignment`](visitor.StrictVisitor.md#visitassignment)

***

### visitAssignOperation()

> **visitAssignOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`AssignOperation`](../Operators/index.AssignOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitAssignOperation`](visitor.StrictVisitor.md#visitassignoperation)

***

### visitAttribute()

> **visitAttribute**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Attribute`](../OOP/index.Attribute.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitAttribute`](visitor.StrictVisitor.md#visitattribute)

***

### visitBitwiseBinaryOperation()

> **visitBitwiseBinaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseBinaryOperation`](../Operators/index.BitwiseBinaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitBitwiseBinaryOperation`](visitor.StrictVisitor.md#visitbitwisebinaryoperation)

***

### visitBitwiseUnaryOperation()

> **visitBitwiseUnaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BitwiseUnaryOperation`](../Operators/index.BitwiseUnaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitBitwiseUnaryOperation`](visitor.StrictVisitor.md#visitbitwiseunaryoperation)

***

### visitBooleanPrimitive()

> **visitBooleanPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`BooleanPrimitive`](../Literals/index.BooleanPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitBooleanPrimitive`](visitor.StrictVisitor.md#visitbooleanprimitive)

***

### visitBreak()

> **visitBreak**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Break`](../Statements/index.Break.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitBreak`](visitor.StrictVisitor.md#visitbreak)

***

### visitCall()

> **visitCall**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Call`](../Logic/index.Call.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitCall`](visitor.StrictVisitor.md#visitcall)

***

### visitCase()

> **visitCase**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Case`](../Expressions/index.Case.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitCase`](visitor.StrictVisitor.md#visitcase)

***

### visitCatch()

> **visitCatch**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Catch`](../Statements/index.Catch.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitCatch`](visitor.StrictVisitor.md#visitcatch)

***

### visitCharPrimitive()

> **visitCharPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CharPrimitive`](../Literals/index.CharPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitCharPrimitive`](visitor.StrictVisitor.md#visitcharprimitive)

***

### visitClass()

> **visitClass**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Class`](../OOP/index.Class.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitClass`](visitor.StrictVisitor.md#visitclass)

***

### visitComparisonOperation()

> **visitComparisonOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ComparisonOperation`](../Operators/index.ComparisonOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitComparisonOperation`](visitor.StrictVisitor.md#visitcomparisonoperation)

***

### visitCompositionExpression()

> **visitCompositionExpression**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`CompositionExpression`](../Expressions/index.CompositionExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitCompositionExpression`](visitor.StrictVisitor.md#visitcompositionexpression)

***

### visitConsExpr()

> **visitConsExpr**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsExpression`](../Expressions/index.ConsExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConsExpr`](visitor.StrictVisitor.md#visitconsexpr)

***

### visitConsPattern()

> **visitConsPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConsPattern`](../Patterns/index.ConsPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConsPattern`](visitor.StrictVisitor.md#visitconspattern)

***

### visitConstrainedType()

> **visitConstrainedType**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstrainedType`](../Types/index.ConstrainedType.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConstrainedType`](visitor.StrictVisitor.md#visitconstrainedtype)

***

### visitConstraint()

> **visitConstraint**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constraint`](../Types/index.Constraint.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConstraint`](visitor.StrictVisitor.md#visitconstraint)

***

### visitConstructor()

> **visitConstructor**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Constructor`](../Declarations/index.Constructor.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConstructor`](visitor.StrictVisitor.md#visitconstructor)

***

### visitConstructorPattern()

> **visitConstructorPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ConstructorPattern`](../Patterns/index.ConstructorPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitConstructorPattern`](visitor.StrictVisitor.md#visitconstructorpattern)

***

### visitContinue()

> **visitContinue**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Continue`](../Statements/index.Continue.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitContinue`](visitor.StrictVisitor.md#visitcontinue)

***

### visitDataExpr()

> **visitDataExpr**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`DataExpression`](../Expressions/index.DataExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitDataExpr`](visitor.StrictVisitor.md#visitdataexpr)

***

### visitEntryPoint()

> **visitEntryPoint**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`EntryPoint`](../Declarations/index.EntryPoint.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitEntryPoint`](visitor.StrictVisitor.md#visitentrypoint)

***

### visitEnumeration()

> **visitEnumeration**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Enumeration`](../Declarations/index.Enumeration.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitEnumeration`](visitor.StrictVisitor.md#visitenumeration)

***

### visitEquation()

> **visitEquation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Equation`](../Declarations/index.Equation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitEquation`](visitor.StrictVisitor.md#visitequation)

***

### visitExist()

> **visitExist**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Exist`](../Logic/index.Exist.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitExist`](visitor.StrictVisitor.md#visitexist)

***

### visitFact()

> **visitFact**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Fact`](../Logic/index.Fact.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFact`](visitor.StrictVisitor.md#visitfact)

***

### visitField()

> **visitField**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Field`](../Declarations/index.Field.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitField`](visitor.StrictVisitor.md#visitfield)

***

### visitFieldExpr()

> **visitFieldExpr**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FieldExpression`](../Expressions/index.FieldExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFieldExpr`](visitor.StrictVisitor.md#visitfieldexpr)

***

### visitFindall()

> **visitFindall**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Findall`](../Logic/index.Findall.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFindall`](visitor.StrictVisitor.md#visitfindall)

***

### visitFor()

> **visitFor**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`For`](../Statements/index.For.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFor`](visitor.StrictVisitor.md#visitfor)

***

### visitForall()

> **visitForall**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Forall`](../Logic/index.Forall.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitForall`](visitor.StrictVisitor.md#visitforall)

***

### visitForLoop()

> **visitForLoop**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ForLoop`](../Statements/index.ForLoop.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitForLoop`](visitor.StrictVisitor.md#visitforloop)

***

### visitFunction()

> **visitFunction**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Function`](../Declarations/index.Function.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFunction`](visitor.StrictVisitor.md#visitfunction)

***

### visitFunctorPattern()

> **visitFunctorPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`FunctorPattern`](../Patterns/index.FunctorPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitFunctorPattern`](visitor.StrictVisitor.md#visitfunctorpattern)

***

### visitGenerator()

> **visitGenerator**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Generator`](../Declarations/index.Generator.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitGenerator`](visitor.StrictVisitor.md#visitgenerator)

***

### visitGoal()

> **visitGoal**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Goal`](../Logic/index.Goal.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitGoal`](visitor.StrictVisitor.md#visitgoal)

***

### visitGuardedBody()

> **visitGuardedBody**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`GuardedBody`](../Declarations/index.GuardedBody.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitGuardedBody`](visitor.StrictVisitor.md#visitguardedbody)

***

### visitIf()

> **visitIf**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`If`](../Expressions/index.If.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitIf`](visitor.StrictVisitor.md#visitif)

***

### visitImplement()

> **visitImplement**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Implement`](../OOP/index.Implement.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitImplement`](visitor.StrictVisitor.md#visitimplement)

***

### visitInclude()

> **visitInclude**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Include`](../OOP/index.Include.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitInclude`](visitor.StrictVisitor.md#visitinclude)

***

### visitInput()

> **visitInput**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Input`](../Statements/index.Input.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitInput`](visitor.StrictVisitor.md#visitinput)

***

### visitInterface()

> **visitInterface**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Interface`](../OOP/index.Interface.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitInterface`](visitor.StrictVisitor.md#visitinterface)

***

### visitLambda()

> **visitLambda**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Lambda`](../Expressions/index.Lambda.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitLambda`](visitor.StrictVisitor.md#visitlambda)

***

### visitLetInExpr()

> **visitLetInExpr**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LetInExpression`](../Expressions/index.LetInExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitLetInExpr`](visitor.StrictVisitor.md#visitletinexpr)

***

### visitListBinaryOperation()

> **visitListBinaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListBinaryOperation`](../Operators/index.ListBinaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListBinaryOperation`](visitor.StrictVisitor.md#visitlistbinaryoperation)

***

### visitListComprehension()

> **visitListComprehension**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListComprehension`](../Expressions/index.ListComprehension.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListComprehension`](visitor.StrictVisitor.md#visitlistcomprehension)

***

### visitListPattern()

> **visitListPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPattern`](../Patterns/index.ListPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListPattern`](visitor.StrictVisitor.md#visitlistpattern)

***

### visitListPrimitive()

> **visitListPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListPrimitive`](../Literals/index.ListPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListPrimitive`](visitor.StrictVisitor.md#visitlistprimitive)

***

### visitListType()

> **visitListType**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListType`](../Types/index.ListType.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListType`](visitor.StrictVisitor.md#visitlisttype)

***

### visitListUnaryOperation()

> **visitListUnaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ListUnaryOperation`](../Operators/index.ListUnaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitListUnaryOperation`](visitor.StrictVisitor.md#visitlistunaryoperation)

***

### visitLiteralPattern()

> **visitLiteralPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LiteralPattern`](../Patterns/index.LiteralPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitLiteralPattern`](visitor.StrictVisitor.md#visitliteralpattern)

***

### visitLogicalBinaryOperation()

> **visitLogicalBinaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalBinaryOperation`](../Operators/index.LogicalBinaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitLogicalBinaryOperation`](visitor.StrictVisitor.md#visitlogicalbinaryoperation)

***

### visitLogicalUnaryOperation()

> **visitLogicalUnaryOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`LogicalUnaryOperation`](../Operators/index.LogicalUnaryOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitLogicalUnaryOperation`](visitor.StrictVisitor.md#visitlogicalunaryoperation)

***

### visitMethod()

> **visitMethod**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Method`](../OOP/index.Method.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitMethod`](visitor.StrictVisitor.md#visitmethod)

***

### visitNew()

> **visitNew**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`New`](../OOP/index.New.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitNew`](visitor.StrictVisitor.md#visitnew)

***

### visitNilPrimitive()

> **visitNilPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NilPrimitive`](../Literals/index.NilPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitNilPrimitive`](visitor.StrictVisitor.md#visitnilprimitive)

***

### visitNot()

> **visitNot**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Not`](../Logic/index.Not.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitNot`](visitor.StrictVisitor.md#visitnot)

***

### visitNumberPrimitive()

> **visitNumberPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`NumberPrimitive`](../Literals/index.NumberPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitNumberPrimitive`](visitor.StrictVisitor.md#visitnumberprimitive)

***

### visitObject()

> **visitObject**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Object`](../OOP/index.Object.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitObject`](visitor.StrictVisitor.md#visitobject)

***

### visitOtherwise()

> **visitOtherwise**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Otherwise`](../Declarations/index.Otherwise.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitOtherwise`](visitor.StrictVisitor.md#visitotherwise)

***

### visitParameterizedType()

> **visitParameterizedType**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`ParameterizedType`](../Types/index.ParameterizedType.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitParameterizedType`](visitor.StrictVisitor.md#visitparameterizedtype)

***

### visitPrint()

> **visitPrint**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Print`](../Statements/index.Print.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitPrint`](visitor.StrictVisitor.md#visitprint)

***

### visitProcedure()

> **visitProcedure**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Procedure`](../Declarations/index.Procedure.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitProcedure`](visitor.StrictVisitor.md#visitprocedure)

***

### visitQuery()

> **visitQuery**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Query`](../Logic/index.Query.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitQuery`](visitor.StrictVisitor.md#visitquery)

***

### visitRaise()

> **visitRaise**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Raise`](../Statements/index.Raise.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitRaise`](visitor.StrictVisitor.md#visitraise)

***

### visitRangeExpression()

> **visitRangeExpression**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`RangeExpression`](../Expressions/index.RangeExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitRangeExpression`](visitor.StrictVisitor.md#visitrangeexpression)

***

### visitRecord()

> **visitRecord**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Record`](../Declarations/index.Record.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitRecord`](visitor.StrictVisitor.md#visitrecord)

***

### visitRepeat()

> **visitRepeat**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Repeat`](../Statements/index.Repeat.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitRepeat`](visitor.StrictVisitor.md#visitrepeat)

***

### visitReturn()

> **visitReturn**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Return`](../Statements/index.Return.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitReturn`](visitor.StrictVisitor.md#visitreturn)

***

### visitRule()

> **visitRule**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Rule`](../Logic/index.Rule.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitRule`](visitor.StrictVisitor.md#visitrule)

***

### visitSelf()

> **visitSelf**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Self`](../OOP/index.Self.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSelf`](visitor.StrictVisitor.md#visitself)

***

### visitSend()

> **visitSend**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Send`](../OOP/index.Send.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSend`](visitor.StrictVisitor.md#visitsend)

***

### visitSequence()

> **visitSequence**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Sequence`](../Statements/index.Sequence.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSequence`](visitor.StrictVisitor.md#visitsequence)

***

### visitSimpleType()

> **visitSimpleType**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SimpleType`](../Types/index.SimpleType.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSimpleType`](visitor.StrictVisitor.md#visitsimpletype)

***

### visitStringOperation()

> **visitStringOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringOperation`](../Operators/index.StringOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitStringOperation`](visitor.StrictVisitor.md#visitstringoperation)

***

### visitStringPrimitive()

> **visitStringPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`StringPrimitive`](../Literals/index.StringPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitStringPrimitive`](visitor.StrictVisitor.md#visitstringprimitive)

***

### visitStructure()

> **visitStructure**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Structure`](../Declarations/index.Structure.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitStructure`](visitor.StrictVisitor.md#visitstructure)

***

### visitSuper()

> **visitSuper**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Super`](../OOP/index.Super.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSuper`](visitor.StrictVisitor.md#visitsuper)

***

### visitSwitch()

> **visitSwitch**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Switch`](../Expressions/index.Switch.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSwitch`](visitor.StrictVisitor.md#visitswitch)

***

### visitSymbolPrimitive()

> **visitSymbolPrimitive**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`SymbolPrimitive`](../Literals/index.SymbolPrimitive.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitSymbolPrimitive`](visitor.StrictVisitor.md#visitsymbolprimitive)

***

### visitTry()

> **visitTry**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Try`](../Statements/index.Try.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTry`](visitor.StrictVisitor.md#visittry)

***

### visitTupleExpr()

> **visitTupleExpr**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleExpression`](../Expressions/index.TupleExpression.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTupleExpr`](visitor.StrictVisitor.md#visittupleexpr)

***

### visitTuplePattern()

> **visitTuplePattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TuplePattern`](../Patterns/index.TuplePattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTuplePattern`](visitor.StrictVisitor.md#visittuplepattern)

***

### visitTupleType()

> **visitTupleType**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TupleType`](../Types/index.TupleType.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTupleType`](visitor.StrictVisitor.md#visittupletype)

***

### visitTypeAlias()

> **visitTypeAlias**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeAlias`](../Types/index.TypeAlias.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTypeAlias`](visitor.StrictVisitor.md#visittypealias)

***

### visitTypeApplication()

> **visitTypeApplication**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeApplication`](../Types/index.TypeApplication.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTypeApplication`](visitor.StrictVisitor.md#visittypeapplication)

***

### visitTypeCast()

> **visitTypeCast**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeCast`](../Types/index.TypeCast.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTypeCast`](visitor.StrictVisitor.md#visittypecast)

***

### visitTypeSignature()

> **visitTypeSignature**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeSignature`](../Types/index.TypeSignature.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTypeSignature`](visitor.StrictVisitor.md#visittypesignature)

***

### visitTypeVar()

> **visitTypeVar**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TypeVar`](../Types/index.TypeVar.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitTypeVar`](visitor.StrictVisitor.md#visittypevar)

***

### visitUnguardedBody()

> **visitUnguardedBody**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnguardedBody`](../Declarations/index.UnguardedBody.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitUnguardedBody`](visitor.StrictVisitor.md#visitunguardedbody)

***

### visitUnifyOperation()

> **visitUnifyOperation**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnifyOperation`](../Logic/index.UnifyOperation.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitUnifyOperation`](visitor.StrictVisitor.md#visitunifyoperation)

***

### visitUnionPattern()

> **visitUnionPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`UnionPattern`](../Patterns/index.UnionPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitUnionPattern`](visitor.StrictVisitor.md#visitunionpattern)

***

### visitVariable()

> **visitVariable**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Variable`](../Expressions/index.Variable.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitVariable`](visitor.StrictVisitor.md#visitvariable)

***

### visitVariablePattern()

> **visitVariablePattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`VariablePattern`](../Patterns/index.VariablePattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitVariablePattern`](visitor.StrictVisitor.md#visitvariablepattern)

***

### visitWhile()

> **visitWhile**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`While`](../Statements/index.While.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitWhile`](visitor.StrictVisitor.md#visitwhile)

***

### visitWildcardPattern()

> **visitWildcardPattern**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`WildcardPattern`](../Patterns/index.WildcardPattern.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitWildcardPattern`](visitor.StrictVisitor.md#visitwildcardpattern)

***

### visitYield()

> **visitYield**(`node`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Yield`](../Statements/index.Yield.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitYield`](visitor.StrictVisitor.md#visityield)
