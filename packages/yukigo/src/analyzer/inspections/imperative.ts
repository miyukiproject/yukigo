import {
  Enumeration,
  ForLoop,
  Function,
  Procedure,
  Repeat,
  StopTraversalException,
  Switch,
  TraverseVisitor,
  While,
} from "yukigo-ast";
import { VisitorConstructor } from "../utils.js";

export class BindingVisitor extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false; // this flag helps to check nested functions inside the targetBinding scope
  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }
  visitProcedure(node: Procedure): void {
    const currentFunctionName = node.identifier.value;

    // if not inside scope then is top-level
    if (!this.isInsideTargetScope) {
      if (!this.targetBinding || currentFunctionName === this.targetBinding) {
        this.isInsideTargetScope = true;
        this.traverseCollection(node.equations);
        this.isInsideTargetScope = false;
        return;
      }
      return;
    }
    // if inside the scope of targetBinding then traverse
    this.traverseCollection(node.equations);
  }
  visitFunction(node: Function): void {
    const currentFunctionName = node.identifier.value;

    // if not inside scope then is top-level
    if (!this.isInsideTargetScope) {
      if (!this.targetBinding || currentFunctionName === this.targetBinding) {
        this.isInsideTargetScope = true;
        this.traverseCollection(node.equations);
        this.isInsideTargetScope = false;
        return;
      }
      return;
    }
    // if inside the scope of targetBinding then traverse
    this.traverseCollection(node.equations);
  }
}

export class DeclaresEnumeration extends TraverseVisitor {
  private readonly enumName: string;
  constructor(enumName: string) {
    super();
    this.enumName = enumName;
  }
  visitEnumeration(node: Enumeration): void {
    if (node.identifier.value === this.enumName)
      throw new StopTraversalException();
  }
}
export class DeclaresProcedure extends TraverseVisitor {
  private readonly procedureName: string;
  constructor(procedureName: string) {
    super();
    this.procedureName = procedureName;
  }
  visitProcedure(node: Procedure): void {
    if (node.identifier.value === this.procedureName)
      throw new StopTraversalException();
  }
}
export class UsesForLoop extends BindingVisitor {
  visitForLoop(node: ForLoop): void {
    throw new StopTraversalException();
  }
}
export class UsesWhile extends BindingVisitor {
  visitWhile(node: While): void {
    throw new StopTraversalException();
  }
}
export class UsesRepeat extends BindingVisitor {
  visitRepeat(node: Repeat): void {
    throw new StopTraversalException();
  }
}
export class UsesLoop extends BindingVisitor {
  visitForLoop(node: ForLoop): void {
    throw new StopTraversalException();
  }
  visitWhile(node: While): void {
    throw new StopTraversalException();
  }
  visitRepeat(node: Repeat): void {
    throw new StopTraversalException();
  }
  // visitForEach(node: ForEach): void {
  //   throw StopTraversalException;
  // }
}
export class UsesSwitch extends BindingVisitor {
  visitSwitch(node: Switch): void {
    throw new StopTraversalException();
  }
}

export const imperativeInspections: Record<string, VisitorConstructor> = {
  DeclaresEnumeration: DeclaresEnumeration,
  DeclaresProcedure: DeclaresProcedure,
  UsesForLoop: UsesForLoop,
  UsesRepeat: UsesRepeat,
  UsesWhile: UsesWhile,
  UsesLoop: UsesLoop,
  UsesSwitch: UsesSwitch,
};
