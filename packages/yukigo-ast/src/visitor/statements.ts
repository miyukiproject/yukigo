import {
    Sequence,
    If,
    Return,
    Field,
    UnguardedBody,
    GuardedBody,
    Equation,
    Switch,
    Case,
    Try,
    Catch,
    Raise,
    Print,
    Input,
    For,
    Break,
    Continue,
    Variable,
    Assignment,
    Constructor,
    Record,
    Function,
} from "../globals/statements.js";
import {
    EntryPoint,
    Procedure,
    Enumeration,
    While,
    Repeat,
    ForLoop,
    Structure,
} from "../paradigms/imperative.js";
import {
    Rule,
    Fact,
    Query,
    LogicConstraint,
} from "../paradigms/logic.js";
import {
    Method,
    Attribute,
    Class,
    Interface,
    Object,
    Super,
    Self,
    PrimitiveMethod,
} from "../paradigms/object.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface StatementVisitor<TReturn> {
    visitSequence(node: Sequence): TReturn;
    visitSelf(node: Self): TReturn;
    visitSuper(node: Super): TReturn;
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
    visitLogicConstraint(node: LogicConstraint): TReturn;
}

export function StatementTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class StatementTraverser extends Base implements StatementVisitor<void> {
        visitSequence(node: Sequence): void {
            this.traverseCollection(node.statements);
        }
        visitSelf(node: Self): void { }
        visitSuper(node: Super): void { }
        visitIf(node: If): void {
            node.condition.accept(this);
            node.then.accept(this);
            node.elseExpr.accept(this);
        }
        visitReturn(node: Return): void {
            node.body?.accept(this);
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
            node.body?.accept(this);
        }
        visitContinue(node: Continue): void {
            node.body?.accept(this);
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
        visitStructure(node: Structure): void {
            this.traverseCollection(node.elements);
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
            this.traverseCollection(node.expressions);
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
        visitLogicConstraint(node: LogicConstraint): void {
            node.expression.accept(this)
        }
    };
}
