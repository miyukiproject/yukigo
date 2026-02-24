import { ASTNode } from "../globals/generics.js";
import { BaseVisitor, TraverseBase } from "./base.js";
import { ExpressionTraverser, ExpressionVisitor } from "./expressions.js";
import { OperationTraverser, OperationVisitor } from "./operations.js";
import { PatternTraverser, PatternVisitor } from "./patterns.js";
import { PrimitiveTraverser, PrimitiveVisitor } from "./primitives.js";
import { StatementTraverser, StatementVisitor } from "./statements.js";
import { TypeTraverser, TypeVisitor } from "./types.js";
import { TestingTraverser, TestingVisitor } from "./testing.js";

export * from "./base.js";
export * from "./expressions.js";
export * from "./operations.js";
export * from "./patterns.js";
export * from "./primitives.js";
export * from "./statements.js";
export * from "./types.js";
export * from "./testing.js";

export interface StrictVisitor<TReturn>
    extends BaseVisitor<TReturn>,
    ExpressionVisitor<TReturn>,
    OperationVisitor<TReturn>,
    PatternVisitor<TReturn>,
    PrimitiveVisitor<TReturn>,
    StatementVisitor<TReturn>,
    TypeVisitor<TReturn>,
    TestingVisitor<TReturn> { }

export type Visitor<TReturn> = Partial<StrictVisitor<TReturn>>;

export class StopTraversalException extends Error {
    constructor() {
        super("Inspection found, aborting traversal.");
    }
}

// Combine Traversal Logic via Mixins
export class TraverseVisitor
    extends TestingTraverser(TypeTraverser(
        StatementTraverser(
            PatternTraverser(
                OperationTraverser(
                    PrimitiveTraverser(ExpressionTraverser(TraverseBase))
                )
            )
        )
    ))
    implements StrictVisitor<void> {}
