[yukigo-core](../../index.md) / [visitor](../index.md) / StrictVisitor

# Interface: StrictVisitor\<TReturn\>

Defined in: src/visitor.ts:119

## Type Parameters

### TReturn

`TReturn`

## Methods

### visit()

> **visit**(`node`): `TReturn`

Defined in: src/visitor.ts:226

#### Parameters

##### node

[`ASTNode`](../../index/classes/ASTNode.md)

#### Returns

`TReturn`

***

### visitApplication()

> **visitApplication**(`node`): `TReturn`

Defined in: src/visitor.ts:152

#### Parameters

##### node

[`Application`](../../index/classes/Application.md)

#### Returns

`TReturn`

***

### visitApplicationPattern()

> **visitApplicationPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:205

#### Parameters

##### node

[`ApplicationPattern`](../../index/classes/ApplicationPattern.md)

#### Returns

`TReturn`

***

### visitArithmeticBinaryOperation()

> **visitArithmeticBinaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:131

#### Parameters

##### node

[`ArithmeticBinaryOperation`](../../index/classes/ArithmeticBinaryOperation.md)

#### Returns

`TReturn`

***

### visitArithmeticUnaryOperation()

> **visitArithmeticUnaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:130

#### Parameters

##### node

[`ArithmeticUnaryOperation`](../../index/classes/ArithmeticUnaryOperation.md)

#### Returns

`TReturn`

***

### visitAsPattern()

> **visitAsPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:209

#### Parameters

##### node

[`AsPattern`](../../index/classes/AsPattern.md)

#### Returns

`TReturn`

***

### visitAssignment()

> **visitAssignment**(`node`): `TReturn`

Defined in: src/visitor.ts:187

#### Parameters

##### node

[`Assignment`](../../index/classes/Assignment.md)

#### Returns

`TReturn`

***

### visitAssignOperation()

> **visitAssignOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:141

#### Parameters

##### node

[`AssignOperation`](../../index/classes/AssignOperation.md)

#### Returns

`TReturn`

***

### visitAttribute()

> **visitAttribute**(`node`): `TReturn`

Defined in: src/visitor.ts:198

#### Parameters

##### node

[`Attribute`](../../index/classes/Attribute.md)

#### Returns

`TReturn`

***

### visitBitwiseBinaryOperation()

> **visitBitwiseBinaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:137

#### Parameters

##### node

[`BitwiseBinaryOperation`](../../index/classes/BitwiseBinaryOperation.md)

#### Returns

`TReturn`

***

### visitBitwiseUnaryOperation()

> **visitBitwiseUnaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:138

#### Parameters

##### node

[`BitwiseUnaryOperation`](../../index/classes/BitwiseUnaryOperation.md)

#### Returns

`TReturn`

***

### visitBooleanPrimitive()

> **visitBooleanPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:123

#### Parameters

##### node

[`BooleanPrimitive`](../../index/classes/BooleanPrimitive.md)

#### Returns

`TReturn`

***

### visitBreak()

> **visitBreak**(`node`): `TReturn`

Defined in: src/visitor.ts:184

#### Parameters

##### node

[`Break`](../../index/classes/Break.md)

#### Returns

`TReturn`

***

### visitCall()

> **visitCall**(`node`): `TReturn`

Defined in: src/visitor.ts:148

#### Parameters

##### node

[`Call`](../../index/classes/Call.md)

#### Returns

`TReturn`

***

### visitCase()

> **visitCase**(`node`): `TReturn`

Defined in: src/visitor.ts:178

#### Parameters

##### node

[`Case`](../../index/classes/Case.md)

#### Returns

`TReturn`

***

### visitCatch()

> **visitCatch**(`node`): `TReturn`

Defined in: src/visitor.ts:180

#### Parameters

##### node

[`Catch`](../../index/classes/Catch.md)

#### Returns

`TReturn`

***

### visitCharPrimitive()

> **visitCharPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:128

#### Parameters

