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
  NamedArgument,
} from "yukigo-ast";
import { InterpreterVisitor } from "./Visitor.js";
import { RuntimeContext } from "./RuntimeContext.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { YukigoKernel } from "./kernel/index.js";
import { EvalCommand } from "./kernel/commands.js";
import {
  RuntimeFunction,
  EquationRuntime,
  RuntimeClass,
  RuntimeObject,
  isRuntimePredicate,
  RuntimePredicate,
  YuValue,
} from "../primitives/index.js";

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
  private deferredInitializations: DeferredInitialization[] = [];
  constructor(private ctx: RuntimeContext) {
    super();
  }
  public build(ast: AST): void {
    this.declareGlobalSymbols(ast);
    this.initializeGlobalStates();
  }

  private declareGlobalSymbols(ast: AST): void {
    for (const node of ast) node.accept(this);
  }

  private initializeGlobalStates(): void {
    for (const initialization of this.deferredInitializations) {
      initialization.execute(this.ctx);
    }
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
    this.ctx.defineGlobal(name, placeholder);

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
    this.ctx.defineGlobal(name, runtimeFunc);
  }
  visitClass(node: Class): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining class: ${identifier}`);

    const superclass = node.extendsSymbol?.value;
    const mixins = node.includes.map((symbol) => symbol.value);

    const collector = new OOPCollector(this.ctx);
    node.expression.accept(collector);

    const fields = collector.collectedFields;
    const methods = collector.collectedMethods;

    const runtimeClass = new RuntimeClass(
      identifier,
      fields,
      methods,
      mixins,
      superclass,
      collector.fieldInitializers,
    );

    this.ctx.defineGlobal(identifier, runtimeClass);
  }
  visitObject(node: Object): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining object: ${identifier}`);

    const collector = new OOPCollector(this.ctx);
    node.expression.accept(collector);

    const fields = this.resolveObjectFields(node, collector);
    const methods = collector.collectedMethods;

    const runtimeObject = new RuntimeObject(
      identifier,
      (node as any).extendsSymbol?.value || "",
      fields,
      methods,
    );

    // Encolamos de forma declarativa la inicialización tardía delegando la tarea
    const initializers = this.collectAllInitializers(node, collector);
    this.deferredInitializations.push(
      new DeferredInitialization(runtimeObject, initializers),
    );

    this.ctx.defineGlobal(identifier, runtimeObject);
  }

  private resolveObjectFields(
    node: Object,
    collector: OOPCollector,
  ): Map<string, YuValue> {
    const fields = collector.collectedFields;
    const extendsSymbol = (node as any).extendsSymbol?.value;

    if (extendsSymbol) {
      const classDef = this.ctx.lookup(extendsSymbol);
      if (classDef && classDef instanceof RuntimeClass) {
        const inheritedFields = this.getClassFields(classDef);
        for (const [k, v] of inheritedFields.entries()) {
          if (!fields.has(k)) fields.set(k, v);
        }
      }
    }
    return fields;
  }

  private collectAllInitializers(
    node: Object,
    collector: OOPCollector,
  ): Map<string, ASTNode> {
    const initializers = new Map<string, ASTNode>();
    const extendsSymbol = (node as any).extendsSymbol?.value;

    // 1. Heredados de la Clase Madre
    if (extendsSymbol) {
      const classDef = this.ctx.lookup(extendsSymbol);
      if (classDef && classDef instanceof RuntimeClass) {
        for (const [k, expr] of this.getClassInitializers(classDef).entries()) {
          initializers.set(k, expr);
        }
      }
    }

    // 2. Definiciones locales del propio Objeto
    for (const [k, expr] of collector.fieldInitializers.entries()) {
      initializers.set(k, expr);
    }

    // 3. Argumentos nombrados por constructor inline
    const extendsArgs = (node as any).extendsArgs || [];
    for (const arg of extendsArgs) {
      if (
        arg instanceof NamedArgument ||
        arg.constructor.name === "NamedArgument"
      ) {
        initializers.set(
          (arg as any).identifier.value,
          (arg as any).expression,
        );
      }
    }

    return initializers;
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
      this.ctx.defineGlobal(identifier, predicate);
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
      this.ctx.defineGlobal(identifier, predicate);
    }
  }
  private getClassFields(classDef: RuntimeClass): Map<string, YuValue> {
    const fields = new Map<string, YuValue>();
    const collect = (c: RuntimeClass) => {
      if (c.superclass) {
        const superDef = this.ctx.lookup(c.superclass);
        if (superDef && superDef instanceof RuntimeClass) {
          collect(superDef);
        }
      }
      for (const mixin of c.mixins) {
        const mixinDef = this.ctx.lookup(mixin);
        if (mixinDef && mixinDef instanceof RuntimeClass) {
          collect(mixinDef);
        }
      }
      for (const [k, v] of c.fields.entries()) {
        fields.set(k, v);
      }
    };
    collect(classDef);
    return fields;
  }

  private getClassInitializers(classDef: RuntimeClass): Map<string, any> {
    const initializers = new Map<string, any>();
    const collect = (c: RuntimeClass) => {
      if (c.superclass) {
        const superDef = this.ctx.lookup(c.superclass);
        if (superDef && superDef instanceof RuntimeClass) {
          collect(superDef);
        }
      }
      for (const mixin of c.mixins) {
        const mixinDef = this.ctx.lookup(mixin);
        if (mixinDef && mixinDef instanceof RuntimeClass) {
          collect(mixinDef);
        }
      }
      const cInitializers = c.fieldInitializers;
      if (cInitializers) {
        for (const [k, v] of cInitializers.entries()) {
          initializers.set(k, v);
        }
      }
    };
    collect(classDef);
    return initializers;
  }

  visitVariable(node: Variable): void {
    const identifier = node.identifier.value;

    if (this.ctx.config.debug)
      console.log(`[EnvBuilder] Defining variable: ${identifier}`);

    const visitor = new InterpreterVisitor(this.ctx);
    const kernel = new YukigoKernel(visitor);
    this.ctx.defineGlobal(
      identifier,
      kernel.run(new EvalCommand(node.expression)),
    );
  }
  visit(node: ASTNode): void {
    return node.accept(this);
  }
  public fallback(node: ASTNode): string {
    throw new UnexpectedNode(node.constructor.name, "EnvBuilderVisitor");
  }
}

