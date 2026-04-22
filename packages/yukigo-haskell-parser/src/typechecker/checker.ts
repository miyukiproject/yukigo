import {
  AST,
  Function,
  Visitor,
  Return,
  isUnguardedBody,
  Sequence,
  TestGroup,
  Test,
  Assert,
  ASTNode,
} from "yukigo-ast";
import { InferenceEngine, PatternVisitor } from "./inference.js";
import { CoreHM } from "./core.js";
import { DeclarationCollectorVisitor } from "./DeclarationCollector.js";
import { typeClasses as staticTypeClasses } from "../utils/types.js";

export interface TypeVar {
  type: "TypeVar";
  id: number;
  name?: string;
  constraints: string[];
}

export interface TypeConstructor {
  type: "TypeConstructor";
  name: string;
  args: Type[];
}
export interface FunctionType {
  type: "TypeConstructor";
  name: "->";
  args: [Type, Type];
}
export interface ListType {
  type: "TypeConstructor";
  name: "List";
  args: [Type];
}
export interface TupleType {
  type: "TypeConstructor";
  name: "Tuple";
  args: Type[];
}

export interface TypeScheme {
  type: "TypeScheme";
  quantifiers: number[];
  body: Type;
  constraints: Map<number, string[]>;
}

export type Type = TypeVar | TypeConstructor;

export type Environment = Map<string, TypeScheme>;

export type Substitution = Map<number, Type>;

export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export const booleanType: TypeConstructor = {
  type: "TypeConstructor",
  name: "YuBoolean",
  args: [],
};
export const numberType: TypeConstructor = {
  type: "TypeConstructor",
  name: "YuNumber",
  args: [],
};
export const charType: TypeConstructor = {
  type: "TypeConstructor",
  name: "YuChar",
  args: [],
};
export const stringType: Type = listType(charType);

