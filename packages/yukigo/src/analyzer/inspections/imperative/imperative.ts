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
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";

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
@AutoScoped
export class DeclaresProcedure extends ScopedVisitor {
  private readonly procedureName: string;
  constructor(procedureName: string, scope?: string) {
    super(scope);
    this.procedureName = procedureName;
  }
  visitProcedure(node: Procedure): void {
    if (node.identifier.value === this.procedureName)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class UsesForLoop extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitForLoop(node: ForLoop): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesWhile extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitWhile(node: While): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesRepeat extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitRepeat(node: Repeat): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesLoop extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
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
@AutoScoped
export class UsesSwitch extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
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
