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
| `node` | [`Application`](../Expressions/Application.md) |

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
| `node` | [`ApplicationPattern`](../Patterns/ApplicationPattern.md) |

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
| `node` | [`ArithmeticBinaryOperation`](../Operators/ArithmeticBinaryOperation.md) |

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
| `node` | [`ArithmeticUnaryOperation`](../Operators/ArithmeticUnaryOperation.md) |

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
| `node` | [`AsPattern`](../Patterns/AsPattern.md) |

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
| `node` | [`Assignment`](../Statements/Assignment.md) |

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
| `node` | [`AssignOperation`](../Operators/AssignOperation.md) |

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
| `node` | [`Attribute`](../OOP/Attribute.md) |

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
| `node` | [`BitwiseBinaryOperation`](../Operators/BitwiseBinaryOperation.md) |

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
| `node` | [`BitwiseUnaryOperation`](../Operators/BitwiseUnaryOperation.md) |

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
| `node` | [`BooleanPrimitive`](../Literals/BooleanPrimitive.md) |

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
| `node` | [`Break`](../Statements/Break.md) |

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
| `node` | [`Call`](../Logic/Call.md) |

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
| `node` | [`Case`](../Expressions/Case.md) |

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
| `node` | [`Catch`](../Statements/Catch.md) |

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
| `node` | [`CharPrimitive`](../Literals/CharPrimitive.md) |

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
| `node` | [`Class`](../OOP/Class.md) |

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
| `node` | [`ComparisonOperation`](../Operators/ComparisonOperation.md) |

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
| `node` | [`CompositionExpression`](../Expressions/CompositionExpression.md) |

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
| `node` | [`ConsExpression`](../Expressions/ConsExpression.md) |

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
| `node` | [`ConsPattern`](../Patterns/ConsPattern.md) |

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
| `node` | [`ConstrainedType`](../Types/ConstrainedType.md) |

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
| `node` | [`Constraint`](../Types/Constraint.md) |

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
| `node` | [`Constructor`](../Declarations/Constructor.md) |

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
| `node` | [`ConstructorPattern`](../Patterns/ConstructorPattern.md) |

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
| `node` | [`Continue`](../Statements/Continue.md) |

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
| `node` | [`DataExpression`](../Expressions/DataExpression.md) |

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
| `node` | [`EntryPoint`](../Declarations/EntryPoint.md) |

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
| `node` | [`Enumeration`](../Declarations/Enumeration.md) |

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
| `node` | [`Equation`](../Declarations/Equation.md) |

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
| `node` | [`Exist`](../Logic/Exist.md) |

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
| `node` | [`Fact`](../Logic/Fact.md) |

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
| `node` | [`Field`](../Declarations/Field.md) |

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
| `node` | [`FieldExpression`](../Expressions/FieldExpression.md) |

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
| `node` | [`Findall`](../Logic/Findall.md) |

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
| `node` | [`For`](../Statements/For.md) |

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
| `node` | [`Forall`](../Logic/Forall.md) |

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
| `node` | [`ForLoop`](../Statements/ForLoop.md) |

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
| `node` | [`Function`](../Declarations/Function.md) |

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
| `node` | [`FunctorPattern`](../Patterns/FunctorPattern.md) |

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
| `node` | [`Generator`](../Declarations/Generator.md) |

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
| `node` | [`Goal`](../Logic/Goal.md) |

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
| `node` | [`GuardedBody`](../Declarations/GuardedBody.md) |

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
| `node` | [`If`](../Expressions/If.md) |

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
| `node` | [`Implement`](../OOP/Implement.md) |

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
| `node` | [`Include`](../OOP/Include.md) |

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
| `node` | [`Input`](../Statements/Input.md) |

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
| `node` | [`Interface`](../OOP/Interface.md) |

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
| `node` | [`Lambda`](../Expressions/Lambda.md) |

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
| `node` | [`LetInExpression`](../Expressions/LetInExpression.md) |

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
| `node` | [`ListBinaryOperation`](../Operators/ListBinaryOperation.md) |

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
| `node` | [`ListComprehension`](../Expressions/ListComprehension.md) |

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
| `node` | [`ListPattern`](../Patterns/ListPattern.md) |

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
| `node` | [`ListPrimitive`](../Literals/ListPrimitive.md) |

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
| `node` | [`ListType`](../Types/ListType.md) |

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
| `node` | [`ListUnaryOperation`](../Operators/ListUnaryOperation.md) |

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
| `node` | [`LiteralPattern`](../Patterns/LiteralPattern.md) |

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
| `node` | [`LogicalBinaryOperation`](../Operators/LogicalBinaryOperation.md) |

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
| `node` | [`LogicalUnaryOperation`](../Operators/LogicalUnaryOperation.md) |

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
| `node` | [`Method`](../OOP/Method.md) |

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
| `node` | [`New`](../OOP/New.md) |

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
| `node` | [`NilPrimitive`](../Literals/NilPrimitive.md) |

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
| `node` | [`Not`](../Logic/Not.md) |

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
| `node` | [`NumberPrimitive`](../Literals/NumberPrimitive.md) |

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
| `node` | [`Object`](../OOP/Object.md) |

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
| `node` | [`Otherwise`](../Declarations/Otherwise.md) |

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
| `node` | [`ParameterizedType`](../Types/ParameterizedType.md) |

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
| `node` | [`Print`](../Statements/Print.md) |

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
| `node` | [`Procedure`](../Declarations/Procedure.md) |

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
| `node` | [`Query`](../Logic/Query.md) |

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
| `node` | [`Raise`](../Statements/Raise.md) |

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
| `node` | [`RangeExpression`](../Expressions/RangeExpression.md) |

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
| `node` | [`Record`](../Declarations/Record.md) |

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
| `node` | [`Repeat`](../Statements/Repeat.md) |

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
| `node` | [`Return`](../Statements/Return.md) |

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
| `node` | [`Rule`](../Logic/Rule.md) |

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
| `node` | [`Self`](../OOP/Self.md) |

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
| `node` | [`Send`](../OOP/Send.md) |

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
| `node` | [`Sequence`](../Statements/Sequence.md) |

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
| `node` | [`SimpleType`](../Types/SimpleType.md) |

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
| `node` | [`StringOperation`](../Operators/StringOperation.md) |

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
| `node` | [`StringPrimitive`](../Literals/StringPrimitive.md) |

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
| `node` | [`Structure`](../Declarations/Structure.md) |

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
| `node` | [`Super`](../OOP/Super.md) |

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
| `node` | [`Switch`](../Expressions/Switch.md) |

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
| `node` | [`SymbolPrimitive`](../Literals/SymbolPrimitive.md) |

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
| `node` | [`Try`](../Statements/Try.md) |

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
| `node` | [`TupleExpression`](../Expressions/TupleExpression.md) |

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
| `node` | [`TuplePattern`](../Patterns/TuplePattern.md) |

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
| `node` | [`TupleType`](../Types/TupleType.md) |

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
| `node` | [`TypeAlias`](../Types/TypeAlias.md) |

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
| `node` | [`TypeApplication`](../Types/TypeApplication.md) |

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
| `node` | [`TypeCast`](../Types/TypeCast.md) |

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
| `node` | [`TypeSignature`](../Types/TypeSignature.md) |

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
| `node` | [`TypeVar`](../Types/TypeVar.md) |

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
| `node` | [`UnguardedBody`](../Declarations/UnguardedBody.md) |

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
| `node` | [`UnifyOperation`](../Logic/UnifyOperation.md) |

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
| `node` | [`UnionPattern`](../Patterns/UnionPattern.md) |

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
| `node` | [`Variable`](../Expressions/Variable.md) |

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
| `node` | [`VariablePattern`](../Patterns/VariablePattern.md) |

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
| `node` | [`While`](../Statements/While.md) |

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
| `node` | [`WildcardPattern`](../Patterns/WildcardPattern.md) |

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
| `node` | [`Yield`](../Statements/Yield.md) |

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](visitor.StrictVisitor.md).[`visitYield`](visitor.StrictVisitor.md#visityield)
