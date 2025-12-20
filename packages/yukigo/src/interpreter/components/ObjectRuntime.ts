import {
  PrimitiveValue,
  RuntimeFunction,
  RuntimeObject,
  isRuntimeObject,
  isRuntimeClass,
  RuntimeClass,
  EnvStack,
} from "yukigo-ast";
import { FunctionRuntime } from "./FunctionRuntime.js";
import { ExpressionEvaluator, lookup, pushEnv } from "../utils.js";
import { InterpreterError } from "../errors.js";

type OOPEntity = RuntimeClass | RuntimeObject;

type OOPMatch = {
  method: RuntimeFunction;
  holder: RuntimeObject | RuntimeClass;
};

const __CONTEXT_CLASS__ = Symbol("CONTEXT_CLASS");
const __METHOD_NAME__ = Symbol("METHOD_NAME");

export class ObjectRuntime {
  /**
   * Creates a new instance of an Object.
   * Typically called by visitNew()
   */
  static instantiate(
    className: string,
    identifier: string,
    fieldDefinitions: Map<string, PrimitiveValue>,
    methodDefinitions: Map<string, RuntimeFunction>
  ): RuntimeObject {
    return {
      type: "Object",
      className,
      identifier,
      fields: new Map(fieldDefinitions),
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
    if (!isRuntimeObject(receiver))
      throw new Error(`${receiver} is not an object`);

    const chain = this.getResolutionChain(receiver, env);
    const match = this.findMethodInChain(chain, methodName);

    if (!match)
      throw new InterpreterError(
        "MethodDispatch",
        `${receiver.className} does not understand '${methodName}'.`
      );

    const objectScope = this.createDispatchScope(receiver, match, methodName);

    return FunctionRuntime.apply(
      methodName,
      match.method.equations,
      args,
      pushEnv(env, objectScope),
      evaluatorFactory
    );
  }

  /**
   * Maneja llamadas a super() o super.metodo()
   */
  static dispatchSuper(
    currentEnv: EnvStack,
    methodName: string,
    args: PrimitiveValue[],
    evaluatorFactory: (env: EnvStack) => ExpressionEvaluator
  ): PrimitiveValue {
    const self = lookup(currentEnv, "self") as RuntimeObject;
    const currentHolder = lookup(currentEnv, "__CONTEXT_CLASS__") as OOPEntity;
    const currentMethodName = lookup(currentEnv, "__METHOD_NAME__");
    const targetMethodName = methodName || currentMethodName;

    if (!self || !currentHolder)
      throw new InterpreterError(
        "SuperError",
        "'super' used outside of a method context"
      );

    const chain = this.getResolutionChain(self, currentEnv);

    const currentIndex = chain.findIndex((c) => c === currentHolder);

    if (currentIndex === -1)
      throw new Error("Fatal: Execution context not found in hierarchy chain");

    const remainingChain = chain.slice(currentIndex + 1);
    const match = this.findMethodInChain(remainingChain, methodName);

    if (!match)
      throw new InterpreterError(
        "Super",
        `Super method '${methodName}' not found`
      );

    const objectScope = this.createDispatchScope(self, match, targetMethodName);

    return FunctionRuntime.apply(
      methodName,
      match.method.equations,
      args,
      pushEnv(currentEnv, objectScope),
      evaluatorFactory
    );
  }
  private static createDispatchScope(
    self: RuntimeObject,
    match: OOPMatch,
    targetName: PrimitiveValue
  ) {
    const objectScope = new Map<string, PrimitiveValue>();
    objectScope.set("self", self);
    objectScope.set("__CONTEXT_CLASS__", match.holder);
    objectScope.set("__METHOD_NAME__", targetName);

    for (const [key, val] of self.fields) objectScope.set(key, val);
    return objectScope;
  }
  private static getResolutionChain(
    receiver: RuntimeObject,
    env: EnvStack
  ): Array<RuntimeObject | RuntimeClass> {
    const chain: Array<RuntimeObject | RuntimeClass> = [];

    chain.push(receiver);

    if (receiver.className) {
      this.expandClassHierarchy(receiver.className, env, chain);
    }

    return chain;
  }
  private static expandClassHierarchy(
    className: string,
    env: EnvStack,
    chain: Array<RuntimeObject | RuntimeClass>
  ) {
    const classDef = lookup(env, className);
    if (!isRuntimeClass(classDef))
      throw new InterpreterError(
        "expandClassHierarchy",
        "classDef was expected to be a RuntimeClass"
      );

    chain.push(classDef);

    const classDefCopy = [...classDef.mixins];

    if (classDef.mixins)
      classDefCopy.reverse().forEach((mixinName) => {
        this.expandClassHierarchy(mixinName, env, chain);
      });

    if (classDef.superclass)
      this.expandClassHierarchy(classDef.superclass, env, chain);
  }
  private static findMethodInChain(
    chain: Array<RuntimeObject | RuntimeClass>,
    methodName: string
  ): OOPMatch | undefined {
    for (const link of chain) {
      if (link.methods.has(methodName))
        return {
          method: link.methods.get(methodName)!,
          holder: link,
        };
    }
    return undefined;
  }

  /**
   * Field Access (Get)
   * e.g. self.myField
   */
  static getField(receiver: PrimitiveValue, fieldName: string): PrimitiveValue {
    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAccess", "Target is not an object");

    if (!receiver.fields.has(fieldName)) {
      if (receiver.methods.has(fieldName))
        return receiver.methods.get(fieldName);

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
    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAssignment", "Target is not an object");

    if (!receiver.fields.has(fieldName))
      throw new InterpreterError(
        "FieldAssignment",
        `Cannot set unknown field '${fieldName}'`
      );

    receiver.fields.set(fieldName, value);
    return value;
  }
}
