[yukigo-core](../../index.md) / [visitor](../index.md) / TraverseVisitor

# Class: TraverseVisitor

Defined in: src/visitor.ts:237

## Implements

- [`StrictVisitor`](../interfaces/StrictVisitor.md)\<`void`\>

## Constructors

### Constructor

> **new TraverseVisitor**(): `TraverseVisitor`

#### Returns

`TraverseVisitor`

## Methods

### traverseCollection()

> `protected` **traverseCollection**(`nodes`): `void`

Defined in: src/visitor.ts:238

#### Parameters

##### nodes

[`ASTNode`](../../index/classes/ASTNode.md)[]

#### Returns

`void`

***

### visit()

> **visit**(`node`): `void`

Defined in: src/visitor.ts:611

#### Parameters

##### node

[`ASTNode`](../../index/classes/ASTNode.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visit`](../interfaces/StrictVisitor.md#visit)

***

### visitApplication()

> **visitApplication**(`node`): `void`

Defined in: src/visitor.ts:336

#### Parameters

##### node

[`Application`](../../index/classes/Application.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitApplication`](../interfaces/StrictVisitor.md#visitapplication)

***

### visitApplicationPattern()

> **visitApplicationPattern**(`node`): `void`

Defined in: src/visitor.ts:542

#### Parameters

##### node

[`ApplicationPattern`](../../index/classes/ApplicationPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitApplicationPattern`](../interfaces/StrictVisitor.md#visitapplicationpattern)

***

### visitArithmeticBinaryOperation()

> **visitArithmeticBinaryOperation**(`node`): `void`

Defined in: src/visitor.ts:263

#### Parameters

##### node

[`ArithmeticBinaryOperation`](../../index/classes/ArithmeticBinaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitArithmeticBinaryOperation`](../interfaces/StrictVisitor.md#visitarithmeticbinaryoperation)

***

### visitArithmeticUnaryOperation()

> **visitArithmeticUnaryOperation**(`node`): `void`

Defined in: src/visitor.ts:260

#### Parameters

##### node

[`ArithmeticUnaryOperation`](../../index/classes/ArithmeticUnaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitArithmeticUnaryOperation`](../interfaces/StrictVisitor.md#visitarithmeticunaryoperation)

***

### visitAsPattern()

> **visitAsPattern**(`node`): `void`

Defined in: src/visitor.ts:556

#### Parameters

##### node

[`AsPattern`](../../index/classes/AsPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitAsPattern`](../interfaces/StrictVisitor.md#visitaspattern)

***

### visitAssignment()

> **visitAssignment**(`node`): `void`

Defined in: src/visitor.ts:471

#### Parameters

##### node

[`Assignment`](../../index/classes/Assignment.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitAssignment`](../interfaces/StrictVisitor.md#visitassignment)

***

### visitAssignOperation()

> **visitAssignOperation**(`node`): `void`

Defined in: src/visitor.ts:300

#### Parameters

##### node

[`AssignOperation`](../../index/classes/AssignOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitAssignOperation`](../interfaces/StrictVisitor.md#visitassignoperation)

***

### visitAttribute()

> **visitAttribute**(`node`): `void`

Defined in: src/visitor.ts:517

#### Parameters

##### node

[`Attribute`](../../index/classes/Attribute.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitAttribute`](../interfaces/StrictVisitor.md#visitattribute)

***

### visitBitwiseBinaryOperation()

> **visitBitwiseBinaryOperation**(`node`): `void`

Defined in: src/visitor.ts:285

#### Parameters

##### node

[`BitwiseBinaryOperation`](../../index/classes/BitwiseBinaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitBitwiseBinaryOperation`](../interfaces/StrictVisitor.md#visitbitwisebinaryoperation)

***

### visitBitwiseUnaryOperation()

> **visitBitwiseUnaryOperation**(`node`): `void`

Defined in: src/visitor.ts:289

#### Parameters

##### node

[`BitwiseUnaryOperation`](../../index/classes/BitwiseUnaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitBitwiseUnaryOperation`](../interfaces/StrictVisitor.md#visitbitwiseunaryoperation)

***

### visitBooleanPrimitive()

> **visitBooleanPrimitive**(`node`): `void`

Defined in: src/visitor.ts:252

#### Parameters

##### node

[`BooleanPrimitive`](../../index/classes/BooleanPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitBooleanPrimitive`](../interfaces/StrictVisitor.md#visitbooleanprimitive)

***

### visitBreak()

> **visitBreak**(`node`): `void`

Defined in: src/visitor.ts:460

#### Parameters

##### node

[`Break`](../../index/classes/Break.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitBreak`](../interfaces/StrictVisitor.md#visitbreak)

***

### visitCall()

> **visitCall**(`node`): `void`

Defined in: src/visitor.ts:323

#### Parameters

##### node

[`Call`](../../index/classes/Call.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitCall`](../interfaces/StrictVisitor.md#visitcall)

***

### visitCase()

> **visitCase**(`node`): `void`

Defined in: src/visitor.ts:437

#### Parameters

##### node

[`Case`](../../index/classes/Case.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitCase`](../interfaces/StrictVisitor.md#visitcase)

***

### visitCatch()

> **visitCatch**(`node`): `void`

Defined in: src/visitor.ts:446

#### Parameters

##### node

[`Catch`](../../index/classes/Catch.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitCatch`](../interfaces/StrictVisitor.md#visitcatch)

***

### visitCharPrimitive()

> **visitCharPrimitive**(`node`): `void`

Defined in: src/visitor.ts:259

#### Parameters

##### node

[`CharPrimitive`](../../index/classes/CharPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitCharPrimitive`](../interfaces/StrictVisitor.md#visitcharprimitive)

***

### visitClass()

> **visitClass**(`node`): `void`

Defined in: src/visitor.ts:525

#### Parameters

##### node

[`Class`](../../index/classes/Class.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitClass`](../interfaces/StrictVisitor.md#visitclass)

***

### visitComparisonOperation()

> **visitComparisonOperation**(`node`): `void`

Defined in: src/visitor.ts:274

#### Parameters

##### node

[`ComparisonOperation`](../../index/classes/ComparisonOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitComparisonOperation`](../interfaces/StrictVisitor.md#visitcomparisonoperation)

***

### visitCompositionExpression()

> **visitCompositionExpression**(`node`): `void`

Defined in: src/visitor.ts:328

#### Parameters

##### node

[`CompositionExpression`](../../index/classes/CompositionExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitCompositionExpression`](../interfaces/StrictVisitor.md#visitcompositionexpression)

***

### visitConsExpr()

> **visitConsExpr**(`node`): `void`

Defined in: src/visitor.ts:315

#### Parameters

##### node

[`ConsExpression`](../../index/classes/ConsExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConsExpr`](../interfaces/StrictVisitor.md#visitconsexpr)

***

### visitConsPattern()

> **visitConsPattern**(`node`): `void`

Defined in: src/visitor.ts:567

#### Parameters

##### node

[`ConsPattern`](../../index/classes/ConsPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConsPattern`](../interfaces/StrictVisitor.md#visitconspattern)

***

### visitConstrainedType()

> **visitConstrainedType**(`node`): `void`

Defined in: src/visitor.ts:596

#### Parameters

##### node

[`ConstrainedType`](../../index/classes/ConstrainedType.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConstrainedType`](../interfaces/StrictVisitor.md#visitconstrainedtype)

***

### visitConstraint()

> **visitConstraint**(`node`): `void`

Defined in: src/visitor.ts:588

#### Parameters

##### node

[`Constraint`](../../index/classes/Constraint.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConstraint`](../interfaces/StrictVisitor.md#visitconstraint)

***

### visitConstructor()

> **visitConstructor**(`node`): `void`

Defined in: src/visitor.ts:408

#### Parameters

##### node

[`Constructor`](../../index/classes/Constructor.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConstructor`](../interfaces/StrictVisitor.md#visitconstructor)

***

### visitConstructorPattern()

> **visitConstructorPattern**(`node`): `void`

Defined in: src/visitor.ts:564

#### Parameters

##### node

[`ConstructorPattern`](../../index/classes/ConstructorPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitConstructorPattern`](../interfaces/StrictVisitor.md#visitconstructorpattern)

***

### visitContinue()

> **visitContinue**(`node`): `void`

Defined in: src/visitor.ts:463

#### Parameters

##### node

[`Continue`](../../index/classes/Continue.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitContinue`](../interfaces/StrictVisitor.md#visitcontinue)

***

### visitDataExpr()

> **visitDataExpr**(`node`): `void`

Defined in: src/visitor.ts:311

#### Parameters

##### node

[`DataExpression`](../../index/classes/DataExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitDataExpr`](../interfaces/StrictVisitor.md#visitdataexpr)

***

### visitEntryPoint()

> **visitEntryPoint**(`node`): `void`

Defined in: src/visitor.ts:475

#### Parameters

##### node

[`EntryPoint`](../../index/classes/EntryPoint.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitEntryPoint`](../interfaces/StrictVisitor.md#visitentrypoint)

***

### visitEnumeration()

> **visitEnumeration**(`node`): `void`

Defined in: src/visitor.ts:483

#### Parameters

##### node

[`Enumeration`](../../index/classes/Enumeration.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitEnumeration`](../interfaces/StrictVisitor.md#visitenumeration)

***

### visitEquation()

> **visitEquation**(`node`): `void`

Defined in: src/visitor.ts:424

#### Parameters

##### node

[`Equation`](../../index/classes/Equation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitEquation`](../interfaces/StrictVisitor.md#visitequation)

***

### visitExist()

> **visitExist**(`node`): `void`

Defined in: src/visitor.ts:340

#### Parameters

##### node

[`Exist`](../../index/classes/Exist.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitExist`](../interfaces/StrictVisitor.md#visitexist)

***

### visitFact()

> **visitFact**(`node`): `void`

Defined in: src/visitor.ts:506

#### Parameters

##### node

[`Fact`](../../index/classes/Fact.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFact`](../interfaces/StrictVisitor.md#visitfact)

***

### visitField()

> **visitField**(`node`): `void`

Defined in: src/visitor.ts:404

#### Parameters

##### node

[`Field`](../../index/classes/Field.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitField`](../interfaces/StrictVisitor.md#visitfield)

***

### visitFieldExpr()

> **visitFieldExpr**(`node`): `void`

Defined in: src/visitor.ts:307

#### Parameters

##### node

[`FieldExpression`](../../index/classes/FieldExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFieldExpr`](../interfaces/StrictVisitor.md#visitfieldexpr)

***

### visitFindall()

> **visitFindall**(`node`): `void`

Defined in: src/visitor.ts:347

#### Parameters

##### node

[`Findall`](../../index/classes/Findall.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFindall`](../interfaces/StrictVisitor.md#visitfindall)

***

### visitFor()

> **visitFor**(`node`): `void`

Defined in: src/visitor.ts:456

#### Parameters

##### node

[`For`](../../index/classes/For.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFor`](../interfaces/StrictVisitor.md#visitfor)

***

### visitForall()

> **visitForall**(`node`): `void`

Defined in: src/visitor.ts:352

#### Parameters

##### node

[`Forall`](../../index/classes/Forall.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitForall`](../interfaces/StrictVisitor.md#visitforall)

***

### visitForLoop()

> **visitForLoop**(`node`): `void`

Defined in: src/visitor.ts:495

#### Parameters

##### node

[`ForLoop`](../../index/classes/ForLoop.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitForLoop`](../interfaces/StrictVisitor.md#visitforloop)

***

### visitFunction()

> **visitFunction**(`node`): `void`

Defined in: src/visitor.ts:400

#### Parameters

##### node

[`Function`](../../index/classes/Function.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFunction`](../interfaces/StrictVisitor.md#visitfunction)

***

### visitFunctorPattern()

> **visitFunctorPattern**(`node`): `void`

Defined in: src/visitor.ts:552

#### Parameters

##### node

[`FunctorPattern`](../../index/classes/FunctorPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitFunctorPattern`](../interfaces/StrictVisitor.md#visitfunctorpattern)

***

### visitGenerator()

> **visitGenerator**(`node`): `void`

Defined in: src/visitor.ts:380

#### Parameters

##### node

[`Generator`](../../index/classes/Generator.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitGenerator`](../interfaces/StrictVisitor.md#visitgenerator)

***

### visitGoal()

> **visitGoal**(`node`): `void`

Defined in: src/visitor.ts:356

#### Parameters

##### node

[`Goal`](../../index/classes/Goal.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitGoal`](../interfaces/StrictVisitor.md#visitgoal)

***

### visitGuardedBody()

> **visitGuardedBody**(`node`): `void`

Defined in: src/visitor.ts:420

#### Parameters

##### node

[`GuardedBody`](../../index/classes/GuardedBody.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitGuardedBody`](../interfaces/StrictVisitor.md#visitguardedbody)

***

### visitIf()

> **visitIf**(`node`): `void`

Defined in: src/visitor.ts:392

#### Parameters

##### node

[`If`](../../index/classes/If.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitIf`](../interfaces/StrictVisitor.md#visitif)

***

### visitImplement()

> **visitImplement**(`node`): `void`

Defined in: src/visitor.ts:369

#### Parameters

##### node

[`Implement`](../../index/classes/Implement.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitImplement`](../interfaces/StrictVisitor.md#visitimplement)

***

### visitInclude()

> **visitInclude**(`node`): `void`

Defined in: src/visitor.ts:372

#### Parameters

##### node

[`Include`](../../index/classes/Include.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitInclude`](../interfaces/StrictVisitor.md#visitinclude)

***

### visitInterface()

> **visitInterface**(`node`): `void`

Defined in: src/visitor.ts:531

#### Parameters

##### node

[`Interface`](../../index/classes/Interface.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitInterface`](../interfaces/StrictVisitor.md#visitinterface)

***

### visitLambda()

> **visitLambda**(`node`): `void`

Defined in: src/visitor.ts:332

#### Parameters

##### node

[`Lambda`](../../index/classes/Lambda.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitLambda`](../interfaces/StrictVisitor.md#visitlambda)

***

### visitLetInExpr()

> **visitLetInExpr**(`node`): `void`

Defined in: src/visitor.ts:319

#### Parameters

##### node

[`LetInExpression`](../../index/classes/LetInExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitLetInExpr`](../interfaces/StrictVisitor.md#visitletinexpr)

***

### visitListBinaryOperation()

> **visitListBinaryOperation**(`node`): `void`

Defined in: src/visitor.ts:270

#### Parameters

##### node

[`ListBinaryOperation`](../../index/classes/ListBinaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListBinaryOperation`](../interfaces/StrictVisitor.md#visitlistbinaryoperation)

***

### visitListComprehension()

> **visitListComprehension**(`node`): `void`

Defined in: src/visitor.ts:376

#### Parameters

##### node

[`ListComprehension`](../../index/classes/ListComprehension.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListComprehension`](../interfaces/StrictVisitor.md#visitlistcomprehension)

***

### visitListPattern()

> **visitListPattern**(`node`): `void`

Defined in: src/visitor.ts:549

#### Parameters

##### node

[`ListPattern`](../../index/classes/ListPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListPattern`](../interfaces/StrictVisitor.md#visitlistpattern)

***

### visitListPrimitive()

> **visitListPrimitive**(`node`): `void`

Defined in: src/visitor.ts:254

#### Parameters

##### node

[`ListPrimitive`](../../index/classes/ListPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListPrimitive`](../interfaces/StrictVisitor.md#visitlistprimitive)

***

### visitListType()

> **visitListType**(`node`): `void`

Defined in: src/visitor.ts:581

#### Parameters

##### node

[`ListType`](../../index/classes/ListType.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListType`](../interfaces/StrictVisitor.md#visitlisttype)

***

### visitListUnaryOperation()

> **visitListUnaryOperation**(`node`): `void`

Defined in: src/visitor.ts:267

#### Parameters

##### node

[`ListUnaryOperation`](../../index/classes/ListUnaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitListUnaryOperation`](../interfaces/StrictVisitor.md#visitlistunaryoperation)

***

### visitLiteralPattern()

> **visitLiteralPattern**(`node`): `void`

Defined in: src/visitor.ts:539

#### Parameters

##### node

[`LiteralPattern`](../../index/classes/LiteralPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitLiteralPattern`](../interfaces/StrictVisitor.md#visitliteralpattern)

***

### visitLogicalBinaryOperation()

> **visitLogicalBinaryOperation**(`node`): `void`

Defined in: src/visitor.ts:278

#### Parameters

##### node

[`LogicalBinaryOperation`](../../index/classes/LogicalBinaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitLogicalBinaryOperation`](../interfaces/StrictVisitor.md#visitlogicalbinaryoperation)

***

### visitLogicalUnaryOperation()

> **visitLogicalUnaryOperation**(`node`): `void`

Defined in: src/visitor.ts:282

#### Parameters

##### node

[`LogicalUnaryOperation`](../../index/classes/LogicalUnaryOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitLogicalUnaryOperation`](../interfaces/StrictVisitor.md#visitlogicalunaryoperation)

***

### visitMethod()

> **visitMethod**(`node`): `void`

Defined in: src/visitor.ts:513

#### Parameters

##### node

[`Method`](../../index/classes/Method.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitMethod`](../interfaces/StrictVisitor.md#visitmethod)

***

### visitNew()

> **visitNew**(`node`): `void`

Defined in: src/visitor.ts:365

#### Parameters

##### node

[`New`](../../index/classes/New.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitNew`](../interfaces/StrictVisitor.md#visitnew)

***

### visitNilPrimitive()

> **visitNilPrimitive**(`node`): `void`

Defined in: src/visitor.ts:257

#### Parameters

##### node

[`NilPrimitive`](../../index/classes/NilPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitNilPrimitive`](../interfaces/StrictVisitor.md#visitnilprimitive)

***

### visitNot()

> **visitNot**(`node`): `void`

Defined in: src/visitor.ts:344

#### Parameters

##### node

[`Not`](../../index/classes/Not.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitNot`](../interfaces/StrictVisitor.md#visitnot)

***

### visitNumberPrimitive()

> **visitNumberPrimitive**(`node`): `void`

Defined in: src/visitor.ts:251

#### Parameters

##### node

[`NumberPrimitive`](../../index/classes/NumberPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitNumberPrimitive`](../interfaces/StrictVisitor.md#visitnumberprimitive)

***

### visitObject()

> **visitObject**(`node`): `void`

Defined in: src/visitor.ts:521

#### Parameters

##### node

[`Object`](../../index/classes/Object.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitObject`](../interfaces/StrictVisitor.md#visitobject)

***

### visitOtherwise()

> **visitOtherwise**(`node`): `void`

Defined in: src/visitor.ts:327

#### Parameters

##### node

[`Otherwise`](../../index/classes/Otherwise.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitOtherwise`](../interfaces/StrictVisitor.md#visitotherwise)

***

### visitParameterizedType()

> **visitParameterizedType**(`node`): `void`

Defined in: src/visitor.ts:591

#### Parameters

##### node

[`ParameterizedType`](../../index/classes/ParameterizedType.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitParameterizedType`](../interfaces/StrictVisitor.md#visitparameterizedtype)

***

### visitPrint()

> **visitPrint**(`node`): `void`

Defined in: src/visitor.ts:453

#### Parameters

##### node

[`Print`](../../index/classes/Print.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitPrint`](../interfaces/StrictVisitor.md#visitprint)

***

### visitProcedure()

> **visitProcedure**(`node`): `void`

Defined in: src/visitor.ts:479

#### Parameters

##### node

[`Procedure`](../../index/classes/Procedure.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitProcedure`](../interfaces/StrictVisitor.md#visitprocedure)

***

### visitQuery()

> **visitQuery**(`node`): `void`

Defined in: src/visitor.ts:510

#### Parameters

##### node

[`Query`](../../index/classes/Query.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitQuery`](../interfaces/StrictVisitor.md#visitquery)

***

### visitRaise()

> **visitRaise**(`node`): `void`

Defined in: src/visitor.ts:450

#### Parameters

##### node

[`Raise`](../../index/classes/Raise.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitRaise`](../interfaces/StrictVisitor.md#visitraise)

***

### visitRangeExpression()

> **visitRangeExpression**(`node`): `void`

Defined in: src/visitor.ts:384

#### Parameters

##### node

[`RangeExpression`](../../index/classes/RangeExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitRangeExpression`](../interfaces/StrictVisitor.md#visitrangeexpression)

***

### visitRecord()

> **visitRecord**(`node`): `void`

Defined in: src/visitor.ts:412

#### Parameters

##### node

[`Record`](../../index/classes/Record.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitRecord`](../interfaces/StrictVisitor.md#visitrecord)

***

### visitRepeat()

> **visitRepeat**(`node`): `void`

Defined in: src/visitor.ts:491

#### Parameters

##### node

[`Repeat`](../../index/classes/Repeat.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitRepeat`](../interfaces/StrictVisitor.md#visitrepeat)

***

### visitReturn()

> **visitReturn**(`node`): `void`

Defined in: src/visitor.ts:397

#### Parameters

##### node

[`Return`](../../index/classes/Return.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitReturn`](../interfaces/StrictVisitor.md#visitreturn)

***

### visitRule()

> **visitRule**(`node`): `void`

Defined in: src/visitor.ts:501

#### Parameters

##### node

[`Rule`](../../index/classes/Rule.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitRule`](../interfaces/StrictVisitor.md#visitrule)

***

### visitSelf()

> **visitSelf**(`node`): `void`

Defined in: src/visitor.ts:375

#### Parameters

##### node

[`Self`](../../index/classes/Self.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSelf`](../interfaces/StrictVisitor.md#visitself)

***

### visitSend()

> **visitSend**(`node`): `void`

Defined in: src/visitor.ts:360

#### Parameters

##### node

[`Send`](../../index/classes/Send.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSend`](../interfaces/StrictVisitor.md#visitsend)

***

### visitSequence()

> **visitSequence**(`node`): `void`

Defined in: src/visitor.ts:248

#### Parameters

##### node

[`Sequence`](../../index/classes/Sequence.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSequence`](../interfaces/StrictVisitor.md#visitsequence)

***

### visitSimpleType()

> **visitSimpleType**(`node`): `void`

Defined in: src/visitor.ts:571

#### Parameters

##### node

[`SimpleType`](../../index/classes/SimpleType.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSimpleType`](../interfaces/StrictVisitor.md#visitsimpletype)

***

### visitStringOperation()

> **visitStringOperation**(`node`): `void`

Defined in: src/visitor.ts:292

#### Parameters

##### node

[`StringOperation`](../../index/classes/StringOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitStringOperation`](../interfaces/StrictVisitor.md#visitstringoperation)

***

### visitStringPrimitive()

> **visitStringPrimitive**(`node`): `void`

Defined in: src/visitor.ts:253

#### Parameters

##### node

[`StringPrimitive`](../../index/classes/StringPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitStringPrimitive`](../interfaces/StrictVisitor.md#visitstringprimitive)

***

### visitSwitch()

> **visitSwitch**(`node`): `void`

Defined in: src/visitor.ts:433

#### Parameters

##### node

[`Switch`](../../index/classes/Switch.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSwitch`](../interfaces/StrictVisitor.md#visitswitch)

***

### visitSymbolPrimitive()

> **visitSymbolPrimitive**(`node`): `void`

Defined in: src/visitor.ts:258

#### Parameters

##### node

[`SymbolPrimitive`](../../index/classes/SymbolPrimitive.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitSymbolPrimitive`](../interfaces/StrictVisitor.md#visitsymbolprimitive)

***

### visitTry()

> **visitTry**(`node`): `void`

Defined in: src/visitor.ts:441

#### Parameters

##### node

[`Try`](../../index/classes/Try.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTry`](../interfaces/StrictVisitor.md#visittry)

***

### visitTupleExpr()

> **visitTupleExpr**(`node`): `void`

Defined in: src/visitor.ts:304

#### Parameters

##### node

[`TupleExpression`](../../index/classes/TupleExpression.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTupleExpr`](../interfaces/StrictVisitor.md#visittupleexpr)

***

### visitTuplePattern()

> **visitTuplePattern**(`node`): `void`

Defined in: src/visitor.ts:546

#### Parameters

##### node

[`TuplePattern`](../../index/classes/TuplePattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTuplePattern`](../interfaces/StrictVisitor.md#visittuplepattern)

***

### visitTupleType()

> **visitTupleType**(`node`): `void`

Defined in: src/visitor.ts:584

#### Parameters

##### node

[`TupleType`](../../index/classes/TupleType.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTupleType`](../interfaces/StrictVisitor.md#visittupletype)

***

### visitTypeAlias()

> **visitTypeAlias**(`node`): `void`

Defined in: src/visitor.ts:599

#### Parameters

##### node

[`TypeAlias`](../../index/classes/TypeAlias.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTypeAlias`](../interfaces/StrictVisitor.md#visittypealias)

***

### visitTypeApplication()

> **visitTypeApplication**(`node`): `void`

Defined in: src/visitor.ts:577

#### Parameters

##### node

[`TypeApplication`](../../index/classes/TypeApplication.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTypeApplication`](../interfaces/StrictVisitor.md#visittypeapplication)

***

### visitTypeCast()

> **visitTypeCast**(`node`): `void`

Defined in: src/visitor.ts:607

#### Parameters

##### node

[`TypeCast`](../../index/classes/TypeCast.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTypeCast`](../interfaces/StrictVisitor.md#visittypecast)

***

### visitTypeSignature()

> **visitTypeSignature**(`node`): `void`

Defined in: src/visitor.ts:603

#### Parameters

##### node

[`TypeSignature`](../../index/classes/TypeSignature.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTypeSignature`](../interfaces/StrictVisitor.md#visittypesignature)

***

### visitTypeVar()

> **visitTypeVar**(`node`): `void`

Defined in: src/visitor.ts:574

#### Parameters

##### node

[`TypeVar`](../../index/classes/TypeVar.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitTypeVar`](../interfaces/StrictVisitor.md#visittypevar)

***

### visitUnguardedBody()

> **visitUnguardedBody**(`node`): `void`

Defined in: src/visitor.ts:417

#### Parameters

##### node

[`UnguardedBody`](../../index/classes/UnguardedBody.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitUnguardedBody`](../interfaces/StrictVisitor.md#visitunguardedbody)

***

### visitUnifyOperation()

> **visitUnifyOperation**(`node`): `void`

Defined in: src/visitor.ts:296

#### Parameters

##### node

[`UnifyOperation`](../../index/classes/UnifyOperation.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitUnifyOperation`](../interfaces/StrictVisitor.md#visitunifyoperation)

***

### visitUnionPattern()

> **visitUnionPattern**(`node`): `void`

Defined in: src/visitor.ts:561

#### Parameters

##### node

[`UnionPattern`](../../index/classes/UnionPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitUnionPattern`](../interfaces/StrictVisitor.md#visitunionpattern)

***

### visitVariable()

> **visitVariable**(`node`): `void`

Defined in: src/visitor.ts:466

#### Parameters

##### node

[`Variable`](../../index/classes/Variable.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitVariable`](../interfaces/StrictVisitor.md#visitvariable)

***

### visitVariablePattern()

> **visitVariablePattern**(`node`): `void`

Defined in: src/visitor.ts:536

#### Parameters

##### node

[`VariablePattern`](../../index/classes/VariablePattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitVariablePattern`](../interfaces/StrictVisitor.md#visitvariablepattern)

***

### visitWhile()

> **visitWhile**(`node`): `void`

Defined in: src/visitor.ts:487

#### Parameters

##### node

[`While`](../../index/classes/While.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitWhile`](../interfaces/StrictVisitor.md#visitwhile)

***

### visitWildcardPattern()

> **visitWildcardPattern**(`node`): `void`

Defined in: src/visitor.ts:560

#### Parameters

##### node

[`WildcardPattern`](../../index/classes/WildcardPattern.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitWildcardPattern`](../interfaces/StrictVisitor.md#visitwildcardpattern)

***

### visitYield()

> **visitYield**(`node`): `void`

Defined in: src/visitor.ts:389

#### Parameters

##### node

[`Yield`](../../index/classes/Yield.md)

#### Returns

`void`

#### Implementation of

[`StrictVisitor`](../interfaces/StrictVisitor.md).[`visitYield`](../interfaces/StrictVisitor.md#visityield)
