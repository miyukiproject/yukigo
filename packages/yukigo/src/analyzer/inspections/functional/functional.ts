import * as Yu from "yukigo-ast";
import { VisitorConstructor, ScopedVisitor, AutoScoped } from "../../utils.js";

@AutoScoped
export class UsesComposition extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitCompositionExpression(node: Yu.CompositionExpression): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesAnonymousVariable extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitWildcardPattern(node: Yu.WildcardPattern): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesComprehension extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitListComprehension(node: Yu.ListComprehension): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesGuards extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitGuardedBody(node: Yu.GuardedBody): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesOtherwise extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitOtherwise(node: Yu.Otherwise): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesLambda extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitLambda(node: Yu.Lambda): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesYield extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitYield(node: Yu.Yield): void {
    throw new Yu.StopTraversalException();
  }
}
@AutoScoped
export class UsesPatternMatching extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitConsPattern(node: Yu.ConsPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitAsPattern(node: Yu.AsPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitListPattern(node: Yu.ListPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitTuplePattern(node: Yu.TuplePattern): void {
    throw new Yu.StopTraversalException();
  }
  visitLiteralPattern(node: Yu.LiteralPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitApplicationPattern(node: Yu.ApplicationPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitConstructorPattern(node: Yu.ConstructorPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitUnionPattern(node: Yu.UnionPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitFunctorPattern(node: Yu.FunctorPattern): void {
    throw new Yu.StopTraversalException();
  }
  visitWildcardPattern(node: Yu.WildcardPattern): void {
    throw new Yu.StopTraversalException();
  }
}

export const functionalInspections: Record<string, VisitorConstructor> = {
  UsesComposition: UsesComposition,
  HasComposition: UsesComposition,
  UsesAnonymousVariable: UsesAnonymousVariable,
  HasAnonymousVariable: UsesAnonymousVariable,
  UsesComprehension: UsesComprehension,
  HasComprehension: UsesComprehension,
  UsesGuards: UsesGuards,
  HasGuards: UsesGuards,
  UsesOtherwise: UsesOtherwise,
  HasOtherwise: UsesOtherwise,
  UsesLambda: UsesLambda,
  HasLambda: UsesLambda,
  UsesYield: UsesYield,
  HasYield: UsesYield,
  UsesPatternMatching: UsesPatternMatching,
  HasPatternMatching: UsesPatternMatching,
};
