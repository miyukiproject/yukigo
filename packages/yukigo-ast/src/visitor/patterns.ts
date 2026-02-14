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
} from "../globals/patterns.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface PatternVisitor<TReturn> {
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
}

export function PatternTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class PatternTraverser extends Base implements PatternVisitor<void> {
        visitVariablePattern(node: VariablePattern): void {
            node.name.accept(this);
        }
        visitLiteralPattern(node: LiteralPattern): void {
            node.name.accept(this);
        }
        visitApplicationPattern(node: ApplicationPattern): void {
            node.identifier.accept(this);
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
            node.left.accept(this);
            node.right.accept(this);
        }
        visitWildcardPattern(node: WildcardPattern): void { }
        visitUnionPattern(node: UnionPattern): void {
            this.traverseCollection(node.elements);
        }
        visitConstructorPattern(node: ConstructorPattern): void {
            this.traverseCollection(node.args);
        }
        visitConsPattern(node: ConsPattern): void {
            node.left.accept(this);
            node.right.accept(this);
        }
    };
}