##### node

[`CharPrimitive`](../../index/classes/CharPrimitive.md)

#### Returns

`TReturn`

***

### visitClass()

> **visitClass**(`node`): `TReturn`

Defined in: src/visitor.ts:200

#### Parameters

##### node

[`Class`](../../index/classes/Class.md)

#### Returns

`TReturn`

***

### visitComparisonOperation()

> **visitComparisonOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:134

#### Parameters

##### node

[`ComparisonOperation`](../../index/classes/ComparisonOperation.md)

#### Returns

`TReturn`

***

### visitCompositionExpression()

> **visitCompositionExpression**(`node`): `TReturn`

Defined in: src/visitor.ts:150

#### Parameters

##### node

[`CompositionExpression`](../../index/classes/CompositionExpression.md)

#### Returns

`TReturn`

***

### visitConsExpr()

> **visitConsExpr**(`node`): `TReturn`

Defined in: src/visitor.ts:146

#### Parameters

##### node

[`ConsExpression`](../../index/classes/ConsExpression.md)

#### Returns

`TReturn`

***

### visitConsPattern()

> **visitConsPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:213

#### Parameters

##### node

[`ConsPattern`](../../index/classes/ConsPattern.md)

#### Returns

`TReturn`

***

### visitConstrainedType()

> **visitConstrainedType**(`node`): `TReturn`

Defined in: src/visitor.ts:222

#### Parameters

##### node

[`ConstrainedType`](../../index/classes/ConstrainedType.md)

#### Returns

`TReturn`

***

### visitConstraint()

> **visitConstraint**(`node`): `TReturn`

Defined in: src/visitor.ts:220

#### Parameters

##### node

[`Constraint`](../../index/classes/Constraint.md)

#### Returns

`TReturn`

***

### visitConstructor()

> **visitConstructor**(`node`): `TReturn`

Defined in: src/visitor.ts:172

#### Parameters

##### node

[`Constructor`](../../index/classes/Constructor.md)

#### Returns

`TReturn`

***

### visitConstructorPattern()

> **visitConstructorPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:212

#### Parameters

##### node

[`ConstructorPattern`](../../index/classes/ConstructorPattern.md)

#### Returns

`TReturn`

***

### visitContinue()

> **visitContinue**(`node`): `TReturn`

Defined in: src/visitor.ts:185

#### Parameters

##### node

[`Continue`](../../index/classes/Continue.md)

#### Returns

`TReturn`

***

### visitDataExpr()

> **visitDataExpr**(`node`): `TReturn`

Defined in: src/visitor.ts:145

#### Parameters

##### node

[`DataExpression`](../../index/classes/DataExpression.md)

#### Returns

`TReturn`

***

### visitEntryPoint()

> **visitEntryPoint**(`node`): `TReturn`

Defined in: src/visitor.ts:188

#### Parameters

##### node

[`EntryPoint`](../../index/classes/EntryPoint.md)

#### Returns

`TReturn`

***

### visitEnumeration()

> **visitEnumeration**(`node`): `TReturn`

Defined in: src/visitor.ts:190

#### Parameters

##### node

[`Enumeration`](../../index/classes/Enumeration.md)

#### Returns

`TReturn`

***

### visitEquation()

> **visitEquation**(`node`): `TReturn`

Defined in: src/visitor.ts:176

#### Parameters

##### node

[`Equation`](../../index/classes/Equation.md)

#### Returns

`TReturn`

***

### visitExist()

> **visitExist**(`node`): `TReturn`

Defined in: src/visitor.ts:153

#### Parameters

##### node

[`Exist`](../../index/classes/Exist.md)

#### Returns

`TReturn`

***

### visitFact()

> **visitFact**(`node`): `TReturn`

Defined in: src/visitor.ts:195

#### Parameters

##### node

[`Fact`](../../index/classes/Fact.md)

#### Returns

`TReturn`

***

### visitField()

> **visitField**(`node`): `TReturn`

