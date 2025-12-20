import {
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  Assignment,
  ASTNode,
  Attribute,
  Call,
  Catch,
  EntryPoint,
  Fact,
  Function,
  If,
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
  TypeAlias,
  TypeSignature,
  TypeVar,
  Variable,
  VariablePattern,
} from "yukigo-ast";
import { VisitorConstructor } from "../utils.js";

// sexy af
export function AutoScoped<T extends { new (...args: any[]): any }>(
  constructor: T
) {
  const proto = constructor.prototype;
  const methodNames = Object.getOwnPropertyNames(proto);

  const isValidVisitMethod = (name: string) =>
    name.startsWith("visit") &&
    name !== "constructor" &&
    !isScopeBoundary(name);

  for (const name of methodNames) {
    if (isValidVisitMethod) {
      const originalMethod = proto[name];
      proto[name] = function (this: any, node: any) {
        if (!this.inScope) return;
        return originalMethod.call(this, node);
      };
    }
  }
}

// avoid double wrap on these
function isScopeBoundary(name: string): boolean {
  return [
    "visitFunction",
    "visitMethod",
    "visitProcedure",
    "visitRule",
    "visitFact",
  ].includes(name);
}

export class ScopedVisitor extends TraverseVisitor {
  protected readonly targetScopeName?: string;
  public inScope: boolean;

  constructor(scopeName?: string) {
    super();
    this.targetScopeName = scopeName;
    this.inScope = !scopeName;
  }

  protected isInsideScope(): boolean {
    return this.inScope;
  }

  visitFunction(node: Function): void {
    this.manageScope(node, () => super.visitFunction(node));
  }

  visitMethod(node: Method): void {
    this.manageScope(node, () => super.visitMethod(node));
  }

  visitProcedure(node: Procedure): void {
    this.manageScope(node, () => super.visitProcedure(node));
  }

  visitRule(node: Rule): void {
    this.manageScope(node, () => super.visitRule(node));
  }

  visitFact(node: Fact): void {
    this.manageScope(node, () => super.visitFact(node));
  }

  private manageScope(node: any, traverse: () => void) {
    const isTarget = node.identifier.value === this.targetScopeName;
    if (isTarget) this.inScope = true;
    traverse();
    if (isTarget) this.inScope = false;
  }
}

@AutoScoped
export class Assigns extends ScopedVisitor {
  private readonly targetIdentifier: string;
  constructor(targetIdentifier: string, scopeName?: string) {
    super(scopeName);
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
  constructor(targetCallee: string, scopeName?: string) {
    super(scopeName);
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
  visit(node: ASTNode): void {
    if (
      "identifier" in node &&
      node.identifier instanceof SymbolPrimitive &&
      node.identifier.value === this.targetIdentifier
    )
      throw new StopTraversalException();
  }
}
@AutoScoped
export class DeclaresComputation extends ScopedVisitor {
  private readonly callName: string;
  constructor(callName: string, scopeName?: string) {
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
@AutoScoped
export class DeclaresComputationWithArity extends ScopedVisitor {
  private readonly targetBinding: string;
  private readonly targetArity: number;
  constructor(targetBinding: string, targetArity: number, scopeName?: string) {
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
@AutoScoped
export class DeclaresFunction extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope: string) {
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
  constructor(targetBinding: string, scope: string) {
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
  constructor(targetBinding: string, scope: string) {
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
  constructor(targetBinding: string, scope: string) {
    super(scope);
    this.targetBinding = targetBinding;
  }
  visitSymbolPrimitive(node: SymbolPrimitive): void {
    if (node.value === this.targetBinding) throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesArithmetic extends ScopedVisitor {
  constructor(scope: string) {
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
  constructor(scope: string) {
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
  constructor(scope: string) {
    super(scope);
  }
  visitPrint(node: Print): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesType extends ScopedVisitor {
  private readonly targetBinding: string;
  constructor(targetBinding: string, scope: string) {
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
  constructor(targetBinding: string, scope: string) {
    super(scope);
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
  constructor(private exceptionName: string, scope: string) {
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
  constructor(scope: string) {
    super(scope);
  }
  visitTry(node: Try): void {
    throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesExceptions extends ScopedVisitor {
  constructor(scope: string) {
    super(scope);
  }
  visitTry(node: Try): void {
    return new UsesExceptionHandling(this.targetScopeName).visitTry(node);
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
