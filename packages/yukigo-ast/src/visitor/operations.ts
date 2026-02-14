import { ASTNode } from "../globals/generics.js";
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
} from "../globals/operators.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface OperationVisitor<TReturn> {
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
}

export function OperationTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class OperationTraverser extends Base implements OperationVisitor<void> {
        public traverseBinary(node: { left: ASTNode; right: ASTNode }): void {
            node.left.accept(this);
            node.right.accept(this);
        }
        public traverseUnary(node: { operand: ASTNode }): void {
            node.operand.accept(this);
        }

        visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): void {
            this.traverseUnary(node);
        }
        visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): void {
            this.traverseBinary(node);
        }
        visitListUnaryOperation(node: ListUnaryOperation): void {
            this.traverseUnary(node);
        }
        visitListBinaryOperation(node: ListBinaryOperation): void {
            this.traverseBinary(node);
        }
        visitComparisonOperation(node: ComparisonOperation): void {
            this.traverseBinary(node);
        }
        visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
            this.traverseBinary(node);
        }
        visitLogicalUnaryOperation(node: LogicalUnaryOperation): void {
            this.traverseUnary(node);
        }
        visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): void {
            this.traverseBinary(node);
        }
        visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): void {
            this.traverseUnary(node);
        }
        visitStringOperation(node: StringOperation): void {
            this.traverseBinary(node);
        }
        visitUnifyOperation(node: UnifyOperation): void {
            this.traverseBinary(node);
        }
        visitAssignOperation(node: AssignOperation): void {
            this.traverseBinary(node);
        }
    };
}
