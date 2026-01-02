import {
  Sequence,
  NumberPrimitive,
  BooleanPrimitive,
  StringPrimitive,
  ListPrimitive,
  NilPrimitive,
  SymbolPrimitive,
  CharPrimitive,
  TupleExpression,
  FieldExpression,
  DataExpression,
  ConsExpression,
  LetInExpression,
  Otherwise,
  ListComprehension,
  RangeExpression,
  If,
  Return,
  Field,
  Constructor,
  UnguardedBody,
  GuardedBody,
  Equation,
  Switch,
  Try,
  Raise,
  Print,
  Function,
  Generator,
  For,
  Break,
  Continue,
  Variable,
  Assignment,
  ASTNode,
  Record,
  Case,
  Catch,
  Input,
} from "./globals/generics.js";
import {
  ArithmeticUnaryOperation,
  ArithmeticBinaryOperation,
  ListUnaryOperation,
  ListBinaryOperation,
  ComparisonOperation,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  StringOperation,
  UnifyOperation,
  AssignOperation,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
} from "./globals/operators.js";
import {
  VariablePattern,
  LiteralPattern,
  ApplicationPattern,
  TuplePattern,
  ListPattern,
  FunctorPattern,
  AsPattern,
  WildcardPattern,
  UnionPattern,
  ConstructorPattern,
  ConsPattern,
} from "./globals/patterns.js";
import {
  SimpleType,
  TypeVar,
  TypeApplication,
  ListType,
  TupleType,
  Constraint,
  ParameterizedType,
  ConstrainedType,
  TypeAlias,
  TypeSignature,
  TypeCast,
} from "./globals/types.js";
import {
  AlterDatabase,
  AlterTable,
  Commit,
  CreateDatabase,
  CreateIndex,
  CreateTable,
  Delete,
  DropIndex,
  DropTable,
  InsertInto,
  Rollback,
  Select,
  Update,
} from "./paradigms/data.js";
import {
  CompositionExpression,
  Lambda,
  Application,
  Yield,
} from "./paradigms/functional.js";
import {
  EntryPoint,
  Procedure,
  Enumeration,
  While,
  Repeat,
  ForLoop,
  Structure,
} from "./paradigms/imperative.js";
import {
  Call,
  Exist,
  Not,
  Findall,
  Forall,
  Goal,
  Rule,
  Fact,
  Query,
} from "./paradigms/logic.js";
import {
  Send,
  New,
  Implement,
  Self,
  Method,
  Attribute,
  Class,
  Interface,
  Object,
  Super,
  PrimitiveMethod,
} from "./paradigms/object.js";

