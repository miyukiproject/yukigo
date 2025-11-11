import { parseDocument } from "yaml";
import { InspectionRule } from "../analyzer/index.js";
import { YukigoPrimitive } from "@yukigo/ast";

/**
 * Translates Mulang inspections (YAML format) to an array of `InspectionRule` objects.
 * @param mulangYamlString The Mulang inspection syntax as a YAML string.
 * @returns An array of InspectionRule objects.
 */

export class MulangAdapter {
  public translateMulangInspection(mulangInspection: any): InspectionRule {
    if (
      !mulangInspection ||
      typeof mulangInspection.inspection !== "string" ||
      typeof mulangInspection.binding !== "string"
    ) {
      throw Error(
        `Skipping malformed Mulang inspection entry: ${mulangInspection}`
      );
    }

    const inspection: string[] = mulangInspection.inspection.split(":");
    const expected: boolean = inspection[0] !== "Not";
    const args: string[] = inspection.slice(expected ? 1 : 2);

    return {
      inspection: expected ? inspection[0] : inspection[1],
      expected,
      args,
      binding: mulangInspection.binding,
    };
  }

  public translateMulangExpectations(
    mulangYamlString: string
  ): InspectionRule[] {
    const parsedYaml = parseDocument(mulangYamlString).toJS();

    if (
      !parsedYaml ||
      !parsedYaml.expectations ||
      !Array.isArray(parsedYaml.expectations)
    ) {
      throw Error(
        "Invalid Mulang YAML structure. Expected 'expectations' to be an array."
      );
    }

    const inspectionRules: InspectionRule[] = [];

    for (const mulangInspection of parsedYaml.expectations) {
      const inspection = this.translateMulangInspection(mulangInspection);
      inspectionRules.push(inspection);
    }

    return inspectionRules;
  }
}

export const yukigoTsMappings: { [key in YukigoPrimitive]: string } = {
  YuNumber: "number",
  YuString: "string",
  YuChar: "char",
  YuBoolean: "boolean",
  YuNil: "null",
  // Below some missing mappigs
  YuList: "YuList",
  YuObject: "YuObject",
  YuDict: "YuDict",
  YuTuple: "YuTuple",
  YuSymbol: "YuSymbol",
};
