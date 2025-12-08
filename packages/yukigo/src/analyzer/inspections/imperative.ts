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
} from "@yukigo/ast";
import { InspectionMap, executeVisitor } from "../utils.js";

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
    if (node.identifier.value === this.enumName) throw StopTraversalException;
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
      throw StopTraversalException;
  }
}
export class UsesForLoop extends BindingVisitor {
  visitForLoop(node: ForLoop): void {
    throw StopTraversalException;
  }
}
export class UsesWhile extends BindingVisitor {
  visitWhile(node: While): void {
    throw StopTraversalException;
  }
}
export class UsesRepeat extends BindingVisitor {
  visitRepeat(node: Repeat): void {
    throw StopTraversalException;
  }
}
export class UsesLoop extends BindingVisitor {
  visitForLoop(node: ForLoop): void {
    throw StopTraversalException;
  }
  visitWhile(node: While): void {
    throw StopTraversalException;
  }
  visitRepeat(node: Repeat): void {
    throw StopTraversalException;
  }
  // visitForEach(node: ForEach): void {
  //   throw StopTraversalException;
  // }
}
export class UsesSwitch extends BindingVisitor {
  visitSwitch(node: Switch): void {
    throw StopTraversalException;
  }
}

export const imperativeInspections: InspectionMap = {
  DeclaresEnumeration: (node, args) =>
    executeVisitor(node, new DeclaresEnumeration(args[0])),
  DeclaresProcedure: (node, args) =>
    executeVisitor(node, new DeclaresProcedure(args[0])),
  UsesForEach: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesForLoop: (node, args, binding) =>
    executeVisitor(node, new UsesForLoop(binding)),
  UsesRepeat: (node, args, binding) =>
    executeVisitor(node, new UsesRepeat(binding)),
  UsesWhile: (node, args, binding) =>
    executeVisitor(node, new UsesWhile(binding)),
  UsesLoop: (node, args, binding) =>
    executeVisitor(node, new UsesLoop(binding)),
  UsesSwitch: (node, args, binding) =>
    executeVisitor(node, new UsesSwitch(binding)),
};
