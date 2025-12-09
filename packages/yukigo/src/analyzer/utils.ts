import { ASTNode, StopTraversalException, TraverseVisitor } from "yukigo-ast";

export type InspectionHandler = (
  node: ASTNode,
  args: string[],
  binding?: string
) => boolean;

export type InspectionMap = Record<string, InspectionHandler>;

export function executeVisitor(
  node: ASTNode,
  visitor: TraverseVisitor
): boolean {
  let passes = false;
  try {
    node.accept(visitor);
  } catch (e) {
    if (e instanceof StopTraversalException) {
      passes = true;
    } else {
      throw e;
    }
  }
  return passes;
}