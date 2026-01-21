import {
    TupleExpression,
    FieldExpression,
    DataExpression,
    ConsExpression,
    LetInExpression,
    Otherwise,
    ListComprehension,
    RangeExpression,
    NamedArgument,
    Generator,
} from "../globals/expressions.js";
import {
    CompositionExpression,
    Lambda,
    Application,
    Yield,
} from "../paradigms/functional.js";
import {
    Call,
    Exist,
    Not,
    Findall,
    Forall,
    Goal,
} from "../paradigms/logic.js";
import {
    Send,
    New,
    Implement,
} from "../paradigms/object.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface ExpressionVisitor<TReturn> {
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
    visitNamedArgument(node: NamedArgument): TReturn;
    visitYield(node: Yield): TReturn;
}

export function ExpressionTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class ExpressionTraverser extends Base implements ExpressionVisitor<void> {
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
        visitOtherwise(node: Otherwise): void { }
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
        visitNamedArgument(node: NamedArgument): void {
            node.identifier.accept(this);
            node.expression.accept(this);
        }
        visitYield(node: Yield): void {
            node.expression.accept(this);
        }
    };
}
