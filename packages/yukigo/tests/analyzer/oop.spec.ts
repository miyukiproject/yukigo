import { expect } from "chai";
import {
  Class,
  Method,
  Send,
  Self,
  SymbolPrimitive,
  Attribute,
  New,
  Include,
  Interface,
  Object as AstObject,
  PrimitiveMethod,
  Implement,
  ASTNode,
  Equation,
  UnguardedBody,
  Sequence,
  NilPrimitive,
  Statement,
  Print,
  StringPrimitive,
} from "yukigo-ast";
import {
  DeclaresAttribute,
  DeclaresClass,
  DeclaresInterface,
  DeclaresMethod,
  DeclaresObject,
  DeclaresPrimitive,
  DeclaresSuperclass,
  Implements,
  IncludeMixin,
  Instantiates,
  UsesDynamicPolymorphism,
  UsesInheritance,
  UsesMixins,
  UsesObjectComposition,
  UsesStaticMethodOverload,
  UsesDynamicMethodOverload,
  UsesTemplateMethod,
} from "../../src/analyzer/inspections/object.js";
import { executeVisitor } from "../../src/analyzer/utils.js";

describe("OOP Spec", () => {
  const createSymbol = (name: string) => new SymbolPrimitive(name);
  const createMethod = (
    name: string,
    equationsCount: number = 1,
    isAbstract: boolean = false,
    bodyNode?: Statement
  ): Method => {
    const identifier = createSymbol(name);
    const stmts = bodyNode ? [bodyNode] : [];
    const equations = new Array(equationsCount).fill(
      new Equation([], new UnguardedBody(new Sequence(stmts)))
    );
    const method = new Method(identifier, equations);
    method.setMetadata("isAbstract", isAbstract);
    return method;
  };

  const createAttribute = (
    name: string,
    expression: any = new NilPrimitive(null)
  ) => {
    return new Attribute(createSymbol(name), expression);
  };

  const createNew = (className: string) => {
    return new New(createSymbol(className), []);
  };

  const createClass = (
    name: string,
    stmts: Statement[] = [],
    extendsName?: string,
    implementsName?: string
  ): Class => {
    const identifier = createSymbol(name);
    const extendsSymbol = extendsName ? createSymbol(extendsName) : undefined;
    const implementsNode = implementsName
      ? new Implement(createSymbol(implementsName))
      : undefined;

    const expression = new Sequence(stmts);

    return new Class(identifier, extendsSymbol, implementsNode, expression);
  };

  const createObject = (name: string, children: ASTNode[] = []) => {
    const identifier = createSymbol(name);
    const expression = {
      accept: (visitor: any) => {
        children.forEach((child) => child.accept(visitor));
      },
      toJSON: () => ({}),
    } as any;
    return new AstObject(identifier, expression);
  };

  describe("DeclaresAttribute", () => {
    it("should detect if an attribute with the specific name is declared", () => {
      const attr = createAttribute("energy");
      const visitor = new DeclaresAttribute("energy");
      expect(executeVisitor(attr, visitor)).to.eq(true);
    });

    it("should ignore attributes with different names", () => {
      const attr = createAttribute("life");
      const visitor = new DeclaresAttribute("energy");
      expect(executeVisitor(attr, visitor)).to.eq(false);
    });
  });

  describe("DeclaresClass", () => {
    it("should detect specific class declaration", () => {
      const node = createClass("Bird");
      const visitor = new DeclaresClass("Bird");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("DeclaresInterface", () => {
    it("should detect specific interface declaration", () => {
      const node = new Interface(createSymbol("Flyable"), [], {} as any);
      const visitor = new DeclaresInterface("Flyable");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("DeclaresMethod", () => {
    it("should detect specific method declaration", () => {
      const node = createMethod("fly");
      const visitor = new DeclaresMethod("fly");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("DeclaresObject", () => {
    it("should detect specific object declaration", () => {
      const node = createObject("pepita");
      const visitor = new DeclaresObject("pepita");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("DeclaresPrimitive", () => {
    it("should detect primitive operator override", () => {
      const op: any = "==";
      const node = new PrimitiveMethod(op, [], undefined as any);
      const visitor = new DeclaresPrimitive("==");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("DeclaresSuperclass", () => {
    it("should detect if a class extends a specific superclass", () => {
      const node = createClass("Sparrow", [], "Bird");
      const visitor = new DeclaresSuperclass("Bird");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("Implements", () => {
    it("should detect if a class implements a specific interface", () => {
      const node = createClass("Pigeon", [], undefined, "Messenger");
      const visitor = new Implements("Messenger");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("IncludeMixin", () => {
    it("should detect usage of a specific mixin", () => {
      const node = new Include(createSymbol("Walking"));
      const visitor = new IncludeMixin("Walking");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("Instantiates", () => {
    it("should detect instantiation of a specific class", () => {
      const node = createNew("Engine");
      const visitor = new Instantiates("Engine");
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("UsesDynamicPolymorphism", () => {
    it("should detect when a method name is used in at least two different places (polymorphism)", () => {
      const method1 = createMethod("fly");
      const method2 = createMethod("fly");

      const class1 = createClass("Bird", [method1]);
      const class2 = createClass("Airplane", [method2]);

      const visitor = new UsesDynamicPolymorphism("fly");

      executeVisitor(class1, visitor);

      expect(executeVisitor(class2, visitor)).to.eq(true);
    });

    it("should not throw if only one method is found", () => {
      const method1 = createMethod("fly");
      const class1 = createClass("Bird", [method1]);
      const visitor = new UsesDynamicPolymorphism("fly");

      expect(executeVisitor(class1, visitor)).to.eq(false);
    });
  });

  describe("UsesInheritance", () => {
    it("should detect inheritance in classes", () => {
      const node = createClass("Child", [], "Parent");
      const visitor = new UsesInheritance();
      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should detect inheritance in interfaces", () => {
      const node = new Interface(
        createSymbol("IChild"),
        [createSymbol("IParent")],
        {} as any
      );
      const visitor = new UsesInheritance();
      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should ignore classes without parent", () => {
      const node = createClass("Orphan");
      const visitor = new UsesInheritance();
      expect(executeVisitor(node, visitor)).to.eq(false);
    });
  });

  describe("UsesMixins", () => {
    it("should detect any mixin usage", () => {
      const node = new Include(createSymbol("AnyMixin"));
      const visitor = new UsesMixins();
      expect(executeVisitor(node, visitor)).to.eq(true);
    });
  });

  describe("UsesObjectComposition", () => {
    it("should detect composition when an attribute is initialized with New", () => {
      const instantiation = createNew("Engine");
      const attr = createAttribute("myEngine", instantiation);
      const visitor = new UsesObjectComposition();
      expect(executeVisitor(attr, visitor)).to.eq(true);
    });

    it("should ignore attributes initialized with literals", () => {
      const attr = createAttribute(
        "energy",
        new StringPrimitive("Initialized with string!")
      );
      const visitor = new UsesObjectComposition();
      expect(executeVisitor(attr, visitor)).to.eq(false);
    });
  });

  describe("UsesStaticMethodOverload", () => {
    it("should detect two methods with the same name in the same class", () => {
      const m1 = createMethod("calculate");
      const m2 = createMethod("calculate");
      const classNode = createClass("Calculator", [m1, m2]);

      const visitor = new UsesStaticMethodOverload();
      expect(executeVisitor(classNode, visitor)).to.eq(true);
    });

    it("should NOT detect overload if methods are in different classes", () => {
      const m1 = createMethod("calculate");
      const m2 = createMethod("calculate");

      const classA = createClass("A", [m1]);
      const classB = createClass("B", [m2]);

      const visitor = new UsesStaticMethodOverload();

      executeVisitor(classA, visitor);

      expect(executeVisitor(classB, visitor)).to.eq(false);
    });
  });

  describe("UsesDynamicMethodOverload", () => {
    it("should detect a method with multiple equations (pattern matching)", () => {
      const method = createMethod("fibonacci", 2);
      const visitor = new UsesDynamicMethodOverload();
      expect(executeVisitor(method, visitor)).to.eq(true);
    });

    it("should ignore methods with a single equation", () => {
      const method = createMethod("fibonacci", 1);
      const visitor = new UsesDynamicMethodOverload();
      expect(executeVisitor(method, visitor)).to.eq(false);
    });
  });

  describe("UsesTemplateMethod", () => {
    it("should detect template method usage (call to undeclared method on self)", () => {
      const declaredMethod = createMethod("abstractMethod", 1, true);
      const sendToSelf = new Send(
        new Self(),
        createSymbol("abstractMethod"),
        []
      );

      const templateMethod = createMethod("process", 1, false, sendToSelf);
      const classNode = createClass("MyClass", [
        declaredMethod,
        templateMethod,
      ]);

      const visitor = new UsesTemplateMethod();
      expect(executeVisitor(classNode, visitor)).to.eq(true);
    });

    it("should NOT detect if calling a declared method on self", () => {
      const declaredMethod = createMethod(
        "declared",
        1,
        false,
        new Print(new StringPrimitive("This method is Declared"))
      );
      const sendToSelf = new Send(new Self(), createSymbol("declared"), []);

      const method = createMethod("process", 1, false, sendToSelf);

      const classNode = createClass("MyClass", [declaredMethod, method]);

      const visitor = new UsesTemplateMethod();
      expect(executeVisitor(classNode, visitor)).to.eq(false);
    });
  });
});