Defined in: src/visitor.ts:171

#### Parameters

##### node

[`Field`](../../index/classes/Field.md)

#### Returns

`TReturn`

***

### visitFieldExpr()

> **visitFieldExpr**(`node`): `TReturn`

Defined in: src/visitor.ts:144

#### Parameters

##### node

[`FieldExpression`](../../index/classes/FieldExpression.md)

#### Returns

`TReturn`

***

### visitFindall()

> **visitFindall**(`node`): `TReturn`

Defined in: src/visitor.ts:155

#### Parameters

##### node

[`Findall`](../../index/classes/Findall.md)

#### Returns

`TReturn`

***

### visitFor()

> **visitFor**(`node`): `TReturn`

Defined in: src/visitor.ts:183

#### Parameters

##### node

[`For`](../../index/classes/For.md)

#### Returns

`TReturn`

***

### visitForall()

> **visitForall**(`node`): `TReturn`

Defined in: src/visitor.ts:156

#### Parameters

##### node

[`Forall`](../../index/classes/Forall.md)

#### Returns

`TReturn`

***

### visitForLoop()

> **visitForLoop**(`node`): `TReturn`

Defined in: src/visitor.ts:193

#### Parameters

##### node

[`ForLoop`](../../index/classes/ForLoop.md)

#### Returns

`TReturn`

***

### visitFunction()

> **visitFunction**(`node`): `TReturn`

Defined in: src/visitor.ts:170

#### Parameters

##### node

[`Function`](../../index/classes/Function.md)

#### Returns

`TReturn`

***

### visitFunctorPattern()

> **visitFunctorPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:208

#### Parameters

##### node

[`FunctorPattern`](../../index/classes/FunctorPattern.md)

#### Returns

`TReturn`

***

### visitGenerator()

> **visitGenerator**(`node`): `TReturn`

Defined in: src/visitor.ts:164

#### Parameters

##### node

[`Generator`](../../index/classes/Generator.md)

#### Returns

`TReturn`

***

### visitGoal()

> **visitGoal**(`node`): `TReturn`

Defined in: src/visitor.ts:157

#### Parameters

##### node

[`Goal`](../../index/classes/Goal.md)

#### Returns

`TReturn`

***

### visitGuardedBody()

> **visitGuardedBody**(`node`): `TReturn`

Defined in: src/visitor.ts:175

#### Parameters

##### node

[`GuardedBody`](../../index/classes/GuardedBody.md)

#### Returns

`TReturn`

***

### visitIf()

> **visitIf**(`node`): `TReturn`

Defined in: src/visitor.ts:168

#### Parameters

##### node

[`If`](../../index/classes/If.md)

#### Returns

`TReturn`

***

### visitImplement()

> **visitImplement**(`node`): `TReturn`

Defined in: src/visitor.ts:160

#### Parameters

##### node

[`Implement`](../../index/classes/Implement.md)

#### Returns

`TReturn`

***

### visitInclude()

> **visitInclude**(`node`): `TReturn`

Defined in: src/visitor.ts:161

#### Parameters

##### node

[`Include`](../../index/classes/Include.md)

#### Returns

`TReturn`

***

### visitInterface()

> **visitInterface**(`node`): `TReturn`

Defined in: src/visitor.ts:201

#### Parameters

##### node

[`Interface`](../../index/classes/Interface.md)

#### Returns

`TReturn`

***

### visitLambda()

> **visitLambda**(`node`): `TReturn`

Defined in: src/visitor.ts:151

#### Parameters

##### node

[`Lambda`](../../index/classes/Lambda.md)

#### Returns

`TReturn`

***

### visitLetInExpr()

> **visitLetInExpr**(`node`): `TReturn`

Defined in: src/visitor.ts:147

#### Parameters

##### node

[`LetInExpression`](../../index/classes/LetInExpression.md)

#### Returns

`TReturn`

***

### visitListBinaryOperation()

> **visitListBinaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:133

