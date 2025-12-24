import {
  Assignment,
  AssignOperation,
  Exist,
  Fact,
  Findall,
  Forall,
  Not,
  Rule,
  StopTraversalException,
  SymbolPrimitive,
  TraverseVisitor,
  UnifyOperation,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";
import { isYukigoPrimitive } from "yukigo-ast";

export class DeclaresFact extends TraverseVisitor {
  constructor(private readonly target?: string) {
    super();
  }
  visitFact(node: Fact): void {
    const bindingName = node.identifier.value;
    if (!this.target || bindingName === this.target)
      throw new StopTraversalException();
  }
}
export class DeclaresRule extends TraverseVisitor {
  constructor(private readonly target?: string) {
    super();
  }
  visitRule(node: Rule): void {
    const bindingName = node.identifier.value;
    if (!this.target || bindingName === this.target)
      throw new StopTraversalException();
  }
}
export class DeclaresPredicate extends TraverseVisitor {
  constructor(private readonly target?: string) {
    super();
  }
  visitFact(node: Fact): void {
    new DeclaresFact(this.target).visitFact(node);
  }
  visitRule(node: Rule): void {
    new DeclaresRule(this.target).visitRule(node);
  }
}
@AutoScoped
export class UsesFindall extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitFindall(node: Findall): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesForall extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitForall(node: Forall): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesNot extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitNot(node: Not): void {
    throw new StopTraversalException();
  }
  visitExist(node: Exist): void {
    if (node.identifier.value === "not") throw new StopTraversalException();
  }
}

export const logicInspections: Record<string, VisitorConstructor> = {
  DeclaresFact: DeclaresFact,
  DeclaresRule: DeclaresRule,
  DeclaresPredicate: DeclaresPredicate,
  UsesFindall: UsesFindall,
  UsesForall: UsesForall,
  UsesNot: UsesNot,
};
