import {
  AssignOperation,
  Exist,
  isYukigoPrimitive,
  Rule,
  StopTraversalException,
  SymbolPrimitive,
  UnifyOperation,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";

@AutoScoped
export class HasRedundantReduction extends ScopedVisitor {
  visitRule(node: Rule): void {
    for (const bodyElement of node.expressions) {
      if (bodyElement instanceof AssignOperation) {
        const left = bodyElement.left;
        const right = bodyElement.right;

        if (!(left instanceof SymbolPrimitive)) continue;

        const redundantReductionParameters = isYukigoPrimitive(right);
        const redundantReductionFunctors = right instanceof Exist;

        const isRedundant =
          redundantReductionParameters || redundantReductionFunctors;

        if (isRedundant) throw new StopTraversalException();
      }
    }
  }
}

@AutoScoped
export class UsesUnificationOperator extends ScopedVisitor {
  visitUnifyOperation(node: UnifyOperation): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesCut extends ScopedVisitor {
  visitExist(node: Exist): void {
    if (node.identifier.value === "!") throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesFail extends ScopedVisitor {
  visitExist(node: Exist): void {
    if (node.identifier.value === "fail") throw new StopTraversalException();
  }
}

export const logicSmells: Record<string, VisitorConstructor> = {
  HasRedundantReduction: HasRedundantReduction,
  UsesCut: UsesCut,
  UsesFail: UsesFail,
  UsesUnificationOperator: UsesUnificationOperator,
};
