import { ASTNode } from "../globals/generics.js";
import { BaseVisitor, TraverseBase } from "./base.js";
import { ExpressionTraverser, ExpressionVisitor } from "./expressions.js";
import { OperationTraverser, OperationVisitor } from "./operations.js";
import { PatternTraverser, PatternVisitor } from "./patterns.js";
import { PrimitiveTraverser, PrimitiveVisitor } from "./primitives.js";
import { StatementTraverser, StatementVisitor } from "./statements.js";
import { TypeTraverser, TypeVisitor } from "./types.js";

// Combine Interfaces
export interface StrictVisitor<TReturn>
    extends BaseVisitor<TReturn>,
    ExpressionVisitor<TReturn>,
    OperationVisitor<TReturn>,
    PatternVisitor<TReturn>,
    PrimitiveVisitor<TReturn>,
    StatementVisitor<TReturn>,
    TypeVisitor<TReturn> { }

export type Visitor<TReturn> = Partial<StrictVisitor<TReturn>>;

export class StopTraversalException extends Error {
    constructor() {
        super("Inspection found, aborting traversal.");
    }
}

// Combine Traversal Logic via Mixins
export class TraverseVisitor
    extends TypeTraverser(
        StatementTraverser(
            PatternTraverser(
                OperationTraverser(
                    PrimitiveTraverser(ExpressionTraverser(TraverseBase))
                )
            )
        )
    )
    implements StrictVisitor<void> {
    // Overrides or custom logic if needed
    visit(node: ASTNode): void {
        node.accept(this);
    }
}
