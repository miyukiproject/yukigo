import {
  Application,
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  Assignment,
  ASTNode,
  Attribute,
  Call,
  Catch,
  Class,
  EntryPoint,
  Equation,
  Fact,
  Function,
  If,
  isUnguardedBody,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  Method,
  Object,
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
  TypeAlias,
  TypeSignature,
  TypeVar,
  Variable,
  VariablePattern,
} from "yukigo-ast";
import { VisitorConstructor, ScopedVisitor, AutoScoped } from "../../utils.js";

@AutoScoped
export class Assigns extends ScopedVisitor {
  private readonly targetIdentifier: string;
  constructor(targetIdentifier: string, scope?: string) {
    super(scope);
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
@AutoScoped
export class Calls extends ScopedVisitor {
  private readonly targetCallee: string;
  constructor(targetCallee: string, scope?: string) {
    super(scope);
    this.targetCallee = targetCallee;
  }
  visitCall(node: Call): void {
    if (node.callee.value === this.targetCallee)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class Declares extends ScopedVisitor {
  private readonly targetIdentifier: string;

  constructor(targetIdentifier: string, scopeName?: string) {
    super(scopeName);
    this.targetIdentifier = targetIdentifier;
  }

  private check(node: { identifier: SymbolPrimitive }): void {
    if (node.identifier.value === this.targetIdentifier)
      throw new StopTraversalException();
  }

  visitFunction(node: Function): void {
    if (this.inScope) this.check(node);
    super.visitFunction(node);
  }

  visitMethod(node: Method): void {
    if (this.inScope) this.check(node);
    super.visitMethod(node);
  }

  visitProcedure(node: Procedure): void {
    if (this.inScope) this.check(node);
    super.visitProcedure(node);
  }

  visitRule(node: Rule): void {
    if (this.inScope) this.check(node);
    super.visitRule(node);
  }

  visitFact(node: Fact): void {
    if (this.inScope) this.check(node);
    super.visitFact(node);
  }

  visitVariable(node: Variable): void {
    this.check(node);
  }

  visitAttribute(node: Attribute): void {
    this.check(node);
  }

  visitTypeAlias(node: TypeAlias): void {
    this.check(node);
  }

  visitTypeSignature(node: TypeSignature): void {
    this.check(node);
  }
}
@AutoScoped
export class DeclaresComputation extends ScopedVisitor {
  private readonly callName: string;
  constructor(callName: string, scope?: string) {
    super(scope);
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
@AutoScoped
export class DeclaresComputationWithArity extends ScopedVisitor {
  private readonly targetBinding: string;
  private readonly targetArity: number;
  constructor(targetBinding: string, targetArity: number, scope?: string) {
    super(scope);
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
@AutoScoped
export class DeclaresFunction extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope?: string) {
    super(scope);
    this.targetBinding = targetBinding;
  }
  visitFunction(node: Function): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class DeclaresRecursively extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope?: string) {
    super(scope);
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
export class HasDirectRecursion extends TraverseVisitor {
  private isInsideBody: boolean = false;
  constructor(private readonly binding: string) {
    super();
  }

  override visitFunction(node: Function): void {
    if (node.identifier.value !== this.binding) return;
    this.traverseCollection(node.equations);
  }

  override visitEquation(node: Equation): void {
    this.isInsideBody = true;
    try {
      if (isUnguardedBody(node.body)) {
        node.body.accept(this);
      } else {
        this.traverseCollection(node.body);
      }
    } finally {
      this.isInsideBody = false;
    }
  }

  visitSymbolPrimitive(node: SymbolPrimitive): void {
    if (this.isInsideBody && node.value === this.binding)
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
@AutoScoped
export class DeclaresVariable extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope?: string) {
    super(scope);
    this.targetBinding = targetBinding;
  }
  visitVariable(node: Variable): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class Raises extends ScopedVisitor {
  constructor(scope: string) {
    super(scope);
  }
  visitRaise(node: Raise): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class Uses extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope?: string) {
    super(scope);
    this.targetBinding = targetBinding;
  }
  visitSymbolPrimitive(node: SymbolPrimitive): void {
    if (node.value === this.targetBinding) throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesArithmetic extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): void {
    throw new StopTraversalException();
  }
  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesConditional extends ScopedVisitor {
  visitIf(node: If): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesLogic extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    throw new StopTraversalException();
  }
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesPrint extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitPrint(node: Print): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesType extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope?: string) {
    super(scope);
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
@AutoScoped
export class HasBinding extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(scope?: string) {
    super(scope);
    this.targetBinding = scope;
  }
  visitFunction(node: Function): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitObject(node: Object): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitClass(node: Class): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitRule(node: Rule): void {
    if (node.identifier.value === this.targetBinding)
      throw new StopTraversalException();
  }
  visitFact(node: Fact): void {
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
  constructor(private typeName: string, private bindingName: string) {
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
    private paramIndex: number,
    private typeName: string,
    private bindingName: string
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
  constructor(private typeName: string, private bindingName: string) {
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

@AutoScoped
export class Rescues extends ScopedVisitor {
  constructor(private exceptionName: string, scope?: string) {
    super(scope);
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

@AutoScoped
export class UsesExceptionHandling extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitTry(node: Try): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesExceptions extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitTry(node: Try): void {
    return new UsesExceptionHandling(this.binding).visitTry(node);
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
  HasDirectRecursion: HasDirectRecursion,
  DeclaresTypeAlias: DeclaresTypeAlias,
  DeclaresTypeSignature: DeclaresTypeSignature,
  HasTypeSignature: DeclaresTypeSignature,
  DeclaresVariable: DeclaresVariable,
  Raises: Raises,
  Uses: Uses,
  HasUsage: Uses,
  UsesArithmetic: UsesArithmetic,
  SubordinatesDeclarationsTo: SubordinatesDeclarationsTo,
  SubordinatesDeclarationsToEntryPoint: SubordinatesDeclarationsToEntryPoint,
  TypesAs: TypesAs,
  TypesParameterAs: TypesParameterAs,
  TypesReturnAs: TypesReturnAs,
  UsesConditional: UsesConditional,
  HasConditional: UsesConditional,
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
