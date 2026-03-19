import {
  AST,
  ASTNode,
  Attribute,
  Class,
  Fact,
  Function,
  Method,
  Rule,
  TraverseVisitor,
  Object,
  Variable,
  Sequence,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";
import { idContinuation, trampoline } from "../trampoline.js";
import { RuntimeContext } from "./RuntimeContext.js";
import { InterpreterError } from "../errors.js";
import {
  isRuntimePredicate,
  PrimitiveValue,
  RuntimeClass,
  RuntimeEquation,
  RuntimeFunction,
  RuntimeObject,
  RuntimePredicate,
} from "../entities.js";

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

    const equations: RuntimeEquation[] = node.equations.map(
      (eq) => new RuntimeEquation(eq.patterns, eq.body),
    );

    const runtimeFunc: RuntimeFunction = new RuntimeFunction(
      arity,
      name,
      equations,
      [],
      this.ctx.env,
    );
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

    const runtimeClass: RuntimeClass = new RuntimeClass(
      identifier,
      fields,
      methods,
      mixins,
      superclass,
    );

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

    const runtimeObject: RuntimeObject = new RuntimeObject(
      identifier,
      "",
      fields,
      methods,
    );

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
      runtimeValue.pushEquation(node);
    } catch (error) {
      this.ctx.define(
        identifier,
        new RuntimePredicate("Predicate", identifier, [node]),
      );
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
      this.ctx.define(
        identifier,
        new RuntimePredicate("Predicate", identifier, [node]),
      );
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
    const {
      identifier: { value },
      equations,
    } = node;
    const arity = node.equations[0].patterns.length;

    const runtimeMethod: RuntimeFunction = new RuntimeFunction(
      arity,
      value,
      equations,
      [],
    );

    this.collectedMethods.set(node.identifier.value, runtimeMethod);
  }

  visitAttribute(node: Attribute) {
    this.collectedFields.set(
      node.identifier.value,
      InterpreterVisitor.evaluateLiteral(node.expression),
    );
  }
}
