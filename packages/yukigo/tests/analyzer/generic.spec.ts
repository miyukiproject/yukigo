import { expect } from "chai";
import { Analyzer, InspectionRule } from "../../src/analyzer/index.js";
import {
  TypeSignature,
  ParameterizedType,
  SymbolPrimitive,
  SimpleType,
} from "yukigo-ast";

describe("Generic Inspections", () => {
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
      const ast = [createTypeSignature("f", ["Int", "String"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesParameterAs",
          binding: "f",
          args: ["0", "Int"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.true;
    });

    it("should find a match at a specific index (2nd parameter)", () => {
      const ast = [createTypeSignature("f", ["Int", "String"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesParameterAs",
          binding: "f",
          args: ["1", "String"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.true;
    });

    it("should NOT pass if parameter index is out of bounds", () => {
      const ast = [createTypeSignature("f", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesParameterAs",
          binding: "f",
          args: ["2", "Int"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.false;
    });

    it("should NOT pass if type does not match", () => {
      const ast = [createTypeSignature("f", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesParameterAs",
          binding: "f",
          args: ["0", "String"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.false;
    });

    it("should NOT pass if binding name does not match", () => {
      const ast = [createTypeSignature("g", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesParameterAs",
          binding: "f",
          args: ["0", "Int"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.false;
    });
  });

  describe("TypesReturnAs", () => {
    it("should find a match when return type matches", () => {
      const ast = [createTypeSignature("f", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesReturnAs",
          binding: "f",
          args: ["Bool"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.true;
    });

    it("should handle complex return types", () => {
      const ast = [createTypeSignature("f", ["Int"], "(Int, Int)")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesReturnAs",
          binding: "f",
          args: ["(Int, Int)"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.true;
    });

    it("should NOT pass if return type does not match", () => {
      const ast = [createTypeSignature("f", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesReturnAs",
          binding: "f",
          args: ["Int"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.false;
    });

    it("should NOT pass if binding name does not match", () => {
      const ast = [createTypeSignature("g", ["Int"], "Bool")];
      const rules: InspectionRule[] = [
        {
          inspection: "TypesReturnAs",
          binding: "f",
          args: ["Bool"],
          expected: true,
        },
      ];
      const analyzer = new Analyzer();
      const results = analyzer.analyze(ast, rules);
      expect(results[0].passed).to.be.false;
    });
  });
});
