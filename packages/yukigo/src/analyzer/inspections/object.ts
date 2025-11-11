import {
  Attribute,
  Class,
  Include,
  Interface,
  Method,
  New,
  Object,
} from "@yukigo/ast";
import { InspectionMap } from "../index.js";

export const objectInspections: InspectionMap = {
/*   DeclaresAttribute: (ast, args) => {
    const attributeName = args[0];
    let declares = false;
    traverse(ast, {
      Attribute: (node: Attribute) => {
        if (node.identifier.value === attributeName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresClass: (ast, args) => {
    const className = args[0];
    let declares = false;
    traverse(ast, {
      Class: (node: Class) => {
        if (node.identifier.value === className) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresInterface: (ast, args) => {
    const interfaceName = args[0];
    let declares = false;
    traverse(ast, {
      Interface: (node: Interface) => {
        if (node.identifier.value === interfaceName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresMethod: (ast, args) => {
    const methodName = args[0];
    let declares = false;
    traverse(ast, {
      Method: (node: Method) => {
        if (node.identifier.value === methodName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresObject: (ast, args) => {
    const objectName = args[0];
    let declares = false;
    traverse(ast, {
      Object: (node: Object) => {
        if (node.identifier.value === objectName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresPrimitive: (ast, args) => {
    const operatorName = args[0];
    let declares = false;
    traverse(ast, {
      PrimitiveMethod: (node: PrimitiveMethod) => {
        if (node.operator === operatorName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  DeclaresSuperclass: (ast, args) => {
    const superclassName = args[0];
    let declares = false;
    traverse(ast, {
      Class: (node: Class) => {
        if (node.extends.value === superclassName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  Implements: (ast, args) => {
    const interfaceName = args[0];
    let declares = false;
    traverse(ast, {
      Class: (node: Class) => {
        if (node.implements.value === interfaceName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  Include: (ast, args) => {
    const mixinsName = args[0];
    let declares = false;
    traverse(ast, {
      Include: (node: Include) => {
        if (node.identifier.value === mixinsName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  Inherits: (ast, args) => {
    const superclassName = args[0];
    let declares = false;
    traverse(ast, {
      Class: (node: Class) => {
        if (node.extends.value === superclassName) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  Instantiates: (ast, args) => {
    const className = args[0];
    let declares = false;
    traverse(ast, {
      New: (node: New) => {
        if (node.identifier.value === className) {
          declares = true;
          return true;
        }
      },
    });
    return { result: declares };
  },
  UsesDynamicPolymorphism: (ast, args) => {
    const selectorName = args[0];
    let count = 0;
    traverse(ast, {
      Method: (node: Method) => {
        if (node.identifier.value === selectorName) count++;
      },
    });
    return { result: count >= 2 };
  },
  UsesDynamicMethodOverload: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesInheritance: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesMixins: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesObjectComposition: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesStaticMethodOverload: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesStaticPolymorphism: (ast, args) => {
    throw Error("Inspection not implemented");
  },
  UsesTemplateMethod: (ast, args) => {
    throw Error("Inspection not implemented");
  }, */
};
