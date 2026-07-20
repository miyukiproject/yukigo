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
  YuArray,
  YuNumber,
} from "../../primitives/index.js";
import { error, raise } from "../../utils.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  BindCommand,
  StepCommand,
  FailCommand,
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
    if (!isRuntimeObject(receiver)) {
      console.log("Dispatching primitive", receiver, methodName, args);
      return this.dispatchPrimitive(receiver, methodName, args);
    }

    const chain = this.getResolutionChain(receiver);

    const arity = args.length;
    const arityKey = `${methodName}/${arity}`;

    let match = this.findMethodInChain(chain, arityKey);

    if (!match) {
      match = this.findMethodInChain(chain, methodName);
    }

    if (!match) {
      if (receiver.hasField(methodName)) {
        if (args.length === 0) {
          return new StepCommand(receiver.getField(methodName));
        } else if (args.length === 1) {
          receiver.setField(methodName, args[0]);
          return new StepCommand(receiver);
        }
      }
      if (methodName === "toString") {
        return new StepCommand(new YuString(receiver.toString()));
      }
      if (methodName === "error") {
        const errorMsg = args[0] ? args[0].toString() : "An error occurred";
        return new FailCommand(new InterpreterError("Raise", errorMsg));
      }
      console.log("El objeto destinatario", receiver);
      return raise(
        error(
          "MethodDispatch",
          `${receiver.className} does not understand '${methodName}'.`,
        ),
      );
    }

    const objectScope = receiver.createDispatchScope(
      match,
      new YuString(methodName),
    );
    this.context.pushEnv(objectScope);
    return new BindCommand(
      this.context.funcRuntime.apply(match.method, args),
      (res) => {
        console.log("ObjectRuntime.dispatch", res);
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

    if (!self || !currentHolder)
      return raise(
        error("dispatchSuper", "'super' used outside of a method context"),
      );

    const chain = this.getResolutionChain(self);
    const currentIndex = chain.findIndex((c) => c === currentHolder);

    if (currentIndex === -1)
      return raise(
        error(
          "dispatchSuper",
          "Execution context not found in hierarchy chain",
        ),
      );

    const remainingChain = chain.slice(currentIndex + 1);

    const baseName = methodName || (currentMethodName as YuString).toJSON();
    const arityKey = `${baseName}/${args.length}`;

    let match = this.findMethodInChain(remainingChain, arityKey);

    // Fallback: si no encuentra con aridad, buscar solo por nombre (para compatibilidad)
    if (!match && methodName) {
      match = this.findMethodInChain(remainingChain, methodName);
    }
    if (!match && !methodName) {
      match = this.findMethodInChain(
        remainingChain,
        (currentMethodName as YuString).toJSON(),
      );
    }

    if (!match)
      return raise(error("Super", `Super method '${baseName}' not found`));

    const objectScope = self.createDispatchScope(match, new YuString(baseName));
    this.context.pushEnv(objectScope);

    return new BindCommand(
      this.context.funcRuntime.apply(match.method, args),
      (res) => {
        this.context.popEnv();
        return new StepCommand(res);
      },
    );
  }

  public getResolutionChain(receiver: RuntimeObject): OOPEntity[] {
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
      throw error(
        "expandClassHierarchy",
        "classDef was expected to be a RuntimeClass",
      );
    return classDef;
  }

  public findMethodInChain(
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

  public dispatchPrimitive(
    receiver: YuValue,
    methodName: string,
    args: YuValue[],
  ): ExecutionCommand {
    // Obtenemos el identificador polimórfico del tipo (ej: "YuArray", "YuNumber", "YuString", "RuntimeFunction")
    const typeKey = receiver.constructor.name;
    const lookupKey = `${typeKey}.${methodName}`;

    // Buscamos si el ecosistema/lenguaje proveyó una implementación externa para este caso
    const nativeImpl = this.context.config.nativeProviders.get(lookupKey);

    if (nativeImpl) {
      // Delegamos la subtarea de forma declarativa pasándole el receptor como contexto
      return new BindCommand(
        nativeImpl(receiver, args, this.context),
        (res) => new StepCommand(res),
      );
    }

    return raise(
      error(
        "ObjectRuntime.dispatch",
        `Primitive type '${typeKey}' does not understand method '${methodName}'.`,
      ),
    );
  }
}
