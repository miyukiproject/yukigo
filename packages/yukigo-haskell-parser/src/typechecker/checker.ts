import {
  AST,
  Function,
  UnguardedBody,
  GuardedBody,
  Visitor,
  Return,
  isUnguardedBody,
  Sequence,
} from "yukigo-ast";
import { typeMappings } from "../utils/types.js";
import { InferenceEngine, PatternVisitor } from "./inference.js";
import { CoreHM } from "./core.js";
import { inspect } from "util";
import { DeclarationCollectorVisitor } from "./DeclarationCollector.js";

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
export const stringType: TypeConstructor = {
  type: "TypeConstructor",
  name: "YuString",
  args: [],
};
export const charType: TypeConstructor = {
  type: "TypeConstructor",
  name: "YuChar",
  args: [],
};

export class FunctionRegistrarVisitor implements Visitor<void> {
  constructor(
    private env: Environment,
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM
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
}
export class FunctionCheckerVisitor implements Visitor<void> {
  constructor(
    private environments: Environment[],
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM,
    private errors: string[]
  ) {}
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
        this.environments
      );
      const paramTypes = firstEq.patterns.map(() => this.coreHM.freshVar());

      paramTypes.forEach((type, i) => {
        try {
          new PatternVisitor(
            this.coreHM,
            this.signatureMap,
            type,
            this.environments,
            inferenceEngine
          ).visit(firstEq.patterns[i]);
        } catch (error) {
          this.errors.push(`Type error in '${functionName}': ${error.message}`);
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
              this.errors
            )
          )
        );
        const returnResult = equationStatements
          .find((stmt) => stmt instanceof Return)
          .accept(inferenceEngine);
        if (returnResult.success === false) {
          this.errors.push(
            `Type error in '${functionName}': ${returnResult.error}`
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
        inferredBodyType
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
          `Type error in '${functionName}': Too many parameters in equation ${index}. Expected max ${expectedArity}, got ${equation.patterns.length}`
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
          this.environments
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
                inferenceEngine
              )
            );
          } catch (error) {
            this.errors.push(
              `Type error in '${functionName}': ${error.message}`
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
                this.errors
              )
            )
          );
          const returnResult = equationStatements
            .find((stmt) => stmt instanceof Return)
            .accept(inferenceEngine);
          if (returnResult.success === false) {
            this.errors.push(
              `Type error in '${functionName}': ${returnResult.error}`
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
              booleanType
            );
            if (conditionSub.success === false) throw Error(conditionSub.error);
            let body = guard.body;
            if (guard.body instanceof Sequence) {
              body = guard.body.statements.find(
                (stmt) => stmt instanceof Return
              );
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
}

export class TypeChecker {
  private signatureMap: Map<string, TypeScheme>;
  private coreHM: CoreHM;
  private errors: string[];

  constructor() {
    this.signatureMap = new Map<string, TypeScheme>();
    this.errors = [];
  }
  check(ast: AST): string[] {
    const typeAliasMap = new Map<string, Type>();
    this.coreHM = new CoreHM(typeAliasMap);
    const recordMap = new Map<string, Type>();

    // Phase 1: Collect declarations
    const collector = new DeclarationCollectorVisitor(
      this.errors,
      typeAliasMap,
      recordMap,
      this.signatureMap,
      this.coreHM
    );
    for (const node of ast) {
      try {
        node.accept(collector);
      } catch (error) {
        this.errors.push(error);
      }
    }

    if (this.errors.length > 0) return this.errors;

    // Phase 2: Infer and check functions
    this.inferencePass(ast);

    return this.errors;
  }
  inferencePass(ast: AST): void {
    // Step 1: Register all functions in env
    const globalEnv = new Map<string, TypeScheme>(this.signatureMap);
    const visitor1 = new FunctionRegistrarVisitor(
      globalEnv,
      this.signatureMap,
      this.coreHM
    );
    for (const node of ast) {
      node.accept(visitor1);
    }
    // Step 2: Infer and check each function
    const visitor2 = new FunctionCheckerVisitor(
      [globalEnv],
      this.signatureMap,
      this.coreHM,
      this.errors
    );
    for (const node of ast) {
      node.accept(visitor2);
    }
  }
}

export function showType(t: Type): string {
  if (t.type === "TypeVar") return t.name ?? `t${t.id}`;

  if (isFunctionType(t)) {
    const a = showType(t.args[0]);
    const b = showType(t.args[1]);
    const aDisp = isFunctionType(t.args[0]) ? `(${a})` : a;
    return `${aDisp} -> ${b}`;
  }
  if (isListType(t)) return `[${showType(t.args[0])}]`;
  if (isTupleType(t)) return `(${t.args.map(showType.bind(this)).join(", ")})`;

  return t.args.length
    ? `${t.name} ${t.args.map(showType.bind(this)).join(" ")}`
    : t.name;
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