class DeferredInitialization {
  constructor(
    private runtimeObject: RuntimeObject,
    private initializers: Map<string, ASTNode>,
  ) {}

  public execute(ctx: RuntimeContext): void {
    for (const [fieldName, expression] of this.initializers.entries()) {
      this.initializeField(fieldName, expression, ctx);
    }
  }

  private initializeField(
    fieldName: string,
    expr: ASTNode,
    ctx: RuntimeContext,
  ): void {
    try {
      const rawResult = InterpreterVisitor.evaluateLiteral(expr, ctx);
      const evaluatedValue = this.resolveExecutionValue(rawResult, ctx);

      this.runtimeObject.setField(fieldName, evaluatedValue);
    } catch (error) {
      this.logWarning(fieldName, error, ctx);
    }
  }

  private resolveExecutionValue(rawResult: any, ctx: RuntimeContext): YuValue {
    // Si el resultado requiere ejecución diferida en el Kernel de Yukigo, lo resolvemos de forma atómica
    if (rawResult && typeof rawResult.execute === "function") {
      const visitor = new InterpreterVisitor(ctx);
      const uniqueKernel = new YukigoKernel(visitor, "first");
      return uniqueKernel.run(rawResult);
    }
    return rawResult;
  }

  private logWarning(fieldName: string, error: any, ctx: RuntimeContext): void {
    if (ctx.config.debug) {
      console.log(
        `[EnvBuilder] [Warning Tardío] No se pudo evaluar el atributo ${fieldName} en '${this.runtimeObject.identifier}':`,
        error,
      );
    }
  }
}

export class OOPCollector extends TraverseVisitor {
  public collectedMethods: Map<string, RuntimeFunction> = new Map();
  public collectedFields: Map<string, YuValue> = new Map();
  public fieldInitializers: Map<string, ASTNode> = new Map();

  constructor(private ctx: RuntimeContext) {
    super();
  }

  visitMethod(node: Method) {
    const name = node.identifier.value;
    const existing = this.collectedMethods.get(name);
    if (existing) {
      existing.equations.push(...node.equations);
    } else {
      const runtimeMethod = new RuntimeFunction(
        node.equations[0].patterns.length,
        [...node.equations],
        name,
      );
      this.collectedMethods.set(name, runtimeMethod);
    }
  }

  visitAttribute(node: Attribute) {
    const fieldName = node.identifier.value;
    // Registramos la expresión diferida
    this.fieldInitializers.set(fieldName, node.expression);

    // Inicializamos transitoriamente el campo con YuNil para reservar su espacio en la firma
    const initialPlaceholder = (global as any).YuNil?.getInstance() || null;
    this.collectedFields.set(fieldName, initialPlaceholder);
  }

  public fallback(node: ASTNode): string {
    throw new UnexpectedNode(node.constructor.name, "OOPCollector");
  }
}