export interface StrictVisitor<TReturn> {
  visitSequence(node: Sequence): TReturn;
  // Primitives
  visitNumberPrimitive(node: NumberPrimitive): TReturn;
  visitBooleanPrimitive(node: BooleanPrimitive): TReturn;
  visitStringPrimitive(node: StringPrimitive): TReturn;
  visitListPrimitive(node: ListPrimitive): TReturn;
  visitNilPrimitive(node: NilPrimitive): TReturn;
  visitSymbolPrimitive(node: SymbolPrimitive): TReturn;
  visitCharPrimitive(node: CharPrimitive): TReturn;
  // Operations
  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): TReturn;
  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): TReturn;
  visitListUnaryOperation(node: ListUnaryOperation): TReturn;
  visitListBinaryOperation(node: ListBinaryOperation): TReturn;
  visitComparisonOperation(node: ComparisonOperation): TReturn;
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): TReturn;
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): TReturn;
  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): TReturn;
  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): TReturn;
  visitStringOperation(node: StringOperation): TReturn;
  visitUnifyOperation(node: UnifyOperation): TReturn;
  visitAssignOperation(node: AssignOperation): TReturn;
  // Expressions
  visitTupleExpr(node: TupleExpression): TReturn;
  visitFieldExpr(node: FieldExpression): TReturn;
  visitDataExpr(node: DataExpression): TReturn;
  visitConsExpr(node: ConsExpression): TReturn;
  visitLetInExpr(node: LetInExpression): TReturn;
  visitCall(node: Call): TReturn;
  visitOtherwise(node: Otherwise): TReturn;
  visitCompositionExpression(node: CompositionExpression): TReturn;
  visitLambda(node: Lambda): TReturn;
  visitApplication(node: Application): TReturn;
  visitExist(node: Exist): TReturn;
  visitNot(node: Not): TReturn;
  visitFindall(node: Findall): TReturn;
  visitForall(node: Forall): TReturn;
  visitGoal(node: Goal): TReturn;
  visitSend(node: Send): TReturn;
  visitNew(node: New): TReturn;
  visitImplement(node: Implement): TReturn;
  visitListComprehension(node: ListComprehension): TReturn;
  visitGenerator(node: Generator): TReturn;
  visitRangeExpression(node: RangeExpression): TReturn;
  // Statements
  visitSelf(node: Self): TReturn;
  visitSuper(node: Super): TReturn;
  visitYield(node: Yield): TReturn;
  visitIf(node: If): TReturn;
  visitReturn(node: Return): TReturn;
  visitFunction(node: Function): TReturn;
  visitField(node: Field): TReturn;
  visitConstructor(node: Constructor): TReturn;
  visitRecord(node: Record): TReturn;
  visitUnguardedBody(node: UnguardedBody): TReturn;
  visitGuardedBody(node: GuardedBody): TReturn;
  visitEquation(node: Equation): TReturn;
  visitSwitch(node: Switch): TReturn;
  visitCase(node: Case): TReturn;
  visitTry(node: Try): TReturn;
  visitCatch(node: Catch): TReturn;
  visitRaise(node: Raise): TReturn;
  visitPrint(node: Print): TReturn;
  visitInput(node: Input): TReturn;
  visitFor(node: For): TReturn;
  visitBreak(node: Break): TReturn;
  visitContinue(node: Continue): TReturn;
  visitVariable(node: Variable): TReturn;
  visitAssignment(node: Assignment): TReturn;
  visitStructure(node: Structure): TReturn;
  visitEntryPoint(node: EntryPoint): TReturn;
  visitProcedure(node: Procedure): TReturn;
  visitEnumeration(node: Enumeration): TReturn;
  visitWhile(node: While): TReturn;
  visitRepeat(node: Repeat): TReturn;
  visitForLoop(node: ForLoop): TReturn;
  visitRule(node: Rule): TReturn;
  visitFact(node: Fact): TReturn;
  visitQuery(node: Query): TReturn;
  visitMethod(node: Method): TReturn;
  visitPrimitiveMethod(node: PrimitiveMethod): TReturn;
  visitAttribute(node: Attribute): TReturn;
  visitObject(node: Object): TReturn;
  visitClass(node: Class): TReturn;
  visitInterface(node: Interface): TReturn;
  // Patterns
  visitVariablePattern(node: VariablePattern): TReturn;
  visitLiteralPattern(node: LiteralPattern): TReturn;
  visitApplicationPattern(node: ApplicationPattern): TReturn;
  visitTuplePattern(node: TuplePattern): TReturn;
  visitListPattern(node: ListPattern): TReturn;
  visitFunctorPattern(node: FunctorPattern): TReturn;
  visitAsPattern(node: AsPattern): TReturn;
  visitWildcardPattern(node: WildcardPattern): TReturn;
  visitUnionPattern(node: UnionPattern): TReturn;
  visitConstructorPattern(node: ConstructorPattern): TReturn;
  visitConsPattern(node: ConsPattern): TReturn;
  // Type
  visitSimpleType(node: SimpleType): TReturn;
  visitTypeVar(node: TypeVar): TReturn;
  visitTypeApplication(node: TypeApplication): TReturn;
  visitListType(node: ListType): TReturn;
  visitTupleType(node: TupleType): TReturn;
  visitConstraint(node: Constraint): TReturn;
  visitParameterizedType(node: ParameterizedType): TReturn;
  visitConstrainedType(node: ConstrainedType): TReturn;
  visitTypeAlias(node: TypeAlias): TReturn;
  visitTypeSignature(node: TypeSignature): TReturn;
  visitTypeCast(node: TypeCast): TReturn;
  // Data Manipulation Nodes
  visitSelect(node: Select): TReturn;
  visitUpdate(node: Update): TReturn;
  visitDelete(node: Delete): TReturn;
  visitInsertInto(node: InsertInto): TReturn;
  visitCreateDatabase(node: CreateDatabase): TReturn;
  visitAlterDatabase(node: AlterDatabase): TReturn;
  visitCreateTable(node: CreateTable): TReturn;
  visitAlterTable(node: AlterTable): TReturn;
  visitDropTable(node: DropTable): TReturn;
  visitCreateIndex(node: CreateIndex): TReturn;
  visitDropIndex(node: DropIndex): TReturn;
  visitCommit(node: Commit): TReturn;
  visitRollback(node: Rollback): TReturn;
  visit(node: ASTNode): TReturn;
}

