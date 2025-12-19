import {
  AST,
  ASTNode,
  Attribute,
  Class,
  EquationRuntime,
  Fact,
  Function,
  isRuntimePredicate,
  Method,
  PrimitiveValue,
  Rule,
  RuntimeClass,
  RuntimeFunction,
  EnvStack,
  TraverseVisitor,
  Sequence,
} from "yukigo-ast";
import { createGlobalEnv, define } from "../utils.js";
import { InterpreterVisitor } from "./Visitor.js";

/**
 * Builds the initial environment by collecting all top-level function declarations.
 * Each function captures a closure of the environment at its definition time,
 * allowing recursion by including itself in the closure.
 */
export class EnvBuilderVisitor extends TraverseVisitor {
  private env: EnvStack;

  constructor(baseEnv?: EnvStack) {
    super();
    this.env = baseEnv ?? createGlobalEnv();
  }

  public build(ast: AST): EnvStack {
    for (const node of ast) node.accept(this);
    return this.env;
  }
  visitSequence(node: Sequence): void {
    for (const stmt of node.statements) stmt.accept(this);
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

    let placeholder: RuntimeFunction;
    define(this.env, name, placeholder);

    const equations: EquationRuntime[] = node.equations.map((eq) => ({
      patterns: eq.patterns,
      body: eq.body,
    }));

    const runtimeFunc: RuntimeFunction = {
      type: "Function",
      identifier: name,
      arity,
      equations,
    };
    define(this.env, name, runtimeFunc);
  }
  visitClass(node: Class): void {
    const identifier = node.identifier.value;

    const superclass = node.extendsSymbol?.value;

    const mixins = node.includes.map((symbol) => symbol.value);

    const collector = new OOPCollector();
    node.expression.accept(collector);

    const fields = collector.collectedFields;
    const methods = collector.collectedMethods;

    const runtimeClass: RuntimeClass = {
      type: "Class",
      identifier,
      fields,
      methods,
      superclass,
      mixins,
    };

    define(this.env, identifier, runtimeClass);
  }
  visitFact(node: Fact): void {
    const identifier = node.identifier.value;
    const localEnv = this.env.head;
    const runtimeValue = localEnv.get(identifier);

    if (isRuntimePredicate(runtimeValue) && runtimeValue.kind === "Fact") {
      localEnv.set(identifier, {
        ...runtimeValue,
        equations: [...runtimeValue.equations, node],
      });
    } else {
      localEnv.set(identifier, {
        kind: "Fact",
        identifier,
        equations: [node],
      });
    }
  }

  visitRule(node: Rule): void {
    const identifier = node.identifier.value;
    const localEnv = this.env.head;
    const runtimeValue = localEnv.get(identifier);

    if (isRuntimePredicate(runtimeValue) && runtimeValue.kind === "Rule") {
      localEnv.set(identifier, {
        ...runtimeValue,
        equations: [...runtimeValue.equations, node],
      });
    } else {
      localEnv.set(identifier, {
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

class OOPCollector extends TraverseVisitor {
  public collectedMethods: Map<string, RuntimeFunction> = new Map();
  public collectedFields: Map<string, PrimitiveValue> = new Map();
  visitMethod(node: Method) {
    const runtimeMethod: RuntimeFunction = {
      type: "Function",
      identifier: node.identifier.value,
      arity: node.equations[0].patterns.length,
      equations: node.equations,
    };
    this.collectedMethods.set(node.identifier.value, runtimeMethod);
  }

  visitAttribute(node: Attribute) {
    this.collectedFields.set(
      node.identifier.value,
      InterpreterVisitor.evaluateLiteral(node.expression)
    );
  }
}
