import {
  AST,
  ASTNode,
  Attribute,
  Class,
  EquationRuntime,
  Expression,
  Fact,
  Function,
  isRuntimePredicate,
  Method,
  PrimitiveValue,
  Rule,
  RuntimeClass,
  RuntimeFunction,
  Sequence,
  TraverseVisitor,
} from "yukigo-ast";
import { EnvStack } from "../index.js";
import { define } from "../utils.js";
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

    let placeholder: RuntimeFunction;
    define(this.env, name, placeholder);

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
  visitClass(node: Class): void {
    const identifier = node.identifier.value;

    // 1. Herencia Directa (Extends)
    const superclass = node.extendsSymbol?.value;

    // 2. Mixines (Includes) - ACCESO DIRECTO ESTRUCTURAL
    // Mapeamos los SymbolPrimitive a strings directamente
    const mixins = node.includes.map((symbol) => symbol.value);

    // 3. Recolectar el cuerpo (Solo Métodos y Atributos)
    const collector = new OOPCollector();
    node.expression.accept(collector);

    const fields = collector.collectedFields;
    const methods = collector.collectedMethods;

    // El collector ya NO recolecta mixines, porque ya los tenemos

    const runtimeClass: RuntimeClass = {
      type: "Class",
      identifier,
      fields,
      methods,
      superclass,
      mixins, // <--- Pasamos el array limpio
    };

    define(this.env, identifier, runtimeClass);
  }
  visitFact(node: Fact): void {
    const identifier = node.identifier.value;
    const runtimeValue = this.env[0].get(identifier);

    if (isRuntimePredicate(runtimeValue) && runtimeValue.kind === "Fact") {
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

    if (isRuntimePredicate(runtimeValue) && runtimeValue.kind === "Rule") {
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

class OOPCollector extends TraverseVisitor {
  public collectedMethods: Map<string, RuntimeFunction> = new Map();
  public collectedFields: Map<string, PrimitiveValue> = new Map();
  visitMethod(node: Method) {
    const runtimeMethod: RuntimeFunction = {
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
