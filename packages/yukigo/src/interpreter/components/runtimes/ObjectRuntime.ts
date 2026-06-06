import {
  isRuntimeClass,
  RuntimeClass,
} from "../../../primitives/RuntimeClass.js";
import { RuntimeFunction } from "../../../primitives/RuntimeFunction.js";
import {
  isRuntimeObject,
  RuntimeObject,
} from "../../../primitives/RuntimeObject.js";
import { PrimitiveValue, EnvStack } from "../../../primitives/primitives.js";
import { InterpreterError } from "../../errors.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  BindCommand,
  StepCommand,
} from "../kernel/commands.js";

type OOPEntity = RuntimeClass | RuntimeObject;

type OOPMatch = {
  method: RuntimeFunction;
  holder: RuntimeObject | RuntimeClass;
};

export class ObjectRuntime {
  constructor(private context: RuntimeContext) {}
  /**
   * Handles Method Calls (Message Passing).
   * Reuses FunctionRuntime to execute the method body.
   */
  public dispatch(
    receiver: PrimitiveValue,
    methodName: string,
    args: PrimitiveValue[],
  ): ExecutionCommand {
    if (!isRuntimeObject(receiver))
      throw new Error(`${receiver} is not an object`);

    const chain = this.getResolutionChain(receiver);
    const match = this.findMethodInChain(chain, methodName);

    if (!match)
      throw new InterpreterError(
        "MethodDispatch",
        `${receiver.className} does not understand '${methodName}'.`,
      );

    const objectScope = receiver.createDispatchScope(match, methodName);
    this.context.pushEnv(objectScope);
    return new BindCommand(
      this.context.funcRuntime.apply(match.method, args),
      (res) => {
        this.context.popEnv();
        return new StepCommand(res);
      },
    );
  }

  /**
   * Handles calls to super() or super.method()
   */
  public dispatchSuper(
    methodName: string,
    args: PrimitiveValue[],
  ): ExecutionCommand {
    const self = this.context.lookup("self") as RuntimeObject;
    const currentHolder = this.context.lookup("__CONTEXT_CLASS__") as OOPEntity;
    const currentMethodName = this.context.lookup("__METHOD_NAME__");
    const targetMethodName = methodName || (currentMethodName as string);

    if (!self || !currentHolder)
      throw new InterpreterError(
        "SuperError",
        "'super' used outside of a method context",
      );

    const chain = this.getResolutionChain(self);

    const currentIndex = chain.findIndex((c) => c === currentHolder);

    if (currentIndex === -1)
      throw new Error("Fatal: Execution context not found in hierarchy chain");

    const remainingChain = chain.slice(currentIndex + 1);
    const match = this.findMethodInChain(remainingChain, targetMethodName);

    if (!match)
      throw new InterpreterError(
        "Super",
        `Super method '${targetMethodName}' not found`,
      );

    const objectScope = self.createDispatchScope(match, targetMethodName);

    this.context.pushEnv(objectScope);
    return new BindCommand(
      this.context.funcRuntime.apply(match.method, args),
      (res) => {
        this.context.popEnv();
        return new StepCommand(res);
      },
    );
  }

  private getResolutionChain(receiver: RuntimeObject): OOPEntity[] {
    const chain: OOPEntity[] = [receiver];

    if (receiver.className) {
      const hierarchy = this.expandClassHierarchy(receiver.className);
      chain.push(...hierarchy);
    }

    return chain;
  }
  private expandClassHierarchy(className: string): OOPEntity[] {
    const chain: OOPEntity[] = [];
    const visited = new Set<string>();
    const queue = [className];

    while (queue.length > 0) {
      const current = queue.shift()!;
      // occurs check to avoid circular loops
      if (visited.has(current)) continue;
      visited.add(current);
      
      const classDef = this.getClassDef(current);
      chain.push(classDef);
      queue.push(...classDef.getHierarchy());
    }

    return chain;
  }
  private getClassDef(name: string): RuntimeClass {
    const classDef = this.context.lookup(name);
    if (!isRuntimeClass(classDef))
      throw new InterpreterError(
        "expandClassHierarchy",
        "classDef was expected to be a RuntimeClass",
      );
    return classDef;
  }

  private findMethodInChain(
    chain: Array<OOPEntity>,
    methodName: string,
  ): OOPMatch | undefined {
    const match = chain.find((def) => def.methods.has(methodName));
    if (!match) return undefined;
    return {
      method: match.methods.get(methodName)!,
      holder: match,
    };
  }

  /**
   * Field Access (Get)
   * e.g. self.myField
   */
  public getField(receiver: PrimitiveValue, fieldName: string): PrimitiveValue {
    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAccess", "Target is not an object");

    if (receiver.hasMethod(fieldName)) return receiver.getMethod(fieldName);
    return receiver.getField(fieldName);
  }

  /**
   * Field Mutation (Set)
   * e.g. self.myField = 10
   */
  public setField(
    receiver: PrimitiveValue,
    fieldName: string,
    value: PrimitiveValue,
  ): PrimitiveValue {
    if (!this.context.config.mutability)
      throw new InterpreterError(
        "FieldAssignment",
        `Cannot mutate field '${fieldName}': mutability is disabled`,
      );

    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAssignment", "Target is not an object");

    receiver.setField(fieldName, value);
    return true;
  }
}
