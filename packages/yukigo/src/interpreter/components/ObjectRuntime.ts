import {
  PrimitiveValue,
  RuntimeFunction,
  Expression,
  RuntimeObject,
  isRuntimeObject,
  isRuntimeClass,
} from "yukigo-ast";
import { EnvStack, InterpreterConfig } from "../index.js";
import { FunctionRuntime } from "./FunctionRuntime.js";
import { ExpressionEvaluator, lookup } from "../utils.js";
import { InterpreterError } from "../errors.js";

export class ObjectRuntime {
  /**
   * Creates a new instance of an Object.
   * Typically called by visitNew()
   */
  static instantiate(
    className: string,
    fieldDefinitions: Map<string, PrimitiveValue>, // Initial values
    methodDefinitions: Map<string, RuntimeFunction>
  ): RuntimeObject {
    return {
      type: "Object",
      className,
      // Clone fields so every instance has its own state
      fields: new Map(fieldDefinitions),
      // Methods can be shared by reference if they are pure,
      // or cloned if they capture closure. Usually sharing is fine.
      methods: methodDefinitions,
    };
  }

  /**
   * Handles Method Calls (Message Passing).
   * Reuses FunctionRuntime to execute the method body.
   */
  static dispatch(
    receiver: PrimitiveValue,
    methodName: string,
    args: PrimitiveValue[],
    env: EnvStack,
    evaluatorFactory: (env: EnvStack) => ExpressionEvaluator
  ): PrimitiveValue {
    // 1. Validar que es un objeto
    if (!isRuntimeObject(receiver)) {
      throw new InterpreterError(
        "MethodDispatch",
        `Cannot call method '${methodName}' on non-object of type ${typeof receiver}`
      );
    }

    // 2. BUSQUEDA (METHOD LOOKUP)
    // Primero buscamos en la instancia misma (caso Singleton o métodos ad-hoc)
    let method = receiver.methods.get(methodName);

    // Si no está en la instancia, subimos a la jerarquía (Clase -> Mixins -> Super)
    if (!method && receiver.className) {
      method = this.resolveMethodInHierarchy(
        receiver.className,
        methodName,
        env
      );
    }

    // 3. Si falló todo
    if (!method)
      throw new InterpreterError(
        "MethodDispatch",
        `Object of class '${receiver.className}' does not understand '${methodName}'`
      );

    // === THE OOP MAGIC ===
    const objectScope = new Map<string, PrimitiveValue>();

    // Bind 'self' -> SIEMPRE apunta a la instancia original (receiver)
    // aunque el método venga de un Mixin o Superclase.
    objectScope.set("self", receiver);

    // Bind fields (Implicit Access)
    for (const [key, val] of receiver.fields) {
      objectScope.set(key, val);
    }

    const methodEnv: EnvStack = [objectScope, ...env];

    return FunctionRuntime.apply(
      methodName,
      method.equations,
      args,
      methodEnv,
      evaluatorFactory
    );
  }

  private static resolveMethodInHierarchy(
    className: string,
    methodName: string,
    env: EnvStack
  ): RuntimeFunction | undefined {
    const classDef = lookup(env, className);
    if (!classDef || !isRuntimeClass(classDef)) return undefined;

    // search within the class
    if (classDef.methods.has(methodName))
      return classDef.methods.get(methodName);

    // search in the mixins. last to first
    if (classDef.mixins && classDef.mixins.length > 0) {
      for (let i = classDef.mixins.length - 1; i >= 0; i--) {
        const mixinName = classDef.mixins[i];
        // allow mixins to have mixins
        const mixinMethod = this.resolveMethodInHierarchy(
          mixinName,
          methodName,
          env
        );
        if (mixinMethod) return mixinMethod;
      }
    }

    // search in superclass
    if (classDef.superclass)
      return this.resolveMethodInHierarchy(
        classDef.superclass,
        methodName,
        env
      );

    return undefined;
  }

  /**
   * Field Access (Get)
   * e.g. self.myField
   */
  static getField(receiver: PrimitiveValue, fieldName: string): PrimitiveValue {
    if (!isRuntimeObject(receiver)) {
      throw new InterpreterError("FieldAccess", "Target is not an object");
    }

    if (!receiver.fields.has(fieldName)) {
      // Optional: Check methods if you want bound methods as properties
      if (receiver.methods.has(fieldName)) {
        return receiver.methods.get(fieldName);
      }
      throw new InterpreterError(
        "FieldAccess",
        `Field '${fieldName}' not found in ${receiver.className}`
      );
    }

    return receiver.fields.get(fieldName);
  }

  /**
   * Field Mutation (Set)
   * e.g. self.myField = 10
   */
  static setField(
    receiver: PrimitiveValue,
    fieldName: string,
    value: PrimitiveValue
  ): PrimitiveValue {
    if (!isRuntimeObject(receiver)) {
      throw new InterpreterError("FieldAssignment", "Target is not an object");
    }

    // Strict mode: Only allow setting existing fields?
    if (!receiver.fields.has(fieldName)) {
      throw new InterpreterError(
        "FieldAssignment",
        `Cannot set unknown field '${fieldName}'`
      );
    }

    receiver.fields.set(fieldName, value);
    return value;
  }
}
