import { expect } from "chai";
import * as Yu from "yukigo-ast";
import { WollokToYukigoTransformer } from "../src/transformer";
import {
  Assignment,
  Body,
  Catch,
  Class,
  Field,
  If,
  Import,
  Literal,
  Method,
  Mixin,
  New,
  Node,
  Package,
  Parameter,
  Reference,
  Return,
  Send,
  Singleton,
  Super,
  Throw,
  Try,
  Variable,
} from "wollok-ts";

describe("WollokToYukigoTransformer", () => {
  let transformer: WollokToYukigoTransformer;

  beforeEach(() => {
    transformer = new WollokToYukigoTransformer();
  });

  const p = (members, imports?, sourceMap?) =>
    new Package({ name: "example", imports, members, sourceMap });
  const lit = (value, sourceMap?) => new Literal({ value, sourceMap });
  const ref = (name) => new Reference<any>({ name });
  const send = (receiver, message, args) =>
    new Send({ receiver, message, args });
  const met = (name, parameters: Parameter[], body) =>
    new Method({ name, parameters, body });
  const param = (name) => new Parameter({ name });
  const unguardedBody = (sentences) => new Body({ sentences });
  const singleton = (name, members) => new Singleton({ name, members });
  const wollokClass = (name, members) => new Class({ name, members });
  const ret = (value) => new Return({ value });
  const imp = (name) => new Import({ entity: ref(name) });
  const mixin = (name, members) => new Mixin({ name, members });
  const field = (name, isConstant: boolean, value?) =>
    new Field({ name, value, isConstant });
  const variable = (name, isConstant: boolean, value) =>
    new Variable({ name, value, isConstant });
  const assign = (variable, value) => new Assignment({ variable, value });
  const newExpr = (className, args) =>
    new New({ instantiated: ref(className), args });
  const ifStmt = (condition, thenBody, elseBody?) =>
    new If({ condition, thenBody, elseBody });
  const throwStmt = (exception) => new Throw({ exception });
  const catchClause = (parameter, body) => new Catch({ parameter, body });
  const tryStmt = (body, catches, always?) =>
    new Try({ body, catches, always });
  const superInv = (args) => new Super({ args });

  const transformNode = (node: Node) => {
    const pkg = p([node]);
    const resultAST = transformer.transform(pkg);
    return resultAST[0];
  };

  describe("Primitives/Literals", () => {
    it("should transform String literals to YuString", () => {
      const input = lit("Hello World");
      const result = transformNode(input) as Yu.StringPrimitive;

      expect(result).to.be.instanceOf(Yu.StringPrimitive);
      expect(result.value).to.equal("Hello World");
    });

    it("should transform Number literals to YuNumber", () => {
      const input = lit(42);
      const result = transformNode(input) as Yu.NumberPrimitive;

      expect(result).to.be.instanceOf(Yu.NumberPrimitive);
      expect(result.value).to.equal(42);
    });

    it("should transform Boolean literals to YuBoolean", () => {
      const input = lit(true);
      const result = transformNode(input) as Yu.BooleanPrimitive;

      expect(result).to.be.instanceOf(Yu.BooleanPrimitive);
      expect(result.value).to.be.true;
    });

    it("should transform null values to YuNil", () => {
      const input = lit(null);
      const result = transformNode(input) as Yu.NilPrimitive;

      expect(result).to.be.instanceOf(Yu.NilPrimitive);
    });
  });

  describe("References", () => {
    it("should transform References to SymbolPrimitive", () => {
      const input = ref("console");
      const result = transformNode(input) as Yu.SymbolPrimitive;

      expect(result).to.be.instanceOf(Yu.SymbolPrimitive);
      expect(result.value).to.equal("console");
    });
  });

  describe("Expressions", () => {
    it("should transform a Send (method call) correctly", () => {
      const input = send(ref("console"), "println", [lit("Hi")]);
      const result = transformNode(input) as Yu.Send;

      expect(result).to.be.instanceOf(Yu.Send);
      expect(result.receiver).to.be.instanceOf(Yu.SymbolPrimitive);
      expect((result.receiver as Yu.SymbolPrimitive).value).to.equal("console");

      expect(result.selector).to.be.instanceOf(Yu.SymbolPrimitive);
      expect((result.selector as Yu.SymbolPrimitive).value).to.equal("println");

      expect(result.args).to.have.lengthOf(1);
      expect((result.args[0] as Yu.StringPrimitive).value).to.equal("Hi");
    });
  });

  describe("Methods & Parameters", () => {
    it("should transform a Method into an Equation with UnguardedBody", () => {
      const input = met(
        "greet",
        [param("name"), param("age")],
        unguardedBody([send(ref("self"), "call", [])])
      );

      const result = transformNode(input) as Yu.Method;
      expect(result).to.be.instanceOf(Yu.Method);
      expect(result.identifier.value).to.equal("greet");

      expect(result.equations).to.have.lengthOf(1);
      const equation = result.equations[0];

      expect(equation.patterns).to.have.lengthOf(2);
      expect((equation.patterns[0] as Yu.VariablePattern).name.value).to.equal(
        "name"
      );
      expect((equation.patterns[1] as Yu.VariablePattern).name.value).to.equal(
        "age"
      );

      expect(equation.body).to.be.instanceOf(Yu.UnguardedBody);
      const body = equation.body as Yu.UnguardedBody;
      expect(body.sequence).to.be.instanceOf(Yu.Sequence);
    });
  });

  describe("Object/Class", () => {
    it("should transform a Singleton (Object) with members", () => {
      const input = singleton("MyObject", [
        met("doSomething", [], unguardedBody([])),
      ]);

      const result = transformNode(input) as Yu.Object;

      expect(result).to.be.instanceOf(Yu.Object);
      expect(result.identifier.value).to.equal("MyObject");

      expect(result.expression).to.be.instanceOf(Yu.Sequence);
      const seq = result.expression as Yu.Sequence;
      expect(seq.statements).to.have.lengthOf(1);
      expect(seq.statements[0]).to.be.instanceOf(Yu.Method);
    });

    it("should transform a Class", () => {
      const input = wollokClass("MyClass", []);
      const result = transformNode(input) as Yu.Class;
      expect(result).to.be.instanceOf(Yu.Class);
      expect(result.identifier.value).to.equal("MyClass");
      expect(result.expression).to.be.instanceOf(Yu.Sequence);
    });
  });

  describe("SourceMap/SourceLocation", () => {
    it("should map SourceMap to SourceLocation", () => {
      const input = lit(100, {
        start: { line: 10, column: 5 },
        end: { line: 10, column: 8 },
      });

      const result = transformNode(input);

      expect(result.loc).to.not.be.undefined;
      expect(result.loc?.line).to.equal(10);
      expect(result.loc?.column).to.equal(5);
    });
  });

  describe("Package", () => {
    it("should return an array of Statements from a Package", () => {
      const pkg = p([wollokClass("A", []), singleton("B", [])]);

      const result = transformer.transform(pkg);

      expect(result).to.be.an("array");
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(Yu.Class);
      expect(result[1]).to.be.instanceOf(Yu.Object);
    });
  });

  describe("Return Methods", () => {
    it("should transform method with parameters, explicit return and binary operations", () => {
      const input = met(
        "calculation",
        [param("a")],
        unguardedBody([ret(send(ref("a"), "+", [lit(2)]))])
      );

      const result = transformNode(input) as Yu.Method;

      expect(result.identifier.value).to.equal("calculation");

      const equation = result.equations[0];
      expect(equation.patterns).to.have.lengthOf(1);
      expect(equation.patterns[0]).to.be.instanceOf(Yu.VariablePattern);
      expect((equation.patterns[0] as Yu.VariablePattern).name.value).to.equal(
        "a"
      );

      const bodySeq = (equation.body as Yu.UnguardedBody).sequence;
      expect(bodySeq.statements).to.have.lengthOf(1);

      const returnStmt = bodySeq.statements[0] as Yu.Return;
      expect(returnStmt).to.be.instanceOf(Yu.Return);

      const binaryOp = returnStmt.body as Yu.ArithmeticBinaryOperation;
      expect(binaryOp).to.be.instanceOf(Yu.ArithmeticBinaryOperation);

      expect(binaryOp.operator).to.equal("Plus");

      expect(binaryOp.left).to.be.instanceOf(Yu.SymbolPrimitive);
      expect((binaryOp.left as Yu.SymbolPrimitive).value).to.equal("a");

      expect(binaryOp.right).to.be.instanceOf(Yu.NumberPrimitive);
      expect((binaryOp.right as Yu.NumberPrimitive).value).to.equal(2);
    });
  });

  describe("Structural Extensions (Import, Mixin, Field)", () => {
    it("should transform Mixin -> Class", () => {
      const input = mixin("FlyingAbility", []);
      const result = transformNode(input) as Yu.Class;

      expect(result).to.be.instanceOf(Yu.Class);
      expect(result.identifier.value).to.equal("FlyingAbility");
    });

    it("should transform Field -> Attribute (with value)", () => {
      const input = field("energy", false, lit(100));
      const result = transformNode(input) as Yu.Attribute;

      expect(result).to.be.instanceOf(Yu.Attribute);
      expect(result.identifier.value).to.equal("energy");
      expect((result.expression as Yu.NumberPrimitive).value).to.equal(100);
    });

    it("should transform Field -> Attribute (without value defaults to Nil)", () => {
      const input = field("target", false);
      const result = transformNode(input) as Yu.Attribute;

      expect(result).to.be.instanceOf(Yu.Attribute);
      expect(result.expression).to.be.instanceOf(Yu.NilPrimitive);
    });
  });

  describe("State & Flow (Vars, Assignments, If)", () => {
    it("should transform Variable Declaration", () => {
      const input = variable("count", false, lit(0));
      const result = transformNode(input) as Yu.Variable;

      expect(result).to.be.instanceOf(Yu.Variable);
      expect(result.identifier.value).to.equal("count");
      expect((result.expression as Yu.NumberPrimitive).value).to.equal(0);
    });

    it("should transform Assignment", () => {
      const input = assign(ref("count"), lit(5));
      const result = transformNode(input) as Yu.Assignment;

      expect(result).to.be.instanceOf(Yu.Assignment);
      expect(result.identifier.value).to.equal("count");
      expect((result.expression as Yu.NumberPrimitive).value).to.equal(5);
    });

    it("should transform If/Else", () => {
      const input = ifStmt(lit(true), unguardedBody([]), unguardedBody([]));
      const result = transformNode(input) as Yu.If;

      expect(result).to.be.instanceOf(Yu.If);
      expect(result.condition).to.be.instanceOf(Yu.BooleanPrimitive);
      expect(result.then).to.be.instanceOf(Yu.Sequence);
      expect(result.elseExpr).to.be.instanceOf(Yu.Sequence);
    });

    it("should transform If (without Else injects empty Sequence)", () => {
      const input = ifStmt(lit(false), unguardedBody([]));
      const result = transformNode(input) as Yu.If;

      expect(result).to.be.instanceOf(Yu.If);
      expect(result.elseExpr).to.be.instanceOf(Yu.Sequence);
      expect((result.elseExpr as Yu.Sequence).statements).to.be.empty;
    });
  });

  describe("Object Oriented Features (Self, Super, New)", () => {
    it("should transform Reference('self') -> Self", () => {
      const input = ref("self");
      const result = transformNode(input) as Yu.Self;

      expect(result).to.be.instanceOf(Yu.Self);
      expect(result).to.not.have.property("value");
    });

    it("should transform New -> Yu.New", () => {
      const input = newExpr("Bird", [lit("Tweety")]);
      const result = transformNode(input) as Yu.New;

      expect(result).to.be.instanceOf(Yu.New);
      expect(result.identifier.value).to.equal("Bird");
      expect(result.args).to.have.lengthOf(1);
    });

    it("should transform SuperInvocation -> Send(receiver='super')", () => {
      const input = superInv([]);
      const result = transformNode(input) as Yu.Super;

      expect(result).to.be.instanceOf(Yu.Super);
    });
  });

  describe("Exception Handling (Throw, Try/Catch)", () => {
    it("should transform Throw -> Raise", () => {
      const input = throwStmt(newExpr("Error", []));
      const result = transformNode(input) as Yu.Raise;

      expect(result).to.be.instanceOf(Yu.Raise);
      expect(result.body).to.be.instanceOf(Yu.New);
    });

    it("should transform Try/Catch/Always", () => {
      const input = tryStmt(
        unguardedBody([]),
        [catchClause(param("e"), unguardedBody([]))],
        unguardedBody([])
      );

      const result = transformNode(input) as Yu.Try;

      expect(result).to.be.instanceOf(Yu.Try);
      expect(result.body).to.be.instanceOf(Yu.Sequence);

      expect(result.catchExpr).to.have.lengthOf(1);
      const catchBlock = result.catchExpr[0];
      expect(catchBlock.patterns).to.have.lengthOf(1);
      expect(
        (catchBlock.patterns[0] as Yu.VariablePattern).name.value
      ).to.equal("e");

      expect(result.finallyExpr).to.be.instanceOf(Yu.Sequence);
    });
  });
});
