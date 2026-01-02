import { AST, TraverseVisitor, StopTraversalException } from "yukigo-ast";
import { genericInspections } from "./inspections/generic/generic.js";
import { functionalInspections } from "./inspections/functional/functional.js";
import { logicInspections } from "./inspections/logic/logic.js";
import { objectInspections } from "./inspections/object/object.js";
import { imperativeInspections } from "./inspections/imperative/imperative.js";
import { InspectionMap, VisitorConstructor } from "./utils.js";
import { functionalSmells } from "./inspections/functional/smells.js";
import { logicSmells } from "./inspections/logic/smells.js";
import { objectSmells } from "./inspections/object/smells.js";
import { imperativeSmells } from "./inspections/imperative/smells.js";
import { genericSmells } from "./inspections/generic/smells.js";
import { GraphBuilder } from "./GraphBuilder.js";

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

export const DefaultInspectionSet: InspectionMap = {
  ...genericInspections,
  ...functionalInspections,
  ...logicInspections,
  ...objectInspections,
  ...imperativeInspections,
};
export const DefaultSmellsSet: InspectionMap = {
  ...genericSmells,
  ...functionalSmells,
  ...logicSmells,
  ...objectSmells,
  ...imperativeSmells,
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
  private smellsConstructors: InspectionMap = {};
  constructor(inspectionSet?: InspectionMap, smellsSet?: InspectionMap) {
    this.inspectionConstructors = inspectionSet ?? DefaultInspectionSet;
    this.smellsConstructors = smellsSet ?? DefaultSmellsSet;
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
    const graphBuilder = new GraphBuilder();
    const { defs, calls } = graphBuilder.build(ast);

    for (const rule of rules) {
      let inspectionName = rule.inspection;
      let isTransitive = true;

      if (inspectionName.startsWith("Intransitive:")) {
        isTransitive = false;
        inspectionName = inspectionName.replace("Intransitive:", "");
      }

      const VisitorClass = this.inspectionConstructors[inspectionName];
      if (!VisitorClass) {
        ruleResults.set(rule, {
          rule,
          passed: false,
          actual: false,
          error: "Unknown inspection: " + inspectionName,
        });
        continue;
      }

      if (VisitorClass.IS_INTRANSITIVE) isTransitive = false;

      let targets: { node: any; binding?: string }[] = [];

      // Case 1: Global Inspection (No binding or wildcard)
      if (!rule.binding || rule.binding === "*") {
        targets = ast.map((n) => ({ node: n, binding: undefined }));
      }
      // Case 2: Directed Inspection (Specific binding)
      else {
        const workList = [rule.binding];
        const visited = new Set<string>();

        while (workList.length > 0) {
          const currentBinding = workList.shift();
          if (visited.has(currentBinding)) continue;
          visited.add(currentBinding);

          const node = defs.get(currentBinding);
          if (node)
            node.forEach((n) =>
              targets.push({ node: n, binding: currentBinding })
            );

          if (isTransitive) {
            const deps = calls.get(currentBinding) || [];
            workList.push(...deps);
          }
        }
      }

      let actual = false;
      let error: string;

      // Execution Loop
      let globalVisitor: TraverseVisitor;
      if (!rule.binding || rule.binding === "*")
        globalVisitor = new VisitorClass(...rule.args);
      for (const { node, binding } of targets) {
        try {
          let visitor: TraverseVisitor;
          if (globalVisitor) {
            visitor = globalVisitor;
          } else {
            const args = [...rule.args, binding];
            visitor = new VisitorClass(...args);
          }
          node.accept(visitor);
        } catch (e) {
          if (e instanceof StopTraversalException) {
            actual = true;
            break; // Short-circuit: Rule passed
          } else {
            error = (e as Error).message;
          }
        }
      }

      ruleResults.set(rule, {
        rule,
        passed: actual === rule.expected,
        actual,
        error,
      });
    }
    return [...ruleResults.values()];
  }
}
