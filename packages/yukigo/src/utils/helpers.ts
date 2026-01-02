import { parseDocument } from "yaml";
import { InspectionRule } from "../analyzer/index.js";

type MulangInspection = {
  inspection: string;
  binding: string;
};

const isValidFormat = (inspection: any): inspection is MulangInspection =>
  typeof inspection === "object" &&
  "inspection" in inspection &&
  "binding" in inspection;

/**
 * Translates Mulang inspections (YAML format) to an array of `InspectionRule` objects.
 * @param mulangYamlString The Mulang inspection syntax as a YAML string.
 * @returns An array of InspectionRule objects.
 */
export class MulangAdapter {
  public translateMulangInspection(mulangInspection: any): InspectionRule {
    if (!isValidFormat(mulangInspection))
      throw new Error(
        `Skipping malformed Mulang inspection entry: ${mulangInspection}`
      );

    const inspection: string[] = mulangInspection.inspection.split(":");
    const expected: boolean =
      inspection[0] !== "Not" && inspection[0] !== "Except";
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
    if (!mulangYamlString) return [];
    const parsedYaml = parseDocument(mulangYamlString).toJS();

    if (!parsedYaml) return [];

    let expectations: any[] = [];
    if (Array.isArray(parsedYaml)) {
      expectations = parsedYaml;
    } else if (Array.isArray(parsedYaml.expectations)) {
      expectations = parsedYaml.expectations;
    } else {
      throw new Error(
        "Invalid Mulang YAML structure. Expected 'expectations' to be an array."
      );
    }

    const inspectionRules: InspectionRule[] = [];

    for (const mulangInspection of expectations) {
      const inspection = this.translateMulangInspection(mulangInspection);
      inspectionRules.push(inspection);
    }

    return inspectionRules;
  }
}