#### Parameters

##### node

[`ListBinaryOperation`](../../index/classes/ListBinaryOperation.md)

#### Returns

`TReturn`

***

### visitListComprehension()

> **visitListComprehension**(`node`): `TReturn`

Defined in: src/visitor.ts:163

#### Parameters

##### node

[`ListComprehension`](../../index/classes/ListComprehension.md)

#### Returns

`TReturn`

***

### visitListPattern()

> **visitListPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:207

#### Parameters

##### node

[`ListPattern`](../../index/classes/ListPattern.md)

#### Returns

`TReturn`

***

### visitListPrimitive()

> **visitListPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:125

#### Parameters

##### node

[`ListPrimitive`](../../index/classes/ListPrimitive.md)

#### Returns

`TReturn`

***

### visitListType()

> **visitListType**(`node`): `TReturn`

Defined in: src/visitor.ts:218

#### Parameters

##### node

[`ListType`](../../index/classes/ListType.md)

#### Returns

`TReturn`

***

### visitListUnaryOperation()

> **visitListUnaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:132

#### Parameters

##### node

[`ListUnaryOperation`](../../index/classes/ListUnaryOperation.md)

#### Returns

`TReturn`

***

### visitLiteralPattern()

> **visitLiteralPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:204

#### Parameters

##### node

[`LiteralPattern`](../../index/classes/LiteralPattern.md)

#### Returns

`TReturn`

***

### visitLogicalBinaryOperation()

> **visitLogicalBinaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:135

#### Parameters

##### node

[`LogicalBinaryOperation`](../../index/classes/LogicalBinaryOperation.md)

#### Returns

`TReturn`

***

### visitLogicalUnaryOperation()

> **visitLogicalUnaryOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:136

#### Parameters

##### node

[`LogicalUnaryOperation`](../../index/classes/LogicalUnaryOperation.md)

#### Returns

`TReturn`

***

### visitMethod()

> **visitMethod**(`node`): `TReturn`

Defined in: src/visitor.ts:197

#### Parameters

##### node

[`Method`](../../index/classes/Method.md)

#### Returns

`TReturn`

***

### visitNew()

> **visitNew**(`node`): `TReturn`

Defined in: src/visitor.ts:159

#### Parameters

##### node

[`New`](../../index/classes/New.md)

#### Returns

`TReturn`

***

### visitNilPrimitive()

> **visitNilPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:126

#### Parameters

##### node

[`NilPrimitive`](../../index/classes/NilPrimitive.md)

#### Returns

`TReturn`

***

### visitNot()

> **visitNot**(`node`): `TReturn`

Defined in: src/visitor.ts:154

#### Parameters

##### node

[`Not`](../../index/classes/Not.md)

#### Returns

`TReturn`

***

### visitNumberPrimitive()

> **visitNumberPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:122

#### Parameters

##### node

[`NumberPrimitive`](../../index/classes/NumberPrimitive.md)

#### Returns

`TReturn`

***

### visitObject()

> **visitObject**(`node`): `TReturn`

Defined in: src/visitor.ts:199

#### Parameters

##### node

[`Object`](../../index/classes/Object.md)

#### Returns

`TReturn`

***

### visitOtherwise()

> **visitOtherwise**(`node`): `TReturn`

Defined in: src/visitor.ts:149

#### Parameters

##### node

[`Otherwise`](../../index/classes/Otherwise.md)

#### Returns

`TReturn`

***

### visitParameterizedType()

> **visitParameterizedType**(`node`): `TReturn`

Defined in: src/visitor.ts:221

#### Parameters

##### node

[`ParameterizedType`](../../index/classes/ParameterizedType.md)

#### Returns

`TReturn`

***

### visitPrint()

> **visitPrint**(`node`): `TReturn`

Defined in: src/visitor.ts:182

#### Parameters

##### node

[`Print`](../../index/classes/Print.md)

#### Returns

`TReturn`

***

### visitProcedure()

