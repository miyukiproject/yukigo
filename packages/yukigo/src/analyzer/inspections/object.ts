import {
  Attribute,
  Class,
  Include,
  Interface,
  Method,
  New,
  Object,
  PrimitiveMethod,
  StopTraversalException,
  TraverseVisitor,
} from "@yukigo/ast";
import { executeVisitor, InspectionMap } from "../index.js";

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
    super.visitClass(node);
  }
}

export class DeclaresInterface extends TraverseVisitor {
  constructor(private interfaceName: string) {
    super();
  }
  visitInterface(node: Interface): void {
    if (node.identifier.value === this.interfaceName)
      throw new StopTraversalException();
    super.visitInterface(node);
  }
}

export class DeclaresMethod extends TraverseVisitor {
  constructor(private methodName: string) {
    super();
  }
  visitMethod(node: Method): void {
    if (node.identifier.value === this.methodName)
      throw new StopTraversalException();
    super.visitMethod(node);
  }
}

export class DeclaresObject extends TraverseVisitor {
  constructor(private objectName: string) {
    super();
  }
  visitObject(node: Object): void {
    if (node.identifier.value === this.objectName)
      throw new StopTraversalException();
    super.visitObject(node);
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
    super.visitClass(node);
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
    super.visitClass(node);
  }
}

export class IncludeMixin extends TraverseVisitor {
  constructor(private mixinsName: string) {
    super();
  }
  visitInclude(node: Include): void {
    if (node.identifier.value === this.mixinsName)
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
    super.visitNew(node);
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
    super.visitMethod(node);
  }
}

// --- Inspection Map ---

export const objectInspections: InspectionMap = {
  DeclaresAttribute: (node, args) =>
    executeVisitor(node, new DeclaresAttribute(args[0])),

  DeclaresClass: (node, args) =>
    executeVisitor(node, new DeclaresClass(args[0])),

  DeclaresInterface: (node, args) =>
    executeVisitor(node, new DeclaresInterface(args[0])),

  DeclaresMethod: (node, args) =>
    executeVisitor(node, new DeclaresMethod(args[0])),

  DeclaresObject: (node, args) =>
    executeVisitor(node, new DeclaresObject(args[0])),

  DeclaresPrimitive: (node, args) =>
    executeVisitor(node, new DeclaresPrimitive(args[0])),

  DeclaresSuperclass: (node, args) =>
    executeVisitor(node, new DeclaresSuperclass(args[0])),

  Implements: (node, args) => executeVisitor(node, new Implements(args[0])),

  Include: (node, args) => executeVisitor(node, new IncludeMixin(args[0])),

  Inherits: (node, args) =>
    executeVisitor(node, new DeclaresSuperclass(args[0])),

  Instantiates: (node, args) => executeVisitor(node, new Instantiates(args[0])),

  UsesDynamicPolymorphism: (node, args) =>
    executeVisitor(node, new UsesDynamicPolymorphism(args[0])),

  UsesDynamicMethodOverload: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesInheritance: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesMixins: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesObjectComposition: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesStaticMethodOverload: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesStaticPolymorphism: (node, args) => {
    throw Error("Inspection not implemented");
  },
  UsesTemplateMethod: (node, args) => {
    throw Error("Inspection not implemented");
  },
};
