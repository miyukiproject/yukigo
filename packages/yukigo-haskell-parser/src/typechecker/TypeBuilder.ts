import {
  SimpleType,
  TypeVar as ASTTypeVar,
  ListType,
  TupleType,
  ParameterizedType,
  TypeApplication,
  Constraint,
  Type as YukigoType,
  ConstrainedType,
  ASTNode,
} from "yukigo-ast";
import { typeMappings } from "../utils/types.js";
import { CoreHM } from "./core.js";
import { functionType, Type, TypeConstructor, TypeVar } from "./checker.js";

export class TypeBuilder {
  constructor(private coreHM: CoreHM) {}

  build(
    node: YukigoType,
    typeVarMap: Map<string, TypeVar> = new Map()
  ): { type: Type; constraints: Map<number, string[]> } {
    const constraintsMap = new Map<number, string[]>();

    // Local visitor to walk Yukigo type AST
    const visitor = {
      visitSimpleType: (n: SimpleType): Type => {
        if (/^[a-z]/.test(n.value)) {
          // Lowercase = type variable
          if (!typeVarMap.has(n.value)) {
            typeVarMap.set(n.value, {
              type: "TypeVar",
              ...this.coreHM.freshVar(),
              name: n.value,
            });
          }
          // Collect constraints on this type var
          for (const constraint of n.constraints) {
            this.processConstraint(constraint, typeVarMap, constraintsMap);
          }
          return typeVarMap.get(n.value)!;
        }

        // Uppercase = type constructor (e.g., Int, Bool, List)
        const primitive = typeMappings[n.value] || n.value;
        return {
          type: "TypeConstructor",
          name: primitive,
          args: [],
        };
      },

      visitTypeVar: (n: ASTTypeVar): Type => {
        // Same as SimpleType for type variables
        if (!typeVarMap.has(n.value)) {
          typeVarMap.set(n.value, {
            type: "TypeVar",
            ...this.coreHM.freshVar(),
            name: n.value,
          });
        }
        for (const constraint of n.constraints) {
          this.processConstraint(constraint, typeVarMap, constraintsMap);
        }
        return typeVarMap.get(n.value)!;
      },

      visitListType: (n: ListType): Type => {
        const elementType = n.values.accept(visitor);
        return {
          type: "TypeConstructor",
          name: "List",
          args: [elementType],
        };
      },

      visitTupleType: (n: TupleType): Type => {
        const elementTypes = n.values.map((v) => v.accept(visitor));
        return {
          type: "TypeConstructor",
          name: "Tuple",
          args: elementTypes,
        };
      },

      visitTypeApplication: (n: TypeApplication): Type => {
        return this.coreHM.freshVar();
      },

      visitParameterizedType: (n: ParameterizedType): Type => {
        // This represents function types with constraints, e.g.:
        // (a, b) => c with Eq a
        const returnType = n.returnType.accept(visitor);
        const paramTypes = n.inputs.map((input) => input.accept(visitor));

        // Build function type: a -> b -> c
        const funcType = paramTypes.reduceRight(
          (acc, param) => functionType(param, acc),
          returnType
        );

        // Process constraints
        for (const constraint of n.constraints) {
          this.processConstraint(constraint, typeVarMap, constraintsMap);
        }

        return funcType;
      },

      visitConstrainedType: (n: ConstrainedType): Type => {
        // This is unusual at top level; usually constraints appear on type vars or signatures
        // For now, ignore or throw
        throw new Error("ConstrainedType not expected in this context");
      },
      visit(node: ASTNode): Type {
        return node.accept(visitor);
      },
    };

    const type = node.accept(visitor);
    return { type, constraints: constraintsMap };
  }

  private processConstraint(
    constraint: Constraint,
    typeVarMap: Map<string, { type: "TypeVar"; id: number }>,
    constraintsMap: Map<number, string[]>
  ): void {
    // Assume constraint is of form `Eq a`, so first param is a type var
    if (constraint.parameters.length === 0) return;

    const firstParam = constraint.parameters[0];
    // Only handle if it's a type variable
    if (
      (firstParam instanceof SimpleType || firstParam instanceof ASTTypeVar) &&
      /^[a-z]/.test(firstParam.value)
    ) {
      const tv = typeVarMap.get(firstParam.value);
      if (tv) {
        if (!constraintsMap.has(tv.id)) {
          constraintsMap.set(tv.id, []);
        }
        constraintsMap.get(tv.id)!.push(constraint.name);
      }
    }
  }
}
