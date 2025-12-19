import { TraverseVisitor } from "yukigo-ast";

export interface VisitorConstructor {
  new (...args: any[]): TraverseVisitor;
}
export type InspectionMap = Record<string, VisitorConstructor>;
