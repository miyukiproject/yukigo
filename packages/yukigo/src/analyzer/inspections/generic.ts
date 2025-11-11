import {
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  Assignment,
  AST,
  ASTNode,
  Attribute,
  Call,
  EntryPoint,
  Fact,
  Function,
  If,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  Method,
  Print,
  Procedure,
  Raise,
  Record as RecordNode,
  Rule,
  SimpleType,
  StopTraversalException,
  SymbolPrimitive,
  TraverseVisitor,
  Type,
  TypeAlias,
  TypeSignature,
  TypeVar,
  Variable,
} from "@yukigo/ast";
import { InspectionMap, executeVisitor } from "../index.js";

export class Assigns extends TraverseVisitor {
  private readonly targetIdentifier: string;
  constructor(targetIdentifier: string) {
    super();
    this.targetIdentifier = targetIdentifier;
  }
  visitVariable(node: Variable): void {
    if (node.identifier.value === this.targetIdentifier)
      throw new StopTraversalException();
  }
  visitAttribute(node: Attribute): void {
    if (node.identifier.value === this.targetIdentifier)
      throw new StopTraversalException();
  }
  visitAssignment(node: Assignment): void {
    if (node.identifier.value === this.targetIdentifier)
      throw new StopTraversalException();
  }
}
export class Calls extends TraverseVisitor {
  private readonly targetCallee: string;
  constructor(targetCallee: string) {
    super();
    this.targetCallee = targetCallee;
  }
  visitCall(node: Call): void {
    if (node.callee.value === this.targetCallee)
      throw new StopTraversalException();
  }
}
export class Declares extends TraverseVisitor {
  private readonly targetIdentifier: string;
  constructor(targetIdentifier: string) {
    super();
    this.targetIdentifier = targetIdentifier;
  }
  visit(node: ASTNode): void {
    if (
      "identifier" in node &&
      node.identifier instanceof SymbolPrimitive &&
      node.identifier.value === this.targetIdentifier
    )
      throw new StopTraversalException();
  }
}
export class DeclaresComputation extends TraverseVisitor {
  private readonly callName: string;
  constructor(callName: string) {
    super();
    this.callName = callName;
  }
  visitFunction(node: Function): void {
    if (node.identifier.value === this.callName)
      throw new StopTraversalException();
  }
  visitMethod(node: Method): void {
    if (node.identifier.value === this.callName)
      throw new StopTraversalException();
  }
  visitProcedure(node: Procedure): void {
    if (node.identifier.value === this.callName)
      throw new StopTraversalException();
  }
  visitFact(node: Fact): void {
    if (node.identifier.value === this.callName)
      throw new StopTraversalException();
  }
  visitRule(node: Rule): void {
    if (node.identifier.value === this.callName)
      throw new StopTraversalException();
  }
}
export class DeclaresComputationWithArity extends TraverseVisitor {
  private readonly targetBinding: string;
  private readonly targetArity: number;
  constructor(targetBinding: string, targetArity: number) {
    super();
    this.targetBinding = targetBinding;
    this.targetArity = targetArity;
  }
  visitFunction(node: Function): void {
    if (
      node.identifier.value === this.targetBinding &&
      node.equations.some((eq) => eq.patterns.length === this.targetArity)
    )
      throw new StopTraversalException();
  }
  visitMethod(node: Method): void {
    if (
      node.identifier.value === this.targetBinding &&
      node.equations.some((eq) => eq.patterns.length === this.targetArity)
    )
      throw new StopTraversalException();
  }
  visitProcedure(node: Procedure): void {
    if (
      node.identifier.value === this.targetBinding &&
      node.equations.some((eq) => eq.patterns.length === this.targetArity)
    )
      throw new StopTraversalException();
  }
  visitFact(node: Fact): void {
    if (
      node.identifier.value === this.targetBinding &&
      node.patterns.length === this.targetArity
    )
      throw new StopTraversalException();
  }
  visitRule(node: Rule): void {
    if (
      node.identifier.value === this.targetBinding &&
      node.patterns.length === this.targetArity
    )
      throw new StopTraversalException();
  }
}
export class DeclaresEntryPoint extends TraverseVisitor {
  visitEntryPoint(node: EntryPoint): void {
    throw new StopTraversalException();
  }
}
export class DeclaresFunction extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitFunction(node: Function): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
}

