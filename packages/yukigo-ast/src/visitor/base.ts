import { ASTNode } from "../globals/generics.js";

export type GConstructor<T = {}> = new (...args: any[]) => T;

export interface BaseVisitor<TReturn> {
    visit(node: ASTNode): TReturn;
}

export class TraverseBase implements BaseVisitor<void> {
    visit(node: ASTNode): void {
        node.accept(this);
    }

    public traverseCollection(nodes: ASTNode[]): void {
        nodes.forEach((node) => node.accept(this));
    }
}
