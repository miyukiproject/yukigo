import {
  AST,
  ASTNode,
  StopTraversalException,
  TraverseVisitor,
} from "@yukigo/ast";
import { genericInspections } from "./inspections/generic.js";
import { functionalInspections } from "./inspections/functional.js";
import { logicInspections } from "./inspections/logic.js";
import { objectInspections } from "./inspections/object.js";
import { imperativeInspections } from "./inspections/imperative.js";

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

export type InspectionHandler = (
  node: ASTNode,
  args: string[],
  binding?: string
) => boolean;

export type InspectionMap = Record<string, InspectionHandler>;

export const defaultInspectionSet: InspectionMap = {
  ...genericInspections,
  ...functionalInspections,
  ...logicInspections,
  ...objectInspections,
  ...imperativeInspections,
};

export function executeVisitor(
  node: ASTNode,
  visitor: TraverseVisitor
): boolean {
  let passes = false;
  try {
    node.accept(visitor);
  } catch (e) {
    if (e instanceof StopTraversalException) {
      passes = true;
    } else {
      throw e;
    }
  }
  return passes;
}

/**
 * The Analyzer class.
 * @remarks
 * The Analyzer is the part of Yukigo which runs the inspections on the AST.
 */
export class Analyzer {
  /**
   * The set of inspections that are available for the Analyzer.
   * You can load your set of inspections or leave the default one.
   * @defaultValue a default set of inspections for each supported paradigm
   */
  private inspectionHandlers: InspectionMap = {};
  constructor(inspectionSet?: InspectionMap) {
    this.inspectionHandlers = inspectionSet ?? defaultInspectionSet;
  }

  /**
   * Registers a new custom inspection handler after Analyzer was instantiated.
   * @param name The name of the inspection (e.g., "HasArithmetic").
   * @param handler The function that implements the inspection logic.
   *
   * @example
   * // Implementation of HasArithmetic inspection
   * export class UsesArithmetic extends TraverseVisitor {
   *  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): void {
   *    throw new StopTraversalException();
   *  }
   *  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): void {
   *    throw new StopTraversalException();
   *  }
   * }
   * const analyzer = new ASTAnalyzer(ast);
   * analyzer.registerInspection("HasArithmetic", (node, args) => executeVisitor(node, new UsesArithmetic()));
   */
  public registerInspection(name: string, handler: InspectionHandler) {
    this.inspectionHandlers[name] = handler;
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
    const results: AnalysisResult[] = [];
    for (const rule of rules) {
      results.push(this.runRule(rule, ast));
    }
    return results;
  }

  private runRule(rule: InspectionRule, ast: AST): AnalysisResult {
    const inspection = this.inspectionHandlers[rule.inspection];
    if (!inspection)
      return {
        rule,
        passed: false,
        actual: false,
        error: "Unknown inspection",
      };

    try {
      let result = false;
      for (const node of ast) {
        if (inspection(node, rule.args, rule.binding)) {
          result = true;
          break;
        }
      }

      const passed = result === rule.expected;
      return {
        rule,
        passed,
        actual: result,
      };
    } catch (error) {
      return {
        rule,
        passed: false,
        actual: false,
        error,
      };
    }
  }
}
