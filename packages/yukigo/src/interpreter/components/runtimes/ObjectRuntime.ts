import { InterpreterError } from "../../errors.js";
import {
  YuValue,
  RuntimeClass,
  RuntimeObject,
  RuntimeFunction,
  isRuntimeObject,
  YuString,
  isRuntimeClass,
  YuBoolean,
} from "../../primitives/index.js";
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
    receiver: YuValue,
    methodName: string,
    args: YuValue[],
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

    const objectScope = receiver.createDispatchScope(
      match,
      new YuString(methodName),
    );
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
  public dispatchSuper(methodName: string, args: YuValue[]): ExecutionCommand {
    const self = this.context.lookup("self") as RuntimeObject;
    const currentHolder = this.context.lookup("__CONTEXT_CLASS__") as OOPEntity;
    const currentMethodName = this.context.lookup("__METHOD_NAME__");
    const targetMethodName = methodName
      ? new YuString(methodName)
      : (currentMethodName as YuString);

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
    const match = this.findMethodInChain(
      remainingChain,
      targetMethodName.toJSON(),
    );

    if (!match)
      throw new InterpreterError(
        "Super",
        `Super method '${targetMethodName.toJSON()}' not found`,
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
  public getField(receiver: YuValue, fieldName: string): YuValue {
    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAccess", "Target is not an object");

    if (receiver.hasMethod(fieldName)) return receiver.getMethod(fieldName);
    return receiver.getField(fieldName);
  }

  /**
   * Field Mutation (Set)
   * e.g. self.myField = 10
   */
  public setField(obj: YuValue, fieldName: string, value: YuValue): YuValue {
    if (!this.context.config.mutability)
      throw new InterpreterError(
        "FieldAssignment",
        `Cannot mutate field '${fieldName}': mutability is disabled`,
      );

    const receiver = this.getReceiver(obj);

    if (!isRuntimeObject(receiver))
      throw new InterpreterError("FieldAssignment", "Target is not an object");

    receiver.setField(fieldName, value);
    return new YuBoolean(true);
  }

  private getReceiver(obj: YuValue): OOPEntity {
    if (isRuntimeObject(obj) || isRuntimeClass(obj)) return obj;
    throw new InterpreterError(
      "ObjectRuntime",
      "Receiver is not an OOP entity",
    );
  }
}
