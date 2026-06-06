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
import { RuntimeContext } from "./RuntimeContext.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { YukigoKernel } from "./kernel/index.js";
import { EvalCommand } from "./kernel/commands.js";
import { PrimitiveValue } from "../../primitives/primitives.js";
import {
  EquationRuntime,
  RuntimeFunction,
} from "../../primitives/RuntimeFunction.js";
import { RuntimeClass } from "../../primitives/RuntimeClass.js";
import { RuntimeObject } from "../../primitives/RuntimeObject.js";
import {
  isRuntimePredicate,
  RuntimePredicate,
} from "../../primitives/RuntimePredicate.js";

class NotValidPredicate extends InterpreterError {
  constructor(identifier: string) {
    super(
      "[EnvBuilder]",
      `"${identifier}" is not a predicate. Maybe there is something else defined as "${identifier}"?`,
    );
  }
}

class FunctionWithNoEquations extends InterpreterError {
  constructor(identifier: string) {
    super("[EnvBuilder]", `Function ${identifier} has no equations`);
  }
}

class FunctionArityMismatch extends InterpreterError {
  constructor(identifier: string) {
    super(
      "[EnvBuilder]",
      `All equations of ${identifier} must have the same arity`,
    );
  }
}

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

    if (node.equations.length === 0) throw new FunctionWithNoEquations(name);

    const arity = node.equations[0].patterns.length;

    if (node.equations.some((eq) => eq.patterns.length !== arity))
      throw new FunctionArityMismatch(name);

    let placeholder = new RuntimeFunction(0, []);
    this.ctx.define(name, placeholder);

    const equations: EquationRuntime[] = node.equations.map((eq) => ({
      patterns: eq.patterns,
      body: eq.body,
    }));

    const runtimeFunc = new RuntimeFunction(
      arity,
      equations,
      name,
      undefined,
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

    const runtimeClass = new RuntimeClass(
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

    const runtimeObject = new RuntimeObject(identifier, "", fields, methods);

    this.ctx.define(identifier, runtimeObject);
  }
  visitFact(node: Fact): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining fact: ${identifier}`);

    if (this.ctx.isDefined(identifier)) {
      const runtimeValue = this.ctx.lookup(identifier);
      if (!isRuntimePredicate(runtimeValue))
        throw new NotValidPredicate(identifier);
      runtimeValue.addClause(node);
    } else {
      const predicate = new RuntimePredicate(identifier, [node]);
      this.ctx.define(identifier, predicate);
    }
  }

  visitRule(node: Rule): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining rule: ${identifier}`);

    if (this.ctx.isDefined(identifier)) {
      const runtimeValue = this.ctx.lookup(identifier);
      if (!isRuntimePredicate(runtimeValue))
        throw new NotValidPredicate(identifier);
      runtimeValue.addClause(node);
    } else {
      const predicate = new RuntimePredicate(identifier, [node]);
      this.ctx.define(identifier, predicate);
    }
  }
  visitVariable(node: Variable): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining variable: ${identifier}`);

    const visitor = new InterpreterVisitor(this.ctx);
    const kernel = new YukigoKernel(visitor);
    this.ctx.define(identifier, kernel.run(new EvalCommand(node.expression)));
  }
  visit(node: ASTNode): void {
    return node.accept(this);
  }
  public fallback(node: ASTNode): string {
    throw new UnexpectedNode(node.constructor.name, "EnvBuilderVisitor");
  }
}

class OOPCollector extends TraverseVisitor {
  public collectedMethods: Map<string, RuntimeFunction> = new Map();
  public collectedFields: Map<string, PrimitiveValue> = new Map();
  visitMethod(node: Method) {
    const runtimeMethod = new RuntimeFunction(
      node.equations[0].patterns.length,
      node.equations,
      node.identifier.value,
    );

    this.collectedMethods.set(node.identifier.value, runtimeMethod);
  }

  visitAttribute(node: Attribute) {
    this.collectedFields.set(
      node.identifier.value,
      InterpreterVisitor.evaluateLiteral(node.expression),
    );
  }
  public fallback(node: ASTNode): string {
    throw new UnexpectedNode(node.constructor.name, "OOPCollector");
  }
}
