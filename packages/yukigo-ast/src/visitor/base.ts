import { ASTNode } from "../globals/generics.js";

export type VisitorConstructor<T = {}> = abstract new (...args: any[]) => T;

export interface BaseVisitor<TReturn> {
    visit(node: ASTNode): TReturn;
    fallback(node: ASTNode): TReturn;
}

export abstract class TraverseBase implements BaseVisitor<void> {
    visit(node: ASTNode): void {
        node.accept(this);
    }

    public traverseCollection(nodes: ASTNode[]): void {
        nodes.forEach((node) => node.accept(this));
    }
    abstract fallback(node: ASTNode): void;
}
