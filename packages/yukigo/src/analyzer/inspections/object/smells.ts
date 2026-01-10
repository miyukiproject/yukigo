import {
  ASTNode,
  Class,
  Interface,
  LogicalBinaryOperation,
  Method,
  NilPrimitive,
  Object,
  Return,
  StopTraversalException,
  StringPrimitive,
  TraverseVisitor,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";
import { Uses } from "../generic/generic.js";

class MethodCollector extends TraverseVisitor {
  private collectedMethods: Method[] = [];
  collect(node: Class | Object | Interface): Method[] {
    node.expression.accept(this);
    return this.collectedMethods;
  }
  visitMethod(node: Method) {
    this.collectedMethods.push(node);
  }
}

@AutoScoped
export class DoesNilTest extends ScopedVisitor {
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    if (
      node.left instanceof NilPrimitive ||
      node.right instanceof NilPrimitive
    ) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class DoesTypeTest extends ScopedVisitor {
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    if (
      node.left instanceof StringPrimitive ||
      node.right instanceof StringPrimitive
    ) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class ReturnsNil extends ScopedVisitor {
  visitReturn(node: Return): void {
    if (!Boolean(node.body) || node.body instanceof NilPrimitive)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasTooManyMethods extends ScopedVisitor {
  private counter: number;
  private readonly maxMethods: number;

  constructor(maxMethods: number = 10, scopeName?: string) {
    super(scopeName);
    this.maxMethods = maxMethods;
  }

  visitInterface(node: Interface): void {
    node.expression.accept(this);
    this.checkMethodCount();
    this.counter = 0;
  }

  visitClass(node: Class): void {
    node.expression.accept(this);
    this.checkMethodCount();
    this.counter = 0;
  }
  visitObject(node: Object): void {
    node.expression.accept(this);
    this.checkMethodCount();
    this.counter = 0;
  }

  visitMethod(node: Method): void {
    this.counter += 1;
  }

  private checkMethodCount(): void {
    if (this.counter > this.maxMethods) throw new StopTraversalException();
  }
}

@AutoScoped
export class OverridesEqualOrHashButNotBoth extends ScopedVisitor {
  visitClass(node: Class): void {
    const collector = new MethodCollector();
    const methods = collector.collect(node);
    const names = methods.map((m) => m.identifier.value);
    const hasEquals =
      names.includes("equals") ||
      names.includes("==") ||
      names.includes("eql?");

    const hasHash = names.includes("hashCode") || names.includes("hash");

    if ((hasEquals && !hasHash) || (!hasEquals && hasHash))
      throw new StopTraversalException();
  }
}

@AutoScoped
export class UsesNamedSelfReference extends ScopedVisitor {
  visitObject(node: Object): void {
    this.checkSelfReference(node.identifier.value, node.expression);
  }

  visitClass(node: Class): void {
    this.checkSelfReference(node.identifier.value, node.expression);
  }

  private checkSelfReference(selfName: string, body: ASTNode): void {
    const checker = new Uses(selfName, this.binding);

    try {
      body.accept(checker);
    } catch (e) {
      if (e instanceof StopTraversalException)
        throw new StopTraversalException();
      throw e;
    }
  }
}

export const objectSmells: Record<string, VisitorConstructor> = {
  DoesNilTest: DoesNilTest,
  DoesTypeTest: DoesTypeTest,
  HasTooManyMethods: HasTooManyMethods,
  OverridesEqualOrHashButNotBoth: OverridesEqualOrHashButNotBoth,
  ReturnsNil: ReturnsNil,
  UsesNamedSelfReference: UsesNamedSelfReference,
};
