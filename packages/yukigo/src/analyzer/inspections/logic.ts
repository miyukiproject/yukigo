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
import { InspectionMap, executeVisitor } from "../utils.js";
import { isYukigoPrimitive } from "yukigo-ast";

export abstract class DeclaresBinding extends TraverseVisitor {
  protected readonly targetBinding: string;

  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }
}
export class DeclaresFact extends DeclaresBinding {
  visitFact(node: Fact): void {
    const bindingName = node.identifier.value;
    if (!this.targetBinding || bindingName === this.targetBinding)
      throw new StopTraversalException();
  }
}
export class DeclaresRule extends DeclaresBinding {
  visitRule(node: Rule): void {
    const bindingName = node.identifier.value;
    if (!this.targetBinding || bindingName === this.targetBinding)
      throw new StopTraversalException();
  }
}
export class DeclaresPredicate extends DeclaresBinding {
  visitFact(node: Fact): void {
    new DeclaresFact(this.targetBinding).visitFact(node);
  }
  visitRule(node: Rule): void {
    new DeclaresRule(this.targetBinding).visitRule(node);
  }
}

export class PredicateVisitor extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false; // this flag helps to check nested functions inside the targetBinding scope
  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }
  visitFact(node: Fact): void {
    const nodeName = node.identifier.value;
    if (!this.isInsideTargetScope) {
      if (nodeName === this.targetBinding) {
        this.isInsideTargetScope = true;
        this.traverseCollection(node.patterns);
        this.isInsideTargetScope = false;
      }
      return;
    }
    this.traverseCollection(node.patterns);
  }
  visitRule(node: Rule): void {
    const nodeName = node.identifier.value;
    if (!this.isInsideTargetScope) {
      if (nodeName === this.targetBinding) {
        this.isInsideTargetScope = true;
        this.traverseCollection(node.expressions);
        this.isInsideTargetScope = false;
      }
      return;
    }
    this.traverseCollection(node.expressions);
  }
}

export class UsesFindall extends TraverseVisitor {
  visitFindall(node: Findall): void {
    throw new StopTraversalException();
  }
}
export class UsesForall extends TraverseVisitor {
  visitForall(node: Forall): void {
    throw new StopTraversalException();
  }
}
export class UsesNot extends TraverseVisitor {
  visitNot(node: Not): void {
    throw new StopTraversalException();
  }
  visitExist(node: Exist): void {
    if (node.identifier.value === "not") throw new StopTraversalException();
  }
}
export class UsesUnificationOperator extends PredicateVisitor {
  visitUnifyOperation(node: UnifyOperation): void {
    throw new StopTraversalException();
  }
}
export class UsesCut extends PredicateVisitor {
  visitExist(node: Exist): void {
    if (node.identifier.value === "!") throw new StopTraversalException();
  }
}
export class UsesFail extends PredicateVisitor {
  visitExist(node: Exist): void {
    if (node.identifier.value === "fail") throw new StopTraversalException();
  }
}
export class HasRedundantReduction extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false;

  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }
  visitRule(node: Rule): void {
    // Only inspect the specified rule if a binding is provided
    if (this.targetBinding && node.identifier.value !== this.targetBinding)
      return;

    // Check each unification in the rule's body
    for (const bodyElement of node.expressions) {
      if (bodyElement instanceof AssignOperation) {
        const left = bodyElement.left;
        const right = bodyElement.right;

        if (!(left instanceof SymbolPrimitive)) continue;

        const redundantReductionParameters = isYukigoPrimitive(right);
        const redundantReductionFunctors = right instanceof Exist;

        // Check if reduction is redundant
        const isRedundant =
          redundantReductionParameters || redundantReductionFunctors;

        if (isRedundant) throw new StopTraversalException();
      }
    }
  }
}

export const logicInspections: InspectionMap = {
  DeclaresFact: (node, args, binding) =>
    executeVisitor(node, new DeclaresFact(binding)),
  DeclaresRule: (node, args, binding) =>
    executeVisitor(node, new DeclaresRule(binding)),
  DeclaresPredicate: (node, args, binding) =>
    executeVisitor(node, new DeclaresPredicate(binding)),
  UsesFindall: (node, args, binding) => executeVisitor(node, new UsesFindall()),
  UsesForall: (node, args, binding) => executeVisitor(node, new UsesForall()),
  UsesNot: (node, args, binding) => executeVisitor(node, new UsesNot()),
  UsesUnificationOperator: (node, args, binding) =>
    executeVisitor(node, new UsesUnificationOperator(binding)),
  UsesCut: (node, args, binding) => executeVisitor(node, new UsesCut(binding)),
  UsesFail: (node, args, binding) =>
    executeVisitor(node, new UsesFail(binding)),
  HasRedundantReduction: (node, args, binding) =>
    executeVisitor(node, new HasRedundantReduction(binding)),
};