> **visitProcedure**(`node`): `TReturn`

Defined in: src/visitor.ts:189

#### Parameters

##### node

[`Procedure`](../../index/classes/Procedure.md)

#### Returns

`TReturn`

***

### visitQuery()

> **visitQuery**(`node`): `TReturn`

Defined in: src/visitor.ts:196

#### Parameters

##### node

[`Query`](../../index/classes/Query.md)

#### Returns

`TReturn`

***

### visitRaise()

> **visitRaise**(`node`): `TReturn`

Defined in: src/visitor.ts:181

#### Parameters

##### node

[`Raise`](../../index/classes/Raise.md)

#### Returns

`TReturn`

***

### visitRangeExpression()

> **visitRangeExpression**(`node`): `TReturn`

Defined in: src/visitor.ts:165

#### Parameters

##### node

[`RangeExpression`](../../index/classes/RangeExpression.md)

#### Returns

`TReturn`

***

### visitRecord()

> **visitRecord**(`node`): `TReturn`

Defined in: src/visitor.ts:173

#### Parameters

##### node

[`Record`](../../index/classes/Record.md)

#### Returns

`TReturn`

***

### visitRepeat()

> **visitRepeat**(`node`): `TReturn`

Defined in: src/visitor.ts:192

#### Parameters

##### node

[`Repeat`](../../index/classes/Repeat.md)

#### Returns

`TReturn`

***

### visitReturn()

> **visitReturn**(`node`): `TReturn`

Defined in: src/visitor.ts:169

#### Parameters

##### node

[`Return`](../../index/classes/Return.md)

#### Returns

`TReturn`

***

### visitRule()

> **visitRule**(`node`): `TReturn`

Defined in: src/visitor.ts:194

#### Parameters

##### node

[`Rule`](../../index/classes/Rule.md)

#### Returns

`TReturn`

***

### visitSelf()

> **visitSelf**(`node`): `TReturn`

Defined in: src/visitor.ts:162

#### Parameters

##### node

[`Self`](../../index/classes/Self.md)

#### Returns

`TReturn`

***

### visitSend()

> **visitSend**(`node`): `TReturn`

Defined in: src/visitor.ts:158

#### Parameters

##### node

[`Send`](../../index/classes/Send.md)

#### Returns

`TReturn`

***

### visitSequence()

> **visitSequence**(`node`): `TReturn`

Defined in: src/visitor.ts:120

#### Parameters

##### node

[`Sequence`](../../index/classes/Sequence.md)

#### Returns

`TReturn`

***

### visitSimpleType()

> **visitSimpleType**(`node`): `TReturn`

Defined in: src/visitor.ts:215

#### Parameters

##### node

[`SimpleType`](../../index/classes/SimpleType.md)

#### Returns

`TReturn`

***

### visitStringOperation()

> **visitStringOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:139

#### Parameters

##### node

[`StringOperation`](../../index/classes/StringOperation.md)

#### Returns

`TReturn`

***

### visitStringPrimitive()

> **visitStringPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:124

#### Parameters

##### node

[`StringPrimitive`](../../index/classes/StringPrimitive.md)

#### Returns

`TReturn`

***

### visitSwitch()

> **visitSwitch**(`node`): `TReturn`

Defined in: src/visitor.ts:177

#### Parameters

##### node

[`Switch`](../../index/classes/Switch.md)

#### Returns

`TReturn`

***

### visitSymbolPrimitive()

> **visitSymbolPrimitive**(`node`): `TReturn`

Defined in: src/visitor.ts:127

#### Parameters

##### node

[`SymbolPrimitive`](../../index/classes/SymbolPrimitive.md)

#### Returns

`TReturn`

***

### visitTry()

> **visitTry**(`node`): `TReturn`

Defined in: src/visitor.ts:179

#### Parameters

##### node

[`Try`](../../index/classes/Try.md)

#### Returns

`TReturn`

***

### visitTupleExpr()

