import {
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  Assignment,
  AST,
  ASTNode,
  Attribute,
  Call,
  Catch,
  ConstructorPattern,
  EntryPoint,
  Fact,
  Function,
  If,
  ListType,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  Method,
  ParameterizedType,
  Print,
  Procedure,
  Raise,
  Record as RecordNode,
  Rule,
  SimpleType,
  StopTraversalException,
  SymbolPrimitive,
  TraverseVisitor,
  Try,
  TupleType,
  Type,
  TypeAlias,
  TypeApplication,
  TypeSignature,
  TypeVar,
  Variable,
  VariablePattern,
} from "yukigo-ast";
import { VisitorConstructor } from "../utils.js";

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

export class SubordinatesDeclarationsTo extends TraverseVisitor {
  constructor(private childName: string, private parentName: string) {
    super();
  }

  visitFunction(node: Function): void {
    if (node.identifier.value === this.parentName) {
      const childFinder = new Declares(this.childName);
      node.equations.forEach((eq) => eq.accept(childFinder)); // we expect that this will throw if find the subordinated decl
    } else {
      super.visitFunction(node);
    }
  }
}

export class SubordinatesDeclarationsToEntryPoint extends TraverseVisitor {
  constructor(private childName: string) {
    super();
  }

  visitEntryPoint(node: EntryPoint): void {
    const childFinder = new Declares(this.childName);
    node.expression.statements.forEach((stmt) => stmt.accept(childFinder));
  }
}

export class TypesAs extends TraverseVisitor {
  constructor(private bindingName: string, private typeName: string) {
    super();
  }

  visitTypeSignature(node: TypeSignature): void {
    if (node.identifier.value === this.bindingName) {
      const actualType = node.body.toString();
      if (
        actualType.replace(/\s+/g, " ").trim() ===
        this.typeName.replace(/\s+/g, " ").trim()
      ) {
        throw new StopTraversalException();
      }
    }
  }
}

export class TypesParameterAs extends TraverseVisitor {
  constructor(
    private bindingName: string,
    private paramIndex: number,
    private typeName: string
  ) {
    super();
  }

  visitTypeSignature(node: TypeSignature): void {
    if (node.identifier.value === this.bindingName) {
      if (node.body instanceof ParameterizedType) {
        const paramType = node.body.inputs[this.paramIndex];
        if (paramType) {
          const actualType = paramType.toString();
          if (
            actualType.replace(/\s+/g, " ").trim() ===
            this.typeName.replace(/\s+/g, " ").trim()
          ) {
            throw new StopTraversalException();
          }
        }
      }
    }
  }
}

export class TypesReturnAs extends TraverseVisitor {
  constructor(private bindingName: string, private typeName: string) {
    super();
  }

  visitTypeSignature(node: TypeSignature): void {
    if (node.identifier.value === this.bindingName) {
      if (node.body instanceof ParameterizedType) {
        const actualType = node.body.returnType.toString();
        if (
          actualType.replace(/\s+/g, " ").trim() ===
          this.typeName.replace(/\s+/g, " ").trim()
        ) {
          throw new StopTraversalException();
        }
      }
    }
  }
}

export class Rescues extends TraverseVisitor {
  constructor(private exceptionName: string) {
    super();
  }
  visitCatch(node: Catch): void {
    for (const pattern of node.patterns) {
      if (
        pattern instanceof VariablePattern &&
        pattern.name.value === this.exceptionName
      ) {
        throw new StopTraversalException();
      }
    }
  }
}

export class UsesExceptionHandling extends TraverseVisitor {
  visitTry(node: Try): void {
    throw new StopTraversalException();
  }
}

export class UsesExceptions extends TraverseVisitor {
  visitTry(node: Try): void {
    throw new StopTraversalException();
  }
  visitRaise(node: Raise): void {
    throw new StopTraversalException();
  }
}

export const genericInspections: Record<string, VisitorConstructor> = {
  Assigns: Assigns,
  Calls: Calls,
  Declares: Declares,
  DeclaresComputation: DeclaresComputation,
  DeclaresComputationWithArity: DeclaresComputationWithArity,
  DeclaresEntryPoint: DeclaresEntryPoint,
  DeclaresFunction: DeclaresFunction,
  DeclaresRecursively: DeclaresRecursively,
  DeclaresTypeAlias: DeclaresTypeAlias,
  DeclaresTypeSignature: DeclaresTypeSignature,
  DeclaresVariable: DeclaresVariable,
  Raises: Raises,
  Uses: Uses,
  UsesArithmetic: UsesArithmetic,
  SubordinatesDeclarationsTo: SubordinatesDeclarationsTo,
  SubordinatesDeclarationsToEntryPoint: SubordinatesDeclarationsToEntryPoint,
  TypesAs: TypesAs,
  TypesParameterAs: TypesParameterAs,
  TypesReturnAs: TypesReturnAs,
  UsesConditional: UsesConditional,
  Rescues: Rescues,
  UsesExceptionHandling: UsesExceptionHandling,
  UsesExceptions: UsesExceptions,
  UsesIf: UsesConditional,
  UsesLogic: UsesLogic,
  UsesMath: UsesArithmetic,
  UsesPrint: UsesPrint,
  UsesType: UsesType,
  HasBinding: HasBinding,
};
