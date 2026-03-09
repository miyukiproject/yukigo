import {
  TypeClass,
  Instance,
} from "../paradigms/typeclasses.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface TypeClassVisitor<TReturn> {
  visitTypeClass(node: TypeClass): TReturn;
  visitInstance(node: Instance): TReturn;
}

export function TypeClassTraverser<TBase extends GConstructor<TraverseBase>>(
  Base: TBase
) {
  return class TypeClassTraverser extends Base implements TypeClassVisitor<void> {
    visitTypeClass(node: TypeClass): void {
      this.traverseCollection(node.signatures);
    }
    visitInstance(node: Instance): void {
      this.traverseCollection(node.functions);
    }
  };
}
