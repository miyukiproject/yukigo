import { AST, TraverseVisitor, StopTraversalException } from "yukigo-ast";
import { genericInspections } from "./inspections/generic.js";
import { functionalInspections } from "./inspections/functional.js";
import { logicInspections } from "./inspections/logic.js";
import { objectInspections } from "./inspections/object.js";
import { imperativeInspections } from "./inspections/imperative.js";
import { InspectionMap, VisitorConstructor } from "./utils.js";

export type AnalysisResult = {
  rule: InspectionRule;
  passed: boolean;
  actual: boolean;
  error?: string;
};

export type InspectionRule = {
  inspection: string;
  binding?: string;
  args: string[];
  expected: boolean;
};

export const defaultInspectionSet: InspectionMap = {
  ...genericInspections,
  ...functionalInspections,
  ...logicInspections,
  ...objectInspections,
  ...imperativeInspections,
};

/**
 * The Analyzer class.
 * @remarks
 * The Analyzer is the part of Yukigo which runs the inspections on the AST.s
 */
export class Analyzer {
  /**
   * The set of inspections that are available for the Analyzer.
   * You can load your set of inspections or leave the default one.
   * @defaultValue a default set of inspections for each supported paradigm
   */
  private inspectionConstructors: InspectionMap = {};
  constructor(inspectionSet?: InspectionMap) {
    this.inspectionConstructors = inspectionSet ?? defaultInspectionSet;
  }

  /**
   * Registers a new custom inspection handler after Analyzer was instantiated.
   * @param name The name of the inspection (e.g., "HasArithmetic").
   * @param visitorConstructor The constructor for the TraverseVisitor class.
   */
  public registerInspection(
    name: string,
    visitorConstructor: VisitorConstructor
  ) {
    this.inspectionConstructors[name] = visitorConstructor;
  }

  /**
   * Runs a list of inspection rules against the AST.
   * @param ast The parsed AST.
   * @param rules The array of inspection rules to run.
   * @returns An array of analysis results.
   * @example
   * const rules: InspectionRule[] = [
   *  {
   *    inspection: "HasBinding",
   *    args: { name: "minimoEntre" },
   *    expected: false,
   *  },
   *  {
   *    inspection: "HasBinding",
   *    args: { name: "squareList" },
   *    expected: true,
   *  }
   * ]
   * const analyzer = new ASTAnalyzer(ast);
   * const analysisResults = analyzer.analyze(expectations);
   */
  public analyze(ast: AST, rules: InspectionRule[]): AnalysisResult[] {
    const ruleResults: Map<InspectionRule, AnalysisResult> = new Map();
    const activeVisitors: Map<InspectionRule, TraverseVisitor> = new Map();

    for (const rule of rules) {
      const VisitorClass = this.inspectionConstructors[rule.inspection];
      if (!VisitorClass) {
        ruleResults.set(rule, {
          rule,
          passed: false,
          actual: false,
          error: "Unknown inspection: " + rule.inspection,
        });
        continue;
      }
      const visitorArgs = rule.binding
        ? [...rule.args, rule.binding]
        : rule.args;
      activeVisitors.set(rule, new VisitorClass(...visitorArgs));
    }

    for (const node of ast) {
      for (const [rule, visitor] of activeVisitors.entries()) {
        if (ruleResults.has(rule)) continue;

        try {
          node.accept(visitor);
        } catch (e) {
          if (e instanceof StopTraversalException) {
            ruleResults.set(rule, {
              rule,
              passed: rule.expected === true,
              actual: true,
            });
          } else {
            // unexpected error during traversal
            ruleResults.set(rule, {
              rule,
              passed: false,
              actual: false,
              error: (e as Error).message,
            });
          }
        }
      }
    }

    for (const rule of rules) {
      if (!ruleResults.has(rule)) {
        ruleResults.set(rule, {
          rule,
          passed: rule.expected === false,
          actual: false,
        });
      }
    }

    return [...ruleResults.values()];
  }
}
