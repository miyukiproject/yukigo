import {
  ApplicationPattern,
  AsPattern,
  ASTNode,
  CompositionExpression,
  ConsPattern,
  ConstructorPattern,
  Fact,
  For,
  Function,
  FunctorPattern,
  GuardedBody,
  Lambda,
  ListComprehension,
  ListPattern,
  LiteralPattern,
  Rule,
  StopTraversalException,
  TraverseVisitor,
  TuplePattern,
  UnionPattern,
  WildcardPattern,
  Yield,
} from "@yukigo/ast";
import { InspectionMap, executeVisitor } from "../utils.js";

export class FunctionVisitor extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false; // this flag helps to check nested functions inside the targetBinding scope
  constructor(binding: string) {
    super();
    this.targetBinding = binding;
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

export class UsesComposition extends FunctionVisitor {
  visitCompositionExpression(node: CompositionExpression): void {
    throw new StopTraversalException();
  }
}
export class UsesAnonymousVariable extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false;

  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }

  visitWildcardPattern(node: WildcardPattern): void {
    throw new StopTraversalException();
  }
  visitFunction(node: Function): void {
    this.enterScope(node, node.equations);
  }
  visitFact(node: Fact): void {
    this.enterScope(node, node.patterns);
  }
  visitRule(node: Rule): void {
    this.enterScope(node, node.patterns);
  }
  private enterScope(node: Function | Fact | Rule, children: ASTNode[]): void {
    const nodeName = node.identifier.value;
    if (!this.isInsideTargetScope) {
      if (!this.targetBinding || nodeName === this.targetBinding) {
        this.isInsideTargetScope = true;
        this.traverseCollection(children);
        this.isInsideTargetScope = false;
      }
      return;
    }
    this.traverseCollection(children);
  }
}
export class UsesComprehension extends FunctionVisitor {
  visitListComprehension(node: ListComprehension): void {
    throw new StopTraversalException();
  }
}
export class UsesGuards extends FunctionVisitor {
  visitGuardedBody(node: GuardedBody): void {
    throw new StopTraversalException();
  }
}
export class UsesLambda extends FunctionVisitor {
  visitLambda(node: Lambda): void {
    throw new StopTraversalException();
  }
}
export class UsesYield extends FunctionVisitor {
  visitYield(node: Yield): void {
    throw new StopTraversalException();
  }
}
export class UsesPatternMatching extends FunctionVisitor {
  visitConsPattern(node: ConsPattern): void {
    throw new StopTraversalException();
  }
  visitAsPattern(node: AsPattern): void {
    throw new StopTraversalException();
  }
  visitListPattern(node: ListPattern): void {
    throw new StopTraversalException();
  }
  visitTuplePattern(node: TuplePattern): void {
    throw new StopTraversalException();
  }
  visitLiteralPattern(node: LiteralPattern): void {
    throw new StopTraversalException();
  }
  visitApplicationPattern(node: ApplicationPattern): void {
    throw new StopTraversalException();
  }
  visitConstructorPattern(node: ConstructorPattern): void {
    throw new StopTraversalException();
  }
  visitUnionPattern(node: UnionPattern): void {
    throw new StopTraversalException();
  }
  visitFunctorPattern(node: FunctorPattern): void {
    throw new StopTraversalException();
  }
  visitWildcardPattern(node: WildcardPattern): void {
    throw new StopTraversalException();
  }
}

export const functionalInspections: InspectionMap = {
  UsesComposition: (node, args, binding) =>
    executeVisitor(node, new UsesComposition(binding)),
  UsesAnonymousVariable: (node, args, binding) =>
    executeVisitor(node, new UsesAnonymousVariable(binding)),
  UsesComprehension: (node, args, binding) =>
    executeVisitor(node, new UsesComprehension(binding)),
  UsesGuards: (node, args, binding) =>
    executeVisitor(node, new UsesGuards(binding)),
  UsesLambda: (node, args, binding) =>
    executeVisitor(node, new UsesLambda(binding)),
  UsesYield: (node, args, binding) =>
    executeVisitor(node, new UsesYield(binding)),
  UsesPatternMatching: (node, args, binding) =>
    executeVisitor(node, new UsesPatternMatching(binding)),
};
