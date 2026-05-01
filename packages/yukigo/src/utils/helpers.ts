import { parseDocument } from "yaml";
import {
  InspectionRule,
  TargetSuffix,
} from "../analyzer/index.js";

const declareMap: Record<string, string> = {
  HasBinding: "Declares",
  HasTypeDeclaration: "DeclaresTypeAlias",
  HasTypeSignature: "DeclaresTypeSignature",
  HasVariable: "DeclaresVariable",
  HasDirectRecursion: "DeclaresRecursively",
};

type MulangInspection = {
  inspection: string;
  binding: string;
  args?: string[];
};

const NEGATION_PREFIXES = new Set(["Not", "Except"]);
const SUFFIX_ARGS = new Set<TargetSuffix>(["like", "except"]);

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
  public translateMulangInspection(mulangInspection: unknown): InspectionRule {
    if (!isValidFormat(mulangInspection))
      throw new Error(
        `Skipping malformed Mulang inspection entry: ${mulangInspection}`,
      );

    // transforms Mulang v0 to v2
    const { inspection, expected, binding, args } =
      this.transformToV2(mulangInspection);

    const { resolvedArgs, targetSuffix, matcher } =
      this.retrieveArguments(args);

    return {
      inspection,
      expected,
      binding,
      args: resolvedArgs,
      // these should not exist in the InspectionRule if they are undefined
      ...(targetSuffix !== undefined && { targetSuffix }),
      ...(matcher !== undefined && { matcher }),
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

  private transformToV2(mulangInspection: MulangInspection) {
    const parts = mulangInspection.inspection.split(":");
    const {
      expected,
      inspection,
      args: parsedArgs,
    } = this.parseNegation(parts);
    const args = mulangInspection.args ?? parsedArgs;
    const v2 = this.applyV0ToV2(inspection, args, mulangInspection.binding);
    return { expected, ...v2 };
  }
  private parseNegation(parts: string[]) {
    const negated = NEGATION_PREFIXES.has(parts[0]);
    return {
      expected: !negated,
      inspection: parts[negated ? 1 : 0],
      args: parts.slice(negated ? 2 : 1),
    };
  }
  private applyV0ToV2(inspection: string, args: string[], binding: string) {
    if (inspection in declareMap)
      return {
        inspection: declareMap[inspection],
        ...promoteBindingToTarget(args, binding),
      };

    if (inspection === "HasArity")
      return {
        inspection: `DeclaresComputationWithArity${args[0]}`,
        ...promoteBindingToTarget([], binding),
      };

    if (inspection.startsWith("Has"))
      return {
        inspection: inspection.replace(/^Has(Usage)?/, (_, usage) =>
          usage ? "Uses" : "Uses",
        ),
        args,
        binding,
      };

    return { inspection, args, binding };
  }

  private retrieveArguments(args: string[]) {
    const targetSuffix = args.find((a): a is TargetSuffix =>
      SUFFIX_ARGS.has(a as TargetSuffix),
    );

    const matcherIndex = args.findIndex((a) => a.startsWith("With"));
    const matcher =
      matcherIndex !== -1
        ? {
            type: "with_" + args[matcherIndex].slice(4).toLowerCase(),
            value: args[matcherIndex + 1],
          }
        : undefined;

    const consumed = new Set([
      ...(targetSuffix ? [targetSuffix] : []),
      ...(matcherIndex !== -1
        ? [args[matcherIndex], args[matcherIndex + 1]]
        : []),
    ]);

    const resolvedArgs = args.filter((a) => !consumed.has(a));

    return {
      targetSuffix:
        targetSuffix ??
        (resolvedArgs.length > 0 ? ("named" as TargetSuffix) : undefined),
      matcher,
      resolvedArgs,
    };
  }
}

const promoteBindingToTarget = (args: string[], binding: string) => ({
  args: binding && binding !== "*" ? [binding, ...args] : args,
  binding: "*",
});
