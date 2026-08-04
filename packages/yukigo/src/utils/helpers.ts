import { parseDocument } from "yaml";
import { InspectionRule } from "../analyzer/index.js";
import { NativeExtension } from "../interpreter/utils.js";
import { YukigoHook } from "../interpreter/components/hooks/YukigoHook.js";

const V0_INSPECTIONS_Has = [
  "HasComposition",
  "HasComprehension",
  "HasForeach",
  "HasIf",
  "HasGuards",
  "HasConditional",
  "HasLambda",
  "HasRepeat",
  "HasWhile",
  "HasAnonymousVariable",
  "HasNot",
  "HasForall",
  "HasFindall",
];

const V0_INSPECTIONS_Declares: Map<string, string> = new Map([
  ["HasBinding", "Declares"],
  ["HasTypeDeclaration", "DeclaresTypeAlias"],
  ["HasTypeSignature", "DeclaresTypeSignature"],
  ["HasVariable", "DeclaresVariable"],
  ["HasArity", "DeclaresComputationWithArity"],
  ["HasDirectRecursion", "DeclaresRecursively"],
  ["HasUsage", "Uses"],
]);

type MulangInspection = {
  inspection: string;
  binding: string;
};

export type LogicSearchMode = "first" | "all" | "stream";
export interface InterpreterConfig {
  nativeProviders: Map<string, NativeExtension>;
  lazyLoading: boolean;
  debug: boolean;
  outputMode: LogicSearchMode;
  mutability: boolean;
  hooks?: YukigoHook[];
}

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
        `Skipping malformed Mulang inspection entry: ${mulangInspection}`,
      );

    const inspection: string[] = mulangInspection.inspection.split(":");
    const expected: boolean =
      inspection[0] !== "Not" && inspection[0] !== "Except";
    const args: string[] = inspection.slice(expected ? 1 : 2);

    const inspectionV0 = expected ? inspection[0] : inspection[1];
    const inspectionV2 = this.translateV0Inspection(inspectionV0);
    return {
      inspection: inspectionV2,
      expected,
      args,
      binding: mulangInspection.binding,
    };
  }

  public translateMulangExpectations(
    mulangYamlString: string,
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
        "Invalid Mulang YAML structure. Expected 'expectations' to be an array.",
      );
    }

    const inspectionRules: InspectionRule[] = expectations.map((insp) =>
      this.translateMulangInspection(insp),
    );
    return inspectionRules;
  }

  private translateV0Inspection(inspection: string): string {
    if (V0_INSPECTIONS_Declares.has(inspection))
      return V0_INSPECTIONS_Declares.get(inspection)!;

    if (V0_INSPECTIONS_Has.includes(inspection))
      return inspection.replace("Has", "Uses");

    return inspection;
  }
}