export type Visitor<R> = Partial<StrictVisitor<R>>;

export class StopTraversalException extends Error {
  constructor() {
    super("Inspection found, aborting traversal.");
  }
}

export class TraverseVisitor implements StrictVisitor<void> {
  visitSelect(node: Select): void {
    this.traverseCollection(node.columns);
    node.where?.accept(this);
  }
  visitUpdate(node: Update): void {
    this.traverseCollection(node.assignments);
    node.where?.accept(this);
  }
  visitDelete(node: Delete): void {
    node.where?.accept(this);
  }
  visitInsertInto(node: InsertInto): void {
    node.values.forEach((val) => this.traverseCollection(val));
  }
  visitCreateDatabase(node: CreateDatabase): void {}
  visitAlterDatabase(node: AlterDatabase): void {}
  visitCreateTable(node: CreateTable): void {
    this.traverseCollection(node.columns);
  }
  visitAlterTable(node: AlterTable): void {
    node.action.accept(this);
  }
  visitDropTable(node: DropTable): void {}
  visitCreateIndex(node: CreateIndex): void {}
  visitDropIndex(node: DropIndex): void {}
  visitCommit(node: Commit): void {
    node.name.accept(this);
  }
  visitRollback(node: Rollback): void {
    node.name.accept(this);
  }
  protected traverseCollection(nodes: ASTNode[]): void {
    for (const node of nodes) {
      try {
        node.accept(this);
      } catch (e) {
        throw e;
      }
    }
  }

