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
import { VisitorConstructor } from "../utils.js";

export class DeclaresAttribute extends TraverseVisitor {
  constructor(private attributeName: string) {
    super();
  }
  visitAttribute(node: Attribute): void {
    if (node.identifier.value === this.attributeName)
      throw new StopTraversalException();
  }
}

export class DeclaresClass extends TraverseVisitor {
  constructor(private className: string) {
    super();
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

export class DeclaresMethod extends TraverseVisitor {
  constructor(private methodName: string) {
    super();
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

export class DeclaresPrimitive extends TraverseVisitor {
  constructor(private operatorName: string) {
    super();
  }
  visitPrimitiveMethod(node: PrimitiveMethod): void {
    if (node.operator === this.operatorName) throw new StopTraversalException();
  }
}

export class DeclaresSuperclass extends TraverseVisitor {
  constructor(private superclassName: string) {
    super();
  }
  visitClass(node: Class): void {
    if (node.extendsSymbol && node.extendsSymbol.value === this.superclassName)
      throw new StopTraversalException();
  }
}

export class Implements extends TraverseVisitor {
  constructor(private interfaceName: string) {
    super();
  }
  visitClass(node: Class): void {
    if (
      node.implementsNode &&
      node.implementsNode.identifier.value === this.interfaceName
    )
      throw new StopTraversalException();
  }
}

export class IncludeMixin extends TraverseVisitor {
  constructor(private mixinsName: string) {
    super();
  }
  visitClass(node: Class): void {
    if (node.includes.some((sym) => sym.value === this.mixinsName))
      throw new StopTraversalException();
  }
}

export class Instantiates extends TraverseVisitor {
  constructor(private className: string) {
    super();
  }
  visitNew(node: New): void {
    if (node.identifier.value === this.className)
      throw new StopTraversalException();
  }
}

export class UsesDynamicPolymorphism extends TraverseVisitor {
  private count = 0;

  constructor(private selectorName: string) {
    super();
  }

  visitMethod(node: Method): void {
    if (node.identifier.value === this.selectorName) {
      this.count++;
      if (this.count >= 2) throw new StopTraversalException();
    }
  }
}

export class UsesInheritance extends TraverseVisitor {
  visitClass(node: Class): void {
    if (node.extendsSymbol) throw new StopTraversalException();
  }
  visitInterface(node: Interface): void {
    if (node.extendsSymbol && node.extendsSymbol.length > 0)
      throw new StopTraversalException();
  }
}

export class UsesMixins extends TraverseVisitor {
  visitClass(node: Class): void {
    if (node.includes.length > 0) throw new StopTraversalException();
  }
}

export class UsesObjectComposition extends TraverseVisitor {
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

export class UsesDynamicMethodOverload extends TraverseVisitor {
  visitMethod(node: Method): void {
    if (node.equations.length > 1) throw new StopTraversalException();
  }
}

class AbstractMethodCollector extends TraverseVisitor {
  public abstractMethods: Set<string> = new Set();

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

export class UsesTemplateMethod extends TraverseVisitor {
  private abstractMethodsStack: Set<string>[] = [];

  visitClass(node: Class): void {
    const collector = new AbstractMethodCollector();
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
