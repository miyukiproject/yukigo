import {
  AST,
  ASTNode,
  EquationRuntime,
  Fact,
  Function,
  Rule,
  RuntimeFunction,
  TraverseVisitor,
} from "@yukigo/ast";
import { EnvStack } from "../index.js";
import { define } from "../utils.js";

/**
 * Builds the initial environment by collecting all top-level function declarations.
 * Each function captures a closure of the environment at its definition time,
 * allowing recursion by including itself in the closure.
 */
export class EnvBuilderVisitor extends TraverseVisitor {
  private env: EnvStack;

  constructor(baseEnv?: EnvStack) {
    super();
    this.env = baseEnv ?? [new Map()];
  }

  public build(ast: AST): EnvStack {
    for (const node of ast) node.accept(this);
    return this.env;
  }
  visitFunction(node: Function): void {
    const name = node.identifier.value;

    if (node.equations.length === 0)
      throw new Error(`Function ${name} has no equations`);

    const arity = node.equations[0].patterns.length;
    for (const eq of node.equations) {
      if (eq.patterns.length !== arity)
        throw new Error(`All equations of ${name} must have the same arity`);
    }

    // for recursive references
    const placeholder: Partial<RuntimeFunction> = {};
    define(this.env, name, placeholder as RuntimeFunction);

    const equations: EquationRuntime[] = node.equations.map((eq) => ({
      patterns: eq.patterns,
      body: eq.body,
    }));

    const runtimeFunc: RuntimeFunction = {
      identifier: name,
      arity,
      equations,
    };
    define(this.env, name, runtimeFunc);
  }
  visitFact(node: Fact): void {
    const identifier = node.identifier.value;
    const runtimeValue = this.env[0].get(identifier);

    if (
      runtimeValue &&
      typeof runtimeValue === "object" &&
      "kind" in runtimeValue &&
      runtimeValue.kind === "Fact"
    ) {
      this.env[0].set(identifier, {
        ...runtimeValue,
        equations: [...runtimeValue.equations, node],
      });
    } else {
      this.env[0].set(identifier, {
        kind: "Fact",
        identifier,
        equations: [node],
      });
    }
  }

  visitRule(node: Rule): void {
    const identifier = node.identifier.value;
    const runtimeValue = this.env[0].get(identifier);

    if (
      runtimeValue &&
      typeof runtimeValue === "object" &&
      "kind" in runtimeValue &&
      runtimeValue.kind === "Rule"
    ) {
      this.env[0].set(identifier, {
        ...runtimeValue,
        equations: [...runtimeValue.equations, node],
      });
    } else {
      this.env[0].set(identifier, {
        kind: "Rule",
        identifier,
        equations: [node],
      });
    }
  }
  visit(node: ASTNode): void {
    return node.accept(this);
  }
}