export class FunctionRegistrarVisitor implements Visitor<void> {
  constructor(
    private env: Environment,
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM,
  ) {}
  visitSequence(node: Sequence): void {
    node.statements.forEach((stmt) => stmt.accept(this));
  }
  visitFunction(node: Function): void {
    const functionName = node.identifier.value;
    let funcScheme = this.signatureMap.get(functionName);
    if (!funcScheme) {
      const funcTypeVar = this.coreHM.freshVar();
      funcScheme = {
        type: "TypeScheme",
        quantifiers: [],
        body: funcTypeVar,
        constraints: new Map(),
      };
      this.env.set(functionName, funcScheme);
    }
    for (const equation of node.equations) {
      if (isUnguardedBody(equation.body)) {
        const statements = equation.body.sequence.statements;
        statements
          .filter((stmt) => stmt instanceof Function)
          .forEach((func) => {
            this.env.set(func.identifier.value, funcScheme);
          });
      } else {
        for (const guard of equation.body) {
          guard.body.accept(this);
        }
      }
    }
  }
  visitTestGroup(node: TestGroup): void {
    node.group.accept(this);
  }
  visitTest(node: Test): void {
    node.body.accept(this);
  }
  visitAssert(node: Assert): void {}
  fallback(node: ASTNode): void {}
}
export class FunctionCheckerVisitor implements Visitor<void> {
  constructor(
    private environments: Environment[],
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM,
    private errors: string[],
  ) {}
  visitTestGroup(node: TestGroup): void {
    node.group.accept(this);
  }
  visitTest(node: Test): void {
    node.body.accept(this);
  }
  visitAssert(node: Assert): void {
    const inferenceEngine = new InferenceEngine(
      this.signatureMap,
      this.coreHM,
      this.environments,
    );
    node.body.accept(inferenceEngine);
  }
  visitFunction(node: Function): void {
    const functionName = node.identifier.value;
    let funcScheme = this.signatureMap.get(functionName);
    // Handle function without signature
    if (!funcScheme) {
      const firstEq = node.equations[0];
      this.environments.unshift(new Map());
      const inferenceEngine = new InferenceEngine(
        this.signatureMap,
        this.coreHM,
        this.environments,
      );
      const paramTypes = firstEq.patterns.map(() => this.coreHM.freshVar());

      paramTypes.forEach((type, i) => {
        try {
          new PatternVisitor(
            this.coreHM,
            this.signatureMap,
            type,
            this.environments,
            inferenceEngine,
          ).visit(firstEq.patterns[i]);
        } catch (error) {
          this.errors.push(
            `Type error in '${functionName}': ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });

      let inferredBodyType: Type;
      if (isUnguardedBody(firstEq.body)) {
        const equationStatements = firstEq.body.sequence.statements;
        equationStatements.forEach((stmt) =>
          stmt.accept(
            new FunctionCheckerVisitor(
              this.environments,
              this.signatureMap,
              this.coreHM,
              this.errors,
            ),
          ),
        );
        const returnNode = equationStatements.find(
          (stmt) => stmt instanceof Return,
        );
        if (!returnNode) return;

        const returnResult = returnNode.accept(inferenceEngine);
        if (returnResult.success === false) {
          this.errors.push(
            `Type error in '${functionName}': ${returnResult.error}`,
          );
          return;
        }
        inferredBodyType = returnResult.value;
      } else {
        // Handle guarded body inference if necessary
        inferredBodyType = this.coreHM.freshVar(); // Placeholder
      }

      const fullFuncType = paramTypes.reduceRight(
        (acc, param) => functionType(param, acc),
        inferredBodyType,
      );

      // Generalize the inferred type to create a polymorphic type scheme
      this.environments.shift();
      funcScheme = this.coreHM.generalize(this.environments[0], fullFuncType);
      this.signatureMap.set(functionName, funcScheme);
      this.environments[0].set(functionName, funcScheme);
    }

    const expectedArity = getArity(this.coreHM.instantiate(funcScheme));
    for (const [index, equation] of node.equations.entries()) {
      if (equation.patterns.length > expectedArity) {
        this.errors.push(
          `Type error in '${functionName}': Too many parameters in equation ${index}. Expected max ${expectedArity}, got ${equation.patterns.length}`,
        );
        continue;
      }
      try {
        const funcType = this.coreHM.instantiate(funcScheme);

        // FIX 2: No buscamos el "ReturnType" final absoluto, sino el tipo restante
        // Si funcType es A -> B -> C y consumimos 1 patrón, el cuerpo debe ser B -> C
        let expectedBodyType = funcType;

        // "Pelamos" el tipo función tantas veces como argumentos explícitos tengamos
        for (let i = 0; i < equation.patterns.length; i++) {
          if (isFunctionType(expectedBodyType)) {
            expectedBodyType = expectedBodyType.args[1];
          }
        }
        const patternTypes = getArgumentTypes(funcType);

        this.environments.unshift(new Map());
        const inferenceEngine = new InferenceEngine(
          this.signatureMap,
          this.coreHM,
          this.environments,
        );
        equation.patterns.forEach((pattern, i) => {
          const argType = patternTypes[i]; // El tipo correspondiente a este patrón
          try {
            pattern.accept(
              new PatternVisitor(
                this.coreHM,
                this.signatureMap,
                argType,
                this.environments,
                inferenceEngine,
              ),
            );
          } catch (error) {
            this.errors.push(
              `Type error in '${functionName}': ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        });
        if (isUnguardedBody(equation.body)) {
          const equationStatements = equation.body.sequence.statements;
          equationStatements.forEach((stmt) =>
            stmt.accept(
              new FunctionCheckerVisitor(
                this.environments,
                this.signatureMap,
                this.coreHM,
                this.errors,
              ),
            ),
          );
          const returnNode = equationStatements.find(
            (stmt) => stmt instanceof Return,
          );
          if (!returnNode) return;
          const returnResult = returnNode.accept(inferenceEngine);
          if (returnResult.success === false) {
            this.errors.push(
              `Type error in '${functionName}': ${returnResult.error}`,
            );
            return;
          }

          const sub = this.coreHM.unify(returnResult.value, expectedBodyType);
          if (sub.success === false) throw Error(sub.error);
        } else {
          // Handles GuardedBody case
          for (const guard of equation.body) {
            // checks if condition expression in guard is a resolves to YuBoolean
            const condition = guard.condition.accept(inferenceEngine);
            if (condition.success === false) throw Error(condition.error);

            const conditionSub = this.coreHM.unify(
              condition.value,
              booleanType,
            );
            if (conditionSub.success === false) throw Error(conditionSub.error);
            let body = guard.body;
            if (guard.body instanceof Sequence) {
              const returnNode = guard.body.statements.find(
                (stmt) => stmt instanceof Return,
              );
              if (!returnNode) return;
              body = returnNode;
            }
            const bodyResult = body.accept(inferenceEngine);
            if (bodyResult.success === false) throw Error(bodyResult.error);
            const sub = this.coreHM.unify(bodyResult.value, expectedBodyType);
            if (sub.success === false) throw Error(sub.error);
          }
        }
        this.environments.shift();
      } catch (error: any) {
        this.errors.push(`Type error in '${functionName}': ${error.message}`);
      }
    }
  }
  fallback(node: ASTNode): void {}
}

export class TypeChecker {
  private signatureMap: Map<string, TypeScheme>;
  private errors: string[];
  private typeAliasMap = new Map<string, Type>();
  private coreHM = new CoreHM(this.typeAliasMap, new Map(staticTypeClasses));

