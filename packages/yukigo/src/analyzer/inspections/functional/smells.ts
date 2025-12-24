import {
  Lambda,
  Call,
  VariablePattern,
  Variable,
  StopTraversalException,
  Equation,
  ASTNode,
  BooleanPrimitive,
  Application,
  isUnguardedBody,
  Otherwise,
  GuardedBody,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";
import { Uses } from "../generic/generic.js";

@AutoScoped
export class HasRedundantLambda extends ScopedVisitor {
  visitLambda(node: Lambda): void {
    if (node.parameters.length !== 1) return;
    if (!(node.body instanceof Application)) return;

    const param = node.parameters[0];
    const call = node.body;

    if (
      call.functionExpr instanceof Application ||
      call.functionExpr instanceof Call
    )
      return;

    const arg = call.parameter;

    if (
      param instanceof VariablePattern &&
      arg instanceof Variable &&
      param.name.value === arg.identifier.value
    )
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantGuards extends ScopedVisitor {
  visitEquation(node: Equation): void {
    if (isUnguardedBody(node.body)) return;
    // If there is only 1 guard...
    if (node.body.length === 1) {
      const guard = node.body[0];
      // ...and that guard is "True" or "otherwise"
      if (this.isAlwaysTrue(guard.condition))
        throw new StopTraversalException();
    }
  }

  private isAlwaysTrue(node: ASTNode): boolean {
    // check for boolean literal 'True'
    if (node instanceof BooleanPrimitive && node.value === true) return true;
    // check for default case
    if (node instanceof Otherwise) return true;
    return false;
  }
}

@AutoScoped
export class ShouldUseOtherwise extends ScopedVisitor {
  visitGuardedBody(node: GuardedBody): void {
    if (
      node.condition instanceof BooleanPrimitive &&
      node.condition.value === true
    )
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantParameter extends ScopedVisitor {
  visitEquation(node: Equation): void {
    for (const pattern of node.patterns) {
      if (pattern instanceof VariablePattern) {
        const paramName = pattern.name.value;
        const usageChecker = new Uses(paramName, this.binding);
        try {
          node.accept(usageChecker);
          // uses didnt throw so the param is not being used
          throw new StopTraversalException();
        } catch (e) {
          if (e instanceof StopTraversalException) continue;
          throw e;
        }
      }
    }
  }
}

export const functionalSmells: Record<string, VisitorConstructor> = {
  HasRedundantGuards: HasRedundantGuards,
  HasRedundantLambda: HasRedundantLambda,
  HasRedundantParameter: HasRedundantParameter,
  ShouldUseOtherwise: ShouldUseOtherwise,
};
