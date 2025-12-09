import { expect } from "chai";
import {
  TypesParameterAs,
  TypesReturnAs,
} from "../../src/analyzer/inspections/generic.js";
import {
  TypeSignature,
  ParameterizedType,
  SymbolPrimitive,
  SimpleType,
} from "yukigo-ast";
import { executeVisitor } from "../../src/analyzer/utils.js";

describe("Generic Inspections Type Checks", () => {
  const createTypeSignature = (name: string, params: string[], ret: string) => {
    const identifier = new SymbolPrimitive(name);
    const inputTypes = params.map((p) => {
      const t = new SimpleType(p, []);
      t.toString = () => p;
      return t;
    });

    const returnType = new SimpleType(ret, []);
    returnType.toString = () => ret;

    const body = new ParameterizedType(inputTypes, returnType, []);
    return new TypeSignature(identifier, body);
  };

  describe("TypesParameterAs", () => {
    it("should find a match when parameter type matches at correct index", () => {
      // f :: Int -> String -> Bool
      const node = createTypeSignature("f", ["Int", "String"], "Bool");
      const visitor = new TypesParameterAs("f", 0, "Int");

      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should find a match at a specific index (2nd parameter)", () => {
      // f :: Int -> String -> Bool
      const node = createTypeSignature("f", ["Int", "String"], "Bool");
      const visitor = new TypesParameterAs("f", 1, "String");

      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should NOT throw if parameter index is out of bounds", () => {
      const node = createTypeSignature("f", ["Int"], "Bool");
      const visitor = new TypesParameterAs("f", 2, "Int");

      expect(executeVisitor(node, visitor)).to.eq(false);
    });

    it("should NOT throw if type does not match", () => {
      const node = createTypeSignature("f", ["Int"], "Bool");
      const visitor = new TypesParameterAs("f", 1, "String");

      expect(executeVisitor(node, visitor)).to.eq(false);
    });

    it("should NOT throw if binding name does not match", () => {
      const node = createTypeSignature("g", ["Int"], "Bool");
      const visitor = new TypesParameterAs("f", 1, "Int");

      expect(executeVisitor(node, visitor)).to.eq(false);
    });
  });

  describe("TypesReturnAs", () => {
    it("should find a match when return type matches", () => {
      // f :: Int -> Bool
      const node = createTypeSignature("f", ["Int"], "Bool");
      const visitor = new TypesReturnAs("f", "Bool");

      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should handle complex return types", () => {
      // f :: Int -> (Int, Int)
      const node = createTypeSignature("f", ["Int"], "(Int, Int)");
      const visitor = new TypesReturnAs("f", "(Int, Int)");

      expect(executeVisitor(node, visitor)).to.eq(true);
    });

    it("should NOT throw if return type does not match", () => {
      const node = createTypeSignature("f", ["Int"], "Bool");
      const visitor = new TypesReturnAs("f", "Int");

      expect(executeVisitor(node, visitor)).to.eq(false);
    });

    it("should NOT throw if binding name does not match", () => {
      const node = createTypeSignature("g", ["Int"], "Bool");
      const visitor = new TypesReturnAs("f", "Bool");

      expect(executeVisitor(node, visitor)).to.eq(false);
    });
  });
});
