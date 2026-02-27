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
  Object,
  RuntimeObject,
  Variable,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";
import { idContinuation, trampoline } from "../trampoline.js";
import { RuntimeContext } from "./RuntimeContext.js";
import { InterpreterError } from "../errors.js";

/**
 * Builds the initial environment by collecting all top-level function declarations.
 * Each function captures a closure of the environment at its definition time,
 * allowing recursion by including itself in the closure.
 */
export class EnvBuilderVisitor extends TraverseVisitor {
  constructor(private ctx: RuntimeContext) {
    super();
  }
  public build(ast: AST) {
    for (const node of ast) node.accept(this);
  }
  visitSequence(node: Sequence): void {
    for (const stmt of node.statements) stmt.accept(this);
  }
  visitFunction(node: Function): void {
    const name = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining function: ${name}`);

    if (node.equations.length === 0)
      throw new Error(`Function ${name} has no equations`);

    const arity = node.equations[0].patterns.length;

    if (node.equations.some((eq) => eq.patterns.length !== arity))
      throw new Error(`All equations of ${name} must have the same arity`);

    let placeholder: RuntimeFunction;
    this.ctx.define(name, placeholder);

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
    this.ctx.define(name, runtimeFunc);
  }
  visitClass(node: Class): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining class: ${identifier}`);

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

    this.ctx.define(identifier, runtimeClass);
  }
  visitObject(node: Object): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining object: ${identifier}`);

    const collector = new OOPCollector();
    node.expression.accept(collector);

    const fields = collector.collectedFields;
    const methods = collector.collectedMethods;

    const runtimeObject: RuntimeObject = {
      type: "Object",
      identifier,
      className: "",
      fields,
      methods,
    };

    this.ctx.define(identifier, runtimeObject);
  }
  visitFact(node: Fact): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining fact: ${identifier}`);
    try {
      const runtimeValue = this.ctx.lookup(identifier);
      if (!isRuntimePredicate(runtimeValue))
        throw new InterpreterError(
          "EnvBuilder",
          `"${identifier}" is not a predicate. Maybe there is something else defined as "${identifier}"?`,
        );
      runtimeValue.equations.push(node);
    } catch (error) {
      this.ctx.define(identifier, {
        kind: "Predicate",
        identifier,
        equations: [node],
      });
    }
  }

  visitRule(node: Rule): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining rule: ${identifier}`);
    try {
      const runtimeValue = this.ctx.lookup(identifier);
      if (!isRuntimePredicate(runtimeValue))
        throw new InterpreterError(
          "EnvBuilder",
          `"${identifier}" is not a predicate. Maybe there is something else defined as "${identifier}"?`,
        );
      runtimeValue.equations.push(node);
    } catch (error) {
      this.ctx.define(identifier, {
        kind: "Predicate",
        identifier,
        equations: [node],
      });
    }
  }
  visitVariable(node: Variable): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining variable: ${identifier}`);

    const interpreter = new InterpreterVisitor(this.ctx);
    const cps = node.expression.accept(interpreter);
    this.ctx.define(identifier, trampoline(cps(idContinuation)));
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
      InterpreterVisitor.evaluateLiteral(node.expression),
    );
  }
}