export class DeclaresRecursively extends DeclaresComputation {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super(targetBinding);
    this.targetBinding = targetBinding;
  }
  visitFunction(node: Function): void {
    super.visitFunction(node);
    this.visitNested(node);
  }
  visitMethod(node: Method): void {
    super.visitMethod(node);
    this.visitNested(node);
  }
  visitProcedure(node: Procedure): void {
    super.visitProcedure(node);
    this.visitNested(node);
  }
  visitFact(node: Fact): void {
    super.visitFact(node);
    this.visitNested(node);
  }
  visitRule(node: Rule): void {
    super.visitRule(node);
    this.visitNested(node);
  }
  visitNested(node: ASTNode): void {
    if (
      "identifier" in node &&
      node.identifier instanceof SymbolPrimitive &&
      node.identifier.value === this.targetBinding
    )
      throw new StopTraversalException();
  }
}
export class DeclaresTypeAlias extends TraverseVisitor {
  private readonly typeAliasName: string;
  constructor(typeAliasName: string) {
    super();
    this.typeAliasName = typeAliasName;
  }
  visitTypeAlias(node: TypeAlias): void {
    if (node.identifier.value === this.typeAliasName)
      throw new StopTraversalException();
  }
}
export class DeclaresTypeSignature extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitTypeSignature(node: TypeSignature): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
}
export class DeclaresVariable extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitVariable(node: Variable): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
}
export class Raises extends TraverseVisitor {
  visitRaise(node: Raise): void {
    throw new StopTraversalException();
  }
}
export class Uses extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitSymbolPrimitive(node: SymbolPrimitive): void {
    if (node.value === this.targetBinding) throw new StopTraversalException();
  }
}
export class UsesArithmetic extends TraverseVisitor {
  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): void {
    throw new StopTraversalException();
  }
  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): void {
    throw new StopTraversalException();
  }
}
export class UsesConditional extends TraverseVisitor {
  visitIf(node: If): void {
    throw new StopTraversalException();
  }
}
export class UsesLogic extends TraverseVisitor {
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    throw new StopTraversalException();
  }
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): void {
    throw new StopTraversalException();
  }
}
export class UsesPrint extends TraverseVisitor {
  visitPrint(node: Print): void {
    throw new StopTraversalException();
  }
}
export class UsesType extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitTypeSignature(node: TypeSignature): void {
    node.body.accept(this);
  }
  visitSimpleType(node: SimpleType): void {
    if (node.value === this.targetBinding) throw new StopTraversalException();
  }
  visitTypeVar(node: TypeVar): void {
    if (node.value === this.targetBinding) throw new StopTraversalException();
  }
}
export class HasBinding extends TraverseVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string) {
    super();
    this.targetBinding = targetBinding;
  }
  visitFunction(node: Function): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitTypeAlias(node: TypeAlias): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitTypeSignature(node: TypeSignature): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitRecord(node: RecordNode): void {
    if (node.name.value === this.targetBinding)
      throw new StopTraversalException();
  }
}

export const genericInspections: InspectionMap = {
  Assigns: (node, args) => executeVisitor(node, new Assigns(args[0])),
  Calls: (node, args) => executeVisitor(node, new Calls(args[0])),
  Declares: (node, args) => executeVisitor(node, new Declares(args[0])),
  DeclaresComputation: (node, args) =>
    executeVisitor(node, new DeclaresComputation(args[0])),
  DeclaresComputationWithArity: (node, args, binding) =>
    executeVisitor(
      node,
      new DeclaresComputationWithArity(binding, Number(args[0]))
    ),
  DeclaresEntryPoint: (node, args) =>
    executeVisitor(node, new DeclaresEntryPoint()),
  DeclaresFunction: (node, args) =>
    executeVisitor(node, new DeclaresFunction(args[0])),
  DeclaresRecursively: (node, args) =>
    executeVisitor(node, new DeclaresRecursively(args[0])),
  DeclaresTypeAlias: (node, args) =>
    executeVisitor(node, new DeclaresTypeAlias(args[0])),
  DeclaresTypeSignature: (node, args) =>
    executeVisitor(node, new DeclaresTypeSignature(args[0])),
  DeclaresVariable: (node, args) =>
    executeVisitor(node, new DeclaresVariable(args[0])),
  Delegates: (ast, args) => {
    const declares = genericInspections.Declares(ast, args);
    const calls = genericInspections.Calls(ast, args);
    return declares && calls;
  },
  Raises: (node, args) => executeVisitor(node, new Raises()),
  Uses: (node, args) => executeVisitor(node, new Uses(args[0])),
  UsesArithmetic: (node, args) => executeVisitor(node, new UsesArithmetic()),
  /*   Rescues: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  SubordinatesDeclarationsTo: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  SubordinatesDeclarationsToEntryPoint: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  TypesAs: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  TypesParameterAs: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  TypesReturnAs: (ast, args) => {
    throw Error("Inspection not implemented");
  }, */
  UsesConditional: (node, args) => executeVisitor(node, new UsesConditional()),
  /*   UsesExceptionHandling: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesExceptions: (ast, args) => {
    throw Error("Inspection not implemented");
  }, */
  UsesIf: (node, args) => executeVisitor(node, new UsesConditional()),
  UsesLogic: (node, args) => executeVisitor(node, new UsesLogic()),
  UsesMath: (node, args) => executeVisitor(node, new UsesArithmetic()),
  UsesPrint: (node, args) => executeVisitor(node, new UsesPrint()),
  UsesType: (node, args) => executeVisitor(node, new UsesType(args[0])),
  HasBinding: (node, args) => executeVisitor(node, new HasBinding(args[0])),
};
