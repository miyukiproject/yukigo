import { expect } from "chai";
import * as Yu from "@yukigo/ast";
import { WollokToYukigoTransformer } from "../src/transformer";
import {
  Body,
  Class,
  List,
  Literal,
  Method,
  Node,
  Package,
  Parameter,
  Reference,
  Send,
  Singleton,
} from "wollok-ts";

describe("WollokToYukigoTransformer", () => {
  let transformer: WollokToYukigoTransformer;

  beforeEach(() => {
    transformer = new WollokToYukigoTransformer();
  });

  const p = (members, sourceMap?) =>
    new Package({ name: "example", members, sourceMap });
  const lit = (value, sourceMap?) => new Literal({ value, sourceMap });
  const ref = (name) => new Reference({ name });
  const send = (receiver, message, args) =>
    new Send({ receiver, message, args });
  const met = (name, parameters: Parameter[], body) =>
    new Method({ name, parameters, body });
  const param = (name) => new Parameter({ name });
  const unguardedBody = (sentences) => new Body({ sentences });
  const singleton = (name, members) => new Singleton({ name, members });
  const wollokClass = (name, members) => new Class({ name, members });

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
});
