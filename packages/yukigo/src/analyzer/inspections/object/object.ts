import {
  Attribute,
  Class,
  Interface,
  Method,
  New,
  Object,
  PrimitiveMethod,
  Self,
  Send,
  StopTraversalException,
  SymbolPrimitive,
  TraverseVisitor,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";
@AutoScoped
export class DeclaresAttribute extends ScopedVisitor {
  constructor(private attributeName: string, scope?: string) {
    super(scope);
  }
  visitAttribute(node: Attribute): void {
    if (node.identifier.value === this.attributeName)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class DeclaresClass extends ScopedVisitor {
  constructor(private className: string, scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (node.identifier.value === this.className)
      throw new StopTraversalException();
  }
}

export class DeclaresInterface extends TraverseVisitor {
  constructor(private interfaceName: string) {
    super();
  }
  visitInterface(node: Interface): void {
    if (node.identifier.value === this.interfaceName)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class DeclaresMethod extends ScopedVisitor {
  constructor(private methodName: string, scope?: string) {
    super(scope);
  }
  visitMethod(node: Method): void {
    if (node.identifier.value === this.methodName)
      throw new StopTraversalException();
  }
}

export class DeclaresObject extends TraverseVisitor {
  constructor(private objectName: string) {
    super();
  }
  visitObject(node: Object): void {
    if (node.identifier.value === this.objectName)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class DeclaresPrimitive extends ScopedVisitor {
  constructor(private operatorName: string, scope?: string) {
    super(scope);
  }
  visitPrimitiveMethod(node: PrimitiveMethod): void {
    if (node.operator === this.operatorName) throw new StopTraversalException();
  }
}
@AutoScoped
export class DeclaresSuperclass extends ScopedVisitor {
  constructor(private superclassName: string, scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (node.extendsSymbol && node.extendsSymbol.value === this.superclassName)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class Implements extends ScopedVisitor {
  constructor(private interfaceName: string, scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (
      node.implementsNode &&
      node.implementsNode.identifier.value === this.interfaceName
    )
      throw new StopTraversalException();
  }
}
@AutoScoped
export class IncludeMixin extends ScopedVisitor {
  constructor(private mixinsName: string, scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (node.includes.some((sym) => sym.value === this.mixinsName))
      throw new StopTraversalException();
  }
}
@AutoScoped
export class Instantiates extends ScopedVisitor {
  constructor(private className: string, scope?: string) {
    super(scope);
  }
  visitNew(node: New): void {
    if (node.identifier.value === this.className)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesDynamicPolymorphism extends ScopedVisitor {
  private count = 0;

  constructor(private selectorName: string, scope?: string) {
    super(scope);
  }

  visitMethod(node: Method): void {
    if (node.identifier.value === this.selectorName) {
      this.count++;
      if (this.count >= 2) throw new StopTraversalException();
    }
  }
}
@AutoScoped
export class UsesInheritance extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (node.extendsSymbol) throw new StopTraversalException();
  }
  visitInterface(node: Interface): void {
    if (node.extendsSymbol && node.extendsSymbol.length > 0)
      throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesMixins extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    if (node.includes.length > 0) throw new StopTraversalException();
  }
}
@AutoScoped
export class UsesObjectComposition extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }
  visitAttribute(node: Attribute): void {
    if (node.expression instanceof New) throw new StopTraversalException();
  }
}

export class UsesStaticMethodOverload extends TraverseVisitor {
  private scopes: Set<string>[] = [];
  visitClass(node: Class): void {
    this.scopes.push(new Set());
    node.expression.accept(this);
    this.scopes.pop();
  }
  visitObject(node: Object): void {
    this.scopes.push(new Set());
    node.expression.accept(this);
    this.scopes.pop();
  }

  visitMethod(node: Method): void {
    const currentScope = this.scopes[0];
    const methodName = node.identifier.value;

    if (currentScope.has(methodName)) throw new StopTraversalException();
    currentScope.add(methodName);
  }
}
@AutoScoped
export class UsesDynamicMethodOverload extends ScopedVisitor {
  constructor(scope?: string) {
    super(scope);
  }

  visitMethod(node: Method): void {
    if (node.equations.length > 1) throw new StopTraversalException();
  }
}
@AutoScoped
class AbstractMethodCollector extends ScopedVisitor {
  public abstractMethods: Set<string> = new Set();
  constructor(scope?: string) {
    super(scope);
  }
  visitMethod(node: Method): void {
    if (node.getMetadata<boolean>("isAbstract") === true)
      this.abstractMethods.add(node.identifier.value);
  }
  // stop propagation to not mix scopes
  visitClass(node: Class) {
    return;
  }
  visitObject(node: Object) {
    return;
  }
}
@AutoScoped
export class UsesTemplateMethod extends ScopedVisitor {
  private abstractMethodsStack: Set<string>[] = [];
  constructor(scope?: string) {
    super(scope);
  }
  visitClass(node: Class): void {
    const collector = new AbstractMethodCollector(this.binding);
    if (node.expression) node.expression.accept(collector);
    this.abstractMethodsStack.push(collector.abstractMethods);
    node.expression.accept(this);
    this.abstractMethodsStack.pop();
  }

  visitSend(node: Send): void {
    if (node.receiver instanceof Self) {
      if (this.abstractMethodsStack.length === 0) return;
      const currentAbstractMethods = this.abstractMethodsStack[0];

      // This doesnt match if message is complex expression
      if (!(node.selector instanceof SymbolPrimitive)) return;
      const selectorName = node.selector.value;

      const isMessageAbstract = currentAbstractMethods.has(selectorName);

      if (isMessageAbstract) throw new StopTraversalException();
    }
  }
}

export const objectInspections: Record<string, VisitorConstructor> = {
  DeclaresAttribute: DeclaresAttribute,
  DeclaresClass: DeclaresClass,
  DeclaresInterface: DeclaresInterface,
  DeclaresMethod: DeclaresMethod,
  DeclaresObject: DeclaresObject,
  DeclaresPrimitive: DeclaresPrimitive,
  DeclaresSuperclass: DeclaresSuperclass,
  Implements: Implements,
  IncludeMixin: IncludeMixin,
  Inherits: DeclaresSuperclass, // alias for DeclaresSuperclass
  Instantiates: Instantiates,
  UsesDynamicPolymorphism: UsesDynamicPolymorphism,
  UsesInheritance: UsesInheritance,
  UsesMixins: UsesMixins,
  UsesObjectComposition: UsesObjectComposition,
  UsesStaticMethodOverload: UsesStaticMethodOverload,
  UsesDynamicMethodOverload: UsesDynamicMethodOverload,
  UsesTemplateMethod: UsesTemplateMethod,
  UsesStaticPolymorphism: UsesStaticMethodOverload, // alias for UsesStaticMethodOverload
};