  visitSequence(node: Sequence): void {
    this.traverseCollection(node.statements);
  }
  visitStructure(node: Structure): void {
    this.traverseCollection(node.elements);
  }
  visitNumberPrimitive(node: NumberPrimitive): void {}
  visitBooleanPrimitive(node: BooleanPrimitive): void {}
  visitStringPrimitive(node: StringPrimitive): void {}
  visitListPrimitive(node: ListPrimitive): void {
    this.traverseCollection(node.elements);
  }
  visitNilPrimitive(node: NilPrimitive): void {}
  visitSymbolPrimitive(node: SymbolPrimitive): void {}
  visitCharPrimitive(node: CharPrimitive): void {}
  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): void {
    node.operand.accept(this);
  }
  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitListUnaryOperation(node: ListUnaryOperation): void {
    node.operand.accept(this);
  }
  visitListBinaryOperation(node: ListBinaryOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitComparisonOperation(node: ComparisonOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): void {
    node.operand.accept(this);
  }
  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): void {
    node.operand.accept(this);
  }
  visitStringOperation(node: StringOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitUnifyOperation(node: UnifyOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitAssignOperation(node: AssignOperation): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitTupleExpr(node: TupleExpression): void {
    this.traverseCollection(node.elements);
  }
  visitFieldExpr(node: FieldExpression): void {
    node.name.accept(this);
    node.expression.accept(this);
  }
  visitDataExpr(node: DataExpression): void {
    node.name.accept(this);
    this.traverseCollection(node.contents);
  }
  visitConsExpr(node: ConsExpression): void {
    node.head.accept(this);
    node.tail.accept(this);
  }
  visitLetInExpr(node: LetInExpression): void {
    node.expression.accept(this);
    node.declarations.accept(this);
  }
  visitCall(node: Call): void {
    node.callee.accept(this);
    this.traverseCollection(node.args);
  }
  visitOtherwise(node: Otherwise): void {}
  visitCompositionExpression(node: CompositionExpression): void {
    node.left.accept(this);
    node.right.accept(this);
  }
  visitLambda(node: Lambda): void {
    node.body.accept(this);
    this.traverseCollection(node.parameters);
  }
  visitApplication(node: Application): void {
    node.functionExpr.accept(this);
    node.parameter.accept(this);
  }
  visitExist(node: Exist): void {
    node.identifier.accept(this);
    this.traverseCollection(node.patterns);
  }
  visitNot(node: Not): void {
    this.traverseCollection(node.expressions);
  }
  visitFindall(node: Findall): void {
    node.template.accept(this);
    node.goal.accept(this);
    node.bag.accept(this);
  }
  visitForall(node: Forall): void {
    node.condition.accept(this);
    node.action.accept(this);
  }
  visitGoal(node: Goal): void {
    node.identifier.accept(this);
    this.traverseCollection(node.args);
  }
  visitSend(node: Send): void {
    node.selector.accept(this);
    node.receiver.accept(this);
    this.traverseCollection(node.args);
  }
  visitNew(node: New): void {
    node.identifier.accept(this);
    this.traverseCollection(node.args);
  }
  visitImplement(node: Implement): void {
    node.identifier.accept(this);
  }
  visitSelf(node: Self): void {}
  visitSuper(node: Super): void {}
  visitListComprehension(node: ListComprehension): void {
    node.projection.accept(this);
    this.traverseCollection(node.generators);
  }
  visitGenerator(node: Generator): void {
    node.variable.accept(this);
    node.expression.accept(this);
  }
  visitRangeExpression(node: RangeExpression): void {
    node.start.accept(this);
    node.step?.accept(this);
    node.end?.accept(this);
  }
  visitYield(node: Yield): void {
    node.expression.accept(this);
  }
  visitIf(node: If): void {
    node.condition.accept(this);
    node.then.accept(this);
    node.elseExpr.accept(this);
  }
  visitReturn(node: Return): void {
    node.body.accept(this);
  }
  visitFunction(node: Function): void {
    node.identifier.accept(this);
    this.traverseCollection(node.equations);
  }
  visitField(node: Field): void {
    node.name?.accept(this);
    node.value.accept(this);
  }
  visitConstructor(node: Constructor): void {
    node.name.accept(this);
    this.traverseCollection(node.fields);
  }
  visitRecord(node: Record): void {
    node.name.accept(this);
    this.traverseCollection(node.contents);
    if (node.deriving) this.traverseCollection(node.deriving);
  }
  visitUnguardedBody(node: UnguardedBody): void {
    node.sequence.accept(this);
  }
  visitGuardedBody(node: GuardedBody): void {
    node.condition.accept(this);
    node.body.accept(this);
  }
  visitEquation(node: Equation): void {
    if (Array.isArray(node.body)) {
      this.traverseCollection(node.body);
    } else {
      node.body.accept(this);
    }
    this.traverseCollection(node.patterns);
    node.returnExpr?.accept(this);
  }
  visitSwitch(node: Switch): void {
    node.value.accept(this);
    this.traverseCollection(node.cases);
  }
  visitCase(node: Case): void {
    node.condition.accept(this);
    node.body.accept(this);
  }
  visitTry(node: Try): void {
    node.body.accept(this);
    this.traverseCollection(node.catchExpr);
    node.finallyExpr.accept(this);
  }
  visitCatch(node: Catch): void {
    node.body.accept(this);
    this.traverseCollection(node.patterns);
  }
  visitRaise(node: Raise): void {
    node.body.accept(this);
  }
  visitPrint(node: Print): void {
    node.expression.accept(this);
  }
  visitInput(node: Input): void {
    node.message.accept(this);
  }
  visitFor(node: For): void {
    node.body.accept(this);
    this.traverseCollection(node.statements);
  }
  visitBreak(node: Break): void {
    node.body.accept(this);
  }
  visitContinue(node: Continue): void {
    node.body.accept(this);
  }
  visitVariable(node: Variable): void {
    node.identifier.accept(this);
    node.expression.accept(this);
    node.variableType?.accept(this);
  }
  visitAssignment(node: Assignment): void {
    node.identifier.accept(this);
    node.expression.accept(this);
  }
  visitEntryPoint(node: EntryPoint): void {
    node.identifier.accept(this);
    node.expression.accept(this);
  }
  visitProcedure(node: Procedure): void {
    node.identifier.accept(this);
    this.traverseCollection(node.equations);
  }
  visitEnumeration(node: Enumeration): void {
    node.identifier.accept(this);
    this.traverseCollection(node.contents);
  }
  visitWhile(node: While): void {
    node.condition.accept(this);
    node.body.accept(this);
  }
  visitRepeat(node: Repeat): void {
    node.body.accept(this);
    node.count.accept(this);
  }
  visitForLoop(node: ForLoop): void {
    node.initialization.accept(this);
    node.condition.accept(this);
    node.update.accept(this);
    node.body.accept(this);
  }
  visitRule(node: Rule): void {
    node.identifier.accept(this);
    this.traverseCollection(node.equations);
  }
  visitFact(node: Fact): void {
    node.identifier.accept(this);
    this.traverseCollection(node.patterns);
  }
  visitQuery(node: Query): void {
    node.expressions.forEach((expr) => expr.accept(this));
  }
  visitMethod(node: Method): void {
    node.identifier.accept(this);
    this.traverseCollection(node.equations);
  }
  visitPrimitiveMethod(node: PrimitiveMethod): void {
    this.traverseCollection(node.equations);
  }
  visitAttribute(node: Attribute): void {
    node.identifier.accept(this);
    node.expression.accept(this);
  }
  visitObject(node: Object): void {
    node.identifier.accept(this);
    node.expression.accept(this);
  }
  visitClass(node: Class): void {
    node.identifier.accept(this);
    node.expression.accept(this);
    node.extendsSymbol?.accept(this);
    node.implementsNode?.accept(this);
  }
  visitInterface(node: Interface): void {
    node.identifier.accept(this);
    this.traverseCollection(node.extendsSymbol);
    node.expression.accept(this);
  }
  visitVariablePattern(node: VariablePattern): void {
    node.name.accept(this);
  }
  visitLiteralPattern(node: LiteralPattern): void {
    node.name.accept(this);
  }
  visitApplicationPattern(node: ApplicationPattern): void {
    node.symbol.accept(this);
    this.traverseCollection(node.args);
  }
  visitTuplePattern(node: TuplePattern): void {
    this.traverseCollection(node.elements);
  }
  visitListPattern(node: ListPattern): void {
    this.traverseCollection(node.elements);
  }
  visitFunctorPattern(node: FunctorPattern): void {
    node.identifier.accept(this);
    this.traverseCollection(node.args);
  }
  visitAsPattern(node: AsPattern): void {
    node.alias.accept(this);
    node.pattern.accept(this);
  }
  visitWildcardPattern(node: WildcardPattern): void {}
  visitUnionPattern(node: UnionPattern): void {
    this.traverseCollection(node.patterns);
  }
  visitConstructorPattern(node: ConstructorPattern): void {
    this.traverseCollection(node.patterns);
  }
  visitConsPattern(node: ConsPattern): void {
    node.head.accept(this);
    node.tail.accept(this);
  }
  visitSimpleType(node: SimpleType): void {
    this.traverseCollection(node.constraints);
  }
  visitTypeVar(node: TypeVar): void {
    this.traverseCollection(node.constraints);
  }
  visitTypeApplication(node: TypeApplication): void {
    node.functionType.accept(this);
    node.argument.accept(this);
  }
  visitListType(node: ListType): void {
    this.traverseCollection(node.constraints);
  }
  visitTupleType(node: TupleType): void {
    this.traverseCollection(node.constraints);
    this.traverseCollection(node.values);
  }
  visitConstraint(node: Constraint): void {
    this.traverseCollection(node.parameters);
  }
  visitParameterizedType(node: ParameterizedType): void {
    this.traverseCollection(node.inputs);
    this.traverseCollection(node.constraints);
    node.returnType.accept(this);
  }
  visitConstrainedType(node: ConstrainedType): void {
    this.traverseCollection(node.constraints);
  }
  visitTypeAlias(node: TypeAlias): void {
    node.identifier.accept(this);
    node.value.accept(this);
  }
  visitTypeSignature(node: TypeSignature): void {
    node.body.accept(this);
    node.identifier.accept(this);
  }
  visitTypeCast(node: TypeCast): void {
    node.body.accept(this);
    node.expression.accept(this);
  }
  visit(node: ASTNode): void {
    node.accept(this);
  }
}
