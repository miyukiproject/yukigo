import { expect } from "chai";
import {
  Function,
  SymbolPrimitive,
  Application,
  Equation,
  UnguardedBody,
  Sequence,
  AST,
  Rule,
  Exist,
} from "yukigo-ast";
import { Analyzer, InspectionRule } from "../../src/analyzer/index.js";
import { AutoScoped, ScopedVisitor } from "../../src/analyzer/utils.js";

// records which functions it visits
@AutoScoped
class SpyVisitor extends ScopedVisitor {
  public static visited: string[] = [];

  constructor(scope?: string) {
    super(scope);
  }

  visitFunction(node: Function): void {
    SpyVisitor.visited.push(node.identifier.value);
  }

  visitRule(node: Rule): void {
    SpyVisitor.visited.push(node.identifier.value);
  }
}

describe("Analyzer Transitive Behavior", () => {
  let analyzer: Analyzer;

  beforeEach(() => {
    SpyVisitor.visited = [];
    analyzer = new Analyzer();
    analyzer.registerInspection("Spy", SpyVisitor);
  });

  const createFunction = (name: string, calls: string[] = []) => {
    const identifier = new SymbolPrimitive(name);
    const body = new Sequence(
      calls.map(
        (callee) =>
          new Application(
            new SymbolPrimitive(callee),
            new SymbolPrimitive("arg")
          )
      )
    );
    const equation = new Equation([], new UnguardedBody(body));
    return new Function(identifier, [equation]);
  };

  const createRule = (name: string, calls: string[] = []) => {
    const identifier = new SymbolPrimitive(name);
    const body = new Sequence(
      calls.map((callee) => new Exist(new SymbolPrimitive(callee), []))
    );
    const equation = new Equation([], new UnguardedBody(body));
    return new Rule(identifier, [equation]);
  };

  const runInspection = (
    ast: AST,
    binding: string,
    inspectionName: string = "Spy"
  ) => {
    const rule: InspectionRule = {
      inspection: inspectionName,
      binding,
      args: [],
      expected: true,
    };
    analyzer.analyze(ast, [rule]);
  };

  it("should traverse dependencies transitively by default", () => {
    // A -> B
    const funcA = createFunction("A", ["B"]);
    const funcB = createFunction("B", []);
    const ast = [funcA, funcB];

    runInspection(ast, "A", "Spy");

    expect(SpyVisitor.visited).to.include.members(["A", "B"]);
  });

  it("should traverse deep dependencies", () => {
    // A -> B -> C
    const funcA = createFunction("A", ["B"]);
    const funcB = createFunction("B", ["C"]);
    const funcC = createFunction("C", []);
    const ast = [funcA, funcB, funcC];

    runInspection(ast, "A", "Spy");

    expect(SpyVisitor.visited).to.include.members(["A", "B", "C"]);
  });

  it("should handle cycles gracefully", () => {
    // A -> B -> A
    const funcA = createFunction("A", ["B"]);
    const funcB = createFunction("B", ["A"]);
    const ast = [funcA, funcB];

    runInspection(ast, "A", "Spy");

    expect(SpyVisitor.visited).to.include.members(["A", "B"]);
  });

  it("should NOT traverse dependencies if Intransitive prefix is used", () => {
    // A -> B
    const funcA = createFunction("A", ["B"]);
    const funcB = createFunction("B", []);
    const ast = [funcA, funcB];

    runInspection(ast, "A", "Intransitive:Spy");

    expect(SpyVisitor.visited).to.include.members(["A"]);
    expect(SpyVisitor.visited).to.not.include("B");
  });

  it("should not visit unreachable nodes", () => {
    // A -> B; C (isolated)
    const funcA = createFunction("A", ["B"]);
    const funcB = createFunction("B", []);
    const funcC = createFunction("C", []);
    const ast = [funcA, funcB, funcC];

    runInspection(ast, "A", "Spy");

    expect(SpyVisitor.visited).to.include.members(["A", "B"]);
    expect(SpyVisitor.visited).to.not.include("C");
  });

  it("should handle diamond dependencies correctly and visit each node once", () => {
    // A -> B, A -> C, B -> D, C -> D
    const funcA = createFunction("A", ["B", "C"]);
    const funcB = createFunction("B", ["D"]);
    const funcC = createFunction("C", ["D"]);
    const funcD = createFunction("D", []);
    const ast = [funcA, funcB, funcC, funcD];

    runInspection(ast, "A", "Spy");

    expect(SpyVisitor.visited).to.include.members(["A", "B", "C", "D"]);

    // Ensure no duplicates
    expect(SpyVisitor.visited.length).to.equal(4);
  });

  it("should traverse dependencies in Logic Rules (Exist nodes)", () => {
    // ruleA :- ruleB.
    const ruleA = createRule("ruleA", ["ruleB"]);
    const ruleB = createRule("ruleB", []);
    const ast = [ruleA, ruleB];

    runInspection(ast, "ruleA", "Spy");

    expect(SpyVisitor.visited).to.include.members(["ruleA", "ruleB"]);
  });
});
