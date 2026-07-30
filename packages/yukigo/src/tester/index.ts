import {
  AST,
  ASTNode,
  Expression,
  Test,
  TestGroup,
  TraverseVisitor,
  VariablePattern,
} from "yukigo-ast";
import { Interpreter } from "../interpreter/index.js";
import { FailedAssert } from "../interpreter/components/TestRunner.js";
import {
  DefaultConfiguration,
} from "../interpreter/components/RuntimeContext.js";
import { UnexpectedNode } from "../interpreter/errors.js";
import { InterpreterConfig } from "../utils/helpers.js";

export type TestStatus = "passed" | "failed" | "error";

export interface TestReport {
  name: string;
  status: TestStatus;
  message?: string;
  duration?: number;
  children?: TestReport[];
}

class TestExecutor extends TraverseVisitor {
  public report: TestReport | null = null;

  constructor(
    private ast: AST,
    private config: InterpreterConfig,
    private parentGroupStatements: ASTNode[] = [],
  ) {
    super();
  }

  visitTest(node: Test): void {
    const interpreter = new Interpreter(this.ast, this.config);
    for (const stmt of this.parentGroupStatements) {
      if (!(stmt instanceof Test) && !(stmt instanceof TestGroup)) {
        interpreter.evaluate(stmt);
      }
    }

    const name = this.evaluateName(interpreter, node.name);
    const start = Date.now();

    try {
      interpreter
        .getContext()
        .dispatchHook("beforeEachTest", interpreter, node);

      interpreter.evaluate(node);

      interpreter
        .getContext()
        .dispatchHook("afterEachTest", interpreter, node);

      this.report = {
        name,
        status: "passed",
        duration: Date.now() - start,
      };
    } catch (error) {
      this.report = this.handleError(name, start, error);
    }
  }

  visitTestGroup(node: TestGroup): void {
    const interpreter = new Interpreter(this.ast, this.config);
    const name = this.evaluateName(interpreter, node.name);
    const start = Date.now();

    try {
      const children: TestReport[] = [];
      const nonTestStmts = node.group.statements.filter(
        (stmt) => !(stmt instanceof Test) && !(stmt instanceof TestGroup),
      );

      for (const stmt of node.group.statements) {
        if (stmt instanceof Test || stmt instanceof TestGroup) {
          const visitor = new TestExecutor(
            this.ast,
            this.config,
            [...this.parentGroupStatements, ...nonTestStmts],
          );
          stmt.accept(visitor);
          if (visitor.report) children.push(visitor.report);
        }
      }

      const anyFailed = children.some((c) => c.status !== "passed");
      this.report = {
        name,
        status: anyFailed ? "failed" : "passed",
        duration: Date.now() - start,
        children,
      };
    } catch (error) {
      this.report = this.handleError(name, start, error);
    }
  }

  private evaluateName(interpreter: Interpreter, nameExpr: Expression): string {
    try {
      return String(interpreter.evaluate(nameExpr));
    } catch {
      return "Unknown Test";
    }
  }

  private handleError(name: string, start: number, error: unknown): TestReport {
    const duration = Date.now() - start;
    if (error instanceof FailedAssert)
      return { name, status: "failed", message: error.message, duration };

    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return { name, status: "error", message, duration };
  }

  public fallback(node: ASTNode): void {
    throw new UnexpectedNode(node.constructor.name, "TestExecutor");
  }
}

/**
 * The Tester class provides a high-level API for executing test nodes
 * (Tests and TestGroups) within an AST and generating a detailed report.
 */
export class Tester {
  constructor(
    private ast: AST,
    private config: InterpreterConfig = DefaultConfiguration,
  ) {}

  /**
   * Executes all Test and TestGroup nodes found at the top level of the provided AST.
   * @param nodes The AST (or subset of nodes) to scan for tests.
   * @returns An array of TestReport objects for each top-level test/group.
   */
  public test(nodes: AST): TestReport[] {
    const reports: TestReport[] = [];

    for (const node of nodes) {
      if (!node.is(Test) && !node.is(TestGroup)) continue;

      const visitor = new TestExecutor(this.ast, this.config);
      node.accept(visitor);

      if (visitor.report) reports.push(visitor.report);
    }
    return reports;
  }
}
