import { expect } from "chai";
import {
  Class,
  Method,
  Send,
  Self,
  SymbolPrimitive,
  Attribute,
  New,
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
  Variable,
} from "yukigo-ast";
import { Analyzer, InspectionRule } from "../../src/analyzer/index.js";

describe("OOP Inspections", () => {
  const createSymbol = (name: string) => new SymbolPrimitive(name);
  const analyzer = new Analyzer();

  const runSingleRule = (
    ast: any[],
    inspection: string,
    expected: boolean,
    binding?: string,
    args: string[] = []
  ) => {
    const rule: InspectionRule = { inspection, binding, args, expected };
    const results = analyzer.analyze(ast, [rule]);
    const result = results[0];
    return result.passed;
  };

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
    implementsName?: string,
    includes?: string[]
  ): Class => {
    const identifier = createSymbol(name);
    const extendsSymbol = extendsName ? createSymbol(extendsName) : undefined;
    const implementsNode = implementsName
      ? new Implement(createSymbol(implementsName))
      : undefined;
    const includesMixin =
      includes && includes.length > 0
        ? includes.map((sym) => createSymbol(sym))
        : undefined;

    const expression = new Sequence(stmts);

    return new Class(
      identifier,
      extendsSymbol,
      implementsNode,
      includesMixin,
      expression
    );
  };

  const createObject = (name: string, children: Statement[] = []) => {
    const identifier = createSymbol(name);
    const expression = new Sequence(children);
    return new AstObject(identifier, expression);
  };

  describe("DeclaresAttribute", () => {
    it("should detect if an attribute with the specific name is declared", () => {
      const attr = createAttribute("energy");
      const ast = [createClass("A", [attr])];
      expect(
        runSingleRule(ast, "DeclaresAttribute", true, undefined, ["energy"])
      ).to.be.true;
    });

    it("should ignore attributes with different names", () => {
      const attr = createAttribute("life");
      const ast = [createClass("A", [attr])];
      expect(
        runSingleRule(ast, "DeclaresAttribute", false, undefined, ["energy"])
      ).to.be.true;
    });
  });

  describe("DeclaresClass", () => {
    it("should detect specific class declaration", () => {
      const ast = [createClass("Bird")];
      expect(runSingleRule(ast, "DeclaresClass", true, "Bird")).to.be.true;
    });
  });

  describe("DeclaresInterface", () => {
    it("should detect specific interface declaration", () => {
      const ast = [
        new Interface(createSymbol("Flyable"), [], new Sequence([])),
      ];
      expect(runSingleRule(ast, "DeclaresInterface", true, "Flyable")).to.be
        .true;
    });
  });

  describe("DeclaresMethod", () => {
    it("should detect specific method declaration", () => {
      const ast = [createMethod("fly")];
      expect(runSingleRule(ast, "DeclaresMethod", true, "fly")).to.be.true;
    });
  });

  describe("DeclaresObject", () => {
    it("should detect specific object declaration", () => {
      const ast = [createObject("pepita")];
      expect(runSingleRule(ast, "DeclaresObject", true, "pepita")).to.be.true;
    });
  });

  describe("DeclaresPrimitive", () => {
    it("should detect primitive operator override", () => {
      const op: any = "==";
      const ast = [new PrimitiveMethod(op, [], undefined)];
      expect(runSingleRule(ast, "DeclaresPrimitive", true, undefined, ["=="]))
        .to.be.true;
    });
  });

  describe("DeclaresSuperclass", () => {
    it("should detect if a class extends a specific superclass", () => {
      const ast = [createClass("Sparrow", [], "Bird")];
      expect(
        runSingleRule(ast, "DeclaresSuperclass", true, undefined, ["Bird"])
      ).to.be.true;
    });
  });

  describe("Implements", () => {
    it("should detect if a class implements a specific interface", () => {
      const ast = [createClass("Pigeon", [], undefined, "Messenger")];
      expect(runSingleRule(ast, "Implements", true, undefined, ["Messenger"]))
        .to.be.true;
    });
  });

  describe("IncludeMixin", () => {
    it("should detect usage of a specific mixin", () => {
      const ast = [
        createClass("ClassWithMixin", [], undefined, undefined, ["Walking"]),
      ];
      expect(runSingleRule(ast, "IncludeMixin", true, undefined, ["Walking"]))
        .to.be.true;
    });
  });

  describe("Instantiates", () => {
    it("should detect instantiation of a specific class", () => {
      const ast = [new Variable(new SymbolPrimitive("a"), createNew("Engine"))];
      expect(runSingleRule(ast, "Instantiates", true, undefined, ["Engine"])).to
        .be.true;
    });
  });

  describe("UsesDynamicPolymorphism", () => {
    it("should detect when a method name is used in at least two different places (polymorphism)", () => {
      const method1 = createMethod("fly");
      const method2 = createMethod("fly");
      const class1 = createClass("Bird", [method1]);
      const class2 = createClass("Airplane", [method2]);
      const ast = [class1, class2];
      expect(runSingleRule(ast, "UsesDynamicPolymorphism", true, undefined, ["fly"]))
        .to.be.true;
    });

    it("should not throw if only one method is found", () => {
      const method1 = createMethod("fly");
      const class1 = createClass("Bird", [method1]);
      const ast = [class1];
      expect(runSingleRule(ast, "UsesDynamicPolymorphism", false, "fly")).to.be
        .true;
    });
  });

  describe("UsesInheritance", () => {
    it("should detect inheritance in classes", () => {
      const ast = [createClass("Child", [], "Parent")];
      expect(runSingleRule(ast, "UsesInheritance", true)).to.be.true;
    });

    it("should detect inheritance in interfaces", () => {
      const ast = [
        new Interface(
          createSymbol("IChild"),
          [createSymbol("IParent")],
          new Sequence([])
        ),
      ];
      expect(runSingleRule(ast, "UsesInheritance", true)).to.be.true;
    });

    it("should ignore classes without parent", () => {
      const ast = [createClass("Orphan")];
      expect(runSingleRule(ast, "UsesInheritance", false)).to.be.true;
    });
  });

  describe("UsesMixins", () => {
    it("should detect any mixin usage", () => {
      const ast = [
        createClass("ClassWithMixin", [], undefined, undefined, ["AnyMixin"]),
      ];
      expect(runSingleRule(ast, "UsesMixins", true)).to.be.true;
    });
  });

  describe("UsesObjectComposition", () => {
    it("should detect composition when an attribute is initialized with New", () => {
      const instantiation = createNew("Engine");
      const attr = createAttribute("myEngine", instantiation);
      const ast = [createClass("A", [attr])];
      expect(runSingleRule(ast, "UsesObjectComposition", true)).to.be.true;
    });

    it("should ignore attributes initialized with literals", () => {
      const attr = createAttribute(
        "energy",
        new StringPrimitive("Initialized with string!")
      );
      const ast = [createClass("A", [attr])];
      expect(runSingleRule(ast, "UsesObjectComposition", false)).to.be.true;
    });
  });

  describe("UsesStaticMethodOverload", () => {
    it("should detect two methods with the same name in the same class", () => {
      const m1 = createMethod("calculate");
      const m2 = createMethod("calculate");
      const ast = [createClass("Calculator", [m1, m2])];
      expect(runSingleRule(ast, "UsesStaticMethodOverload", true)).to.be.true;
    });

    it("should NOT detect overload if methods are in different classes", () => {
      const m1 = createMethod("calculate");
      const m2 = createMethod("calculate");
      const classA = createClass("A", [m1]);
      const classB = createClass("B", [m2]);
      const ast = [classA, classB];
      expect(runSingleRule(ast, "UsesStaticMethodOverload", false)).to.be.true;
    });
  });

  describe("UsesDynamicMethodOverload", () => {
    it("should detect a method with multiple equations (pattern matching)", () => {
      const ast = [createMethod("fibonacci", 2)];
      expect(runSingleRule(ast, "UsesDynamicMethodOverload", true)).to.be.true;
    });

    it("should ignore methods with a single equation", () => {
      const ast = [createMethod("fibonacci", 1)];
      expect(runSingleRule(ast, "UsesDynamicMethodOverload", false)).to.be.true;
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
      const ast = [createClass("MyClass", [declaredMethod, templateMethod])];
      expect(runSingleRule(ast, "UsesTemplateMethod", true)).to.be.true;
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
      const ast = [createClass("MyClass", [declaredMethod, method])];
      expect(runSingleRule(ast, "UsesTemplateMethod", false)).to.be.true;
    });
  });
});