> **visitTupleExpr**(`node`): `TReturn`

Defined in: src/visitor.ts:143

#### Parameters

##### node

[`TupleExpression`](../../index/classes/TupleExpression.md)

#### Returns

`TReturn`

***

### visitTuplePattern()

> **visitTuplePattern**(`node`): `TReturn`

Defined in: src/visitor.ts:206

#### Parameters

##### node

[`TuplePattern`](../../index/classes/TuplePattern.md)

#### Returns

`TReturn`

***

### visitTupleType()

> **visitTupleType**(`node`): `TReturn`

Defined in: src/visitor.ts:219

#### Parameters

##### node

[`TupleType`](../../index/classes/TupleType.md)

#### Returns

`TReturn`

***

### visitTypeAlias()

> **visitTypeAlias**(`node`): `TReturn`

Defined in: src/visitor.ts:223

#### Parameters

##### node

[`TypeAlias`](../../index/classes/TypeAlias.md)

#### Returns

`TReturn`

***

### visitTypeApplication()

> **visitTypeApplication**(`node`): `TReturn`

Defined in: src/visitor.ts:217

#### Parameters

##### node

[`TypeApplication`](../../index/classes/TypeApplication.md)

#### Returns

`TReturn`

***

### visitTypeCast()

> **visitTypeCast**(`node`): `TReturn`

Defined in: src/visitor.ts:225

#### Parameters

##### node

[`TypeCast`](../../index/classes/TypeCast.md)

#### Returns

`TReturn`

***

### visitTypeSignature()

> **visitTypeSignature**(`node`): `TReturn`

Defined in: src/visitor.ts:224

#### Parameters

##### node

[`TypeSignature`](../../index/classes/TypeSignature.md)

#### Returns

`TReturn`

***

### visitTypeVar()

> **visitTypeVar**(`node`): `TReturn`

Defined in: src/visitor.ts:216

#### Parameters

##### node

[`TypeVar`](../../index/classes/TypeVar.md)

#### Returns

`TReturn`

***

### visitUnguardedBody()

> **visitUnguardedBody**(`node`): `TReturn`

Defined in: src/visitor.ts:174

#### Parameters

##### node

[`UnguardedBody`](../../index/classes/UnguardedBody.md)

#### Returns

`TReturn`

***

### visitUnifyOperation()

> **visitUnifyOperation**(`node`): `TReturn`

Defined in: src/visitor.ts:140

#### Parameters

##### node

[`UnifyOperation`](../../index/classes/UnifyOperation.md)

#### Returns

`TReturn`

***

### visitUnionPattern()

> **visitUnionPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:211

#### Parameters

##### node

[`UnionPattern`](../../index/classes/UnionPattern.md)

#### Returns

`TReturn`

***

### visitVariable()

> **visitVariable**(`node`): `TReturn`

Defined in: src/visitor.ts:186

#### Parameters

##### node

[`Variable`](../../index/classes/Variable.md)

#### Returns

`TReturn`

***

### visitVariablePattern()

> **visitVariablePattern**(`node`): `TReturn`

Defined in: src/visitor.ts:203

#### Parameters

##### node

[`VariablePattern`](../../index/classes/VariablePattern.md)

#### Returns

`TReturn`

***

### visitWhile()

> **visitWhile**(`node`): `TReturn`

Defined in: src/visitor.ts:191

#### Parameters

##### node

[`While`](../../index/classes/While.md)

#### Returns

`TReturn`

***

### visitWildcardPattern()

> **visitWildcardPattern**(`node`): `TReturn`

Defined in: src/visitor.ts:210

#### Parameters

##### node

[`WildcardPattern`](../../index/classes/WildcardPattern.md)

#### Returns

`TReturn`

***

### visitYield()

> **visitYield**(`node`): `TReturn`

Defined in: src/visitor.ts:167

#### Parameters

##### node

[`Yield`](../../index/classes/Yield.md)

#### Returns

`TReturn`