  constructor() {
    this.signatureMap = new Map<string, TypeScheme>();
    this.errors = [];
  }
  check(ast: AST): string[] {
    const recordMap = new Map<string, Type>();

    // Phase 1: Collect declarations
    const collector = new DeclarationCollectorVisitor(
      this.errors,
      this.typeAliasMap,
      recordMap,
      this.signatureMap,
      this.coreHM,
    );
    for (const node of ast) {
      try {
        node.accept(collector);
      } catch (error) {
        this.errors.push(
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    if (this.errors.length > 0) return this.errors;

    // Phase 2: Infer and check functions
    this.inferencePass(ast);

    return this.errors;
  }
  public inferExpression(expr: ASTNode): string {
    if (!this.coreHM || !this.signatureMap)
      throw new Error("Environment not initialized.");

    const globalEnv = new Map<string, TypeScheme>(this.signatureMap);
    const inferenceEngine = new InferenceEngine(
      this.signatureMap,
      this.coreHM,
      [globalEnv],
    );
    const result = expr.accept(inferenceEngine);
    if (result.success === false) throw new Error(result.error);

    return showType(result.value);
  }
  public getKnownSymbols(): string[] {
    return Array.from(this.signatureMap.keys());
  }
  inferencePass(ast: AST): void {
    // Step 1: Register all functions in env
    const globalEnv = new Map<string, TypeScheme>(this.signatureMap);
    const visitor1 = new FunctionRegistrarVisitor(
      globalEnv,
      this.signatureMap,
      this.coreHM,
    );
    for (const node of ast) {
      node.accept(visitor1);
    }
    // Step 2: Infer and check each function
    const visitor2 = new FunctionCheckerVisitor(
      [globalEnv],
      this.signatureMap,
      this.coreHM,
      this.errors,
    );
    for (const node of ast) {
      node.accept(visitor2);
    }
  }
}

type SeenTypeNames = Map<number, string>;
const YuNameMap: Record<string, string> = {
  YuNumber: "YuNumber",
  YuString: "YuString",
  YuBoolean: "YuBoolean",
  YuChar: "YuChar",
};
const getVarName = (
  id: number,
  name: string | undefined,
  seen: SeenTypeNames,
): string => {
  if (name) return name;
  if (seen.has(id)) return seen.get(id)!;

  const index = seen.size;
  const letter = String.fromCharCode(97 + (index % 26));
  const suffix = index >= 26 ? Math.floor(index / 26).toString() : "";
  const generatedName = `${letter}${suffix}`;

  seen.set(id, generatedName);
  return generatedName;
};
const collectTypeVars = (t: Type): TypeVar[] =>
  t.type === "TypeVar" ? [t] : t.args.flatMap(collectTypeVars);
const formatBody = (t: Type, seen: SeenTypeNames): string => {
  if (t.type === "TypeVar") return getVarName(t.id, t.name, seen);

  if (isFunctionType(t)) {
    const left = formatBody(t.args[0], seen);
    const right = formatBody(t.args[1], seen);
    return isFunctionType(t.args[0])
      ? `(${left}) -> ${right}`
      : `${left} -> ${right}`;
  }
  if (isListType(t)) {
    if (t.args[0].type === "TypeConstructor" && t.args[0].name === "YuChar") {
      return "YuString";
    }
    return `[${showType(t.args[0])}]`;
  }
  if (isTupleType(t)) {
    return `(${t.args.map((arg) => showType(arg, seen)).join(", ")})`;
  }
  const name = YuNameMap[t.name] || t.name;
  return t.args.length
    ? `${name} ${t.args.map((a) => formatBody(a, seen)).join(" ")}`
    : name;
};

export function showType(t: Type, seen: SeenTypeNames = new Map()): string {
  const bodyStr = formatBody(t, seen);
  const constraints = Array.from(
    new Set(
      collectTypeVars(t).flatMap(({ constraints, id, name }) =>
        constraints.map((c) => `${c} ${getVarName(id, name, seen)}`),
      ),
    ),
  );
  if (constraints.length === 0) return bodyStr;
  const context =
    constraints.length === 1 ? constraints[0] : `(${constraints.join(", ")})`;
  return `${context} => ${bodyStr}`;
}

export function getReturnType(type: Type): Type {
  let t: Type = type;
  while (isFunctionType(t)) t = t.args[1];
  return t;
}
export function getArgumentTypes(type: Type): Type[] {
  const args: Type[] = [];
  let t: Type = type;
  while (isFunctionType(t)) {
    args.push(t.args[0]);
    t = t.args[1];
  }
  return args;
}
export function getArity(type: Type): number {
  return getArgumentTypes(type).length;
}

export function isFunctionType(t: Type): t is FunctionType {
  return t.type === "TypeConstructor" && t.name === "->" && t.args.length === 2;
}
export function isListType(t: Type): t is ListType {
  return t.name === "List";
}
export function isTupleType(t: Type): t is TupleType {
  return t.name === "Tuple";
}

export function functionType(params: Type, returnType: Type): FunctionType {
  return {
    type: "TypeConstructor",
    name: "->",
    args: [params, returnType],
  };
}
export function listType(elementsType: Type): ListType {
  return {
    type: "TypeConstructor",
    name: "List",
    args: [elementsType],
  };
}
