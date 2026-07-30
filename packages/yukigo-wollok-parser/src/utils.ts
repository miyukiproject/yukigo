import {
  BindCommand,
  ExecutionCommand,
  StepCommand,
} from "../../yukigo/dist/interpreter/components/kernel/commands.js";
import { RuntimeContext } from "../../yukigo/dist/interpreter/components/RuntimeContext.js";
import {
  YuValue,
  RuntimeObject,
  YuBoolean,
  YuNil,
  YuNumber,
  YuString,
} from "../../yukigo/dist/interpreter/primitives/index.js";
import { NativeExtension } from "../../yukigo/dist/interpreter/utils.js";

function isExecutionCommand(value: any): value is ExecutionCommand {
  return (
    value && typeof value === "object" && typeof value.execute === "function"
  );
}

export function runGeneratorCommand(
  gen: Generator<any, any, any>,
): ExecutionCommand {
  const handle = (result: IteratorResult<any>): ExecutionCommand => {
    if (result.done) {
      // El return final del generador es nuestro resultado de éxito
      return isExecutionCommand(result.value)
        ? result.value
        : new StepCommand(result.value);
    }

    const yieldedValue = result.value;

    // Si el generador nos dio un comando de Yukigo, nos acoplamos a su resolución
    if (isExecutionCommand(yieldedValue)) {
      return new BindCommand(yieldedValue, (nextVal) =>
        handle(gen.next(nextVal)),
      );
    }

    // Si es un valor plano o un sub-generador no resuelto, avanzamos pasándoselo
    return new BindCommand(new StepCommand(yieldedValue), (nextVal) =>
      handle(gen.next(nextVal)),
    );
  };

  return handle(gen.next());
}

export class WollokNativeBridge {
  constructor(private ctx: RuntimeContext) {}

  /**
   * Traduce tipos primitivos de JavaScript a las primitivas de Yukigo.
   * Usa un generador para que coincida con el `yield* this.reify(...)` del repo.
   */
  public *reify(value: any): Generator<any, YuValue, any> {
    if (value === null || value === undefined) {
      return this.ctx.lookup("void") ?? YuNil.getInstance();
    }
    if (typeof value === "number") return new YuNumber(value);
    if (typeof value === "string") return new YuString(value);
    if (typeof value === "boolean") return new YuBoolean(value);

    // Si ya es un YuValue, lo devolvemos directo
    if (value instanceof YuValue) return value;

    throw new Error(
      `[WollokBridge]: Cannot reify unknown primitive type: ${typeof value}`,
    );
  }

  /**
   * Instancia una clase/módulo de Wollok y le setea sus campos iniciales.
   */
  public *instantiate(
    className: string | { fullyQualifiedName: string; name?: string },
    initialFields: Record<string, YuValue>,
  ): Generator<any, any, any> {
    const classStr =
      typeof className === "string"
        ? className
        : className.name || className.fullyQualifiedName;
    const shortName = classStr.includes(".")
      ? classStr.split(".").pop()!
      : classStr;

    // 1. Caminamos la cadena hacia arriba para ubicar el Map raíz definitivo de la sesión
    let currentEnv = this.ctx.env;
    while (currentEnv && currentEnv.tail !== null) {
      currentEnv = currentEnv.tail;
    }

    // 2. Buscamos la clase directamente en la raíz de la memoria persistente del proceso
    let classDef = currentEnv ? currentEnv.head.get(shortName) : undefined;

    // 3. Fallback: Si por alguna razón la inicialización la guardó en un eslabón previo, usamos el lookup clásico
    if (!classDef) {
      try {
        classDef = this.ctx.lookup(shortName);
      } catch (e) {
        // Si tampoco está, tiramos un error claro describiendo la memoria raíz actual
        const rootKeys = currentEnv ? Array.from(currentEnv.head.keys()) : [];
        throw new Error(
          `[WollokBridge]: Class '${shortName}' not found. ` +
            `Keys available in global root scope: [${rootKeys.join(", ")}]`,
        );
      }
    }

    const instance = (classDef as any).instantiate(
      "instance_" + Math.random().toString(36).substring(7),
    );

    for (const [fieldName, yuValue] of Object.entries(initialFields)) {
      instance.setField(fieldName, yuValue);
    }

    return instance;
  }
  /**
   * El método send que invocan los nativos del repo
   */
  public *send(
    methodName: string,
    target: any,
    ...args: any[]
  ): Generator<any, any, any> {
    // Le delegamos el despacho al ObjectRuntime políglota de Yukigo
    const command = this.ctx.objRuntime.dispatch(target, methodName, args);

    // Hacemos yield del comando para que runGeneratorCommand lo resuelva en tu kernel
    return yield command;
  }
}

type WollokNativeFunction = (
  self: any,
  args: any[],
  ctx: any,
) => Generator<any, any, any>;

function toWollokFacade(arg: any): any {
  if (!arg || typeof arg !== "object") return arg;
  const innerVal = typeof arg.value !== "undefined" ? arg.value : arg;
  const objectName = arg.className || arg.identifier || "Object";
  return {
    id: arg.id,
    innerNumber: typeof innerVal === "number" ? innerVal : arg.innerNumber,
    innerString: typeof innerVal === "string" ? innerVal : arg.innerString,
    innerBoolean: typeof innerVal === "boolean" ? innerVal : arg.innerBoolean,
    innerValue: innerVal,
    fields: arg.fields,
    get: (fieldName: string) => {
      const raw = arg.fields?.get(fieldName);
      if (!raw) return raw;
      const val = typeof raw.value !== "undefined" ? raw.value : raw;
      return {
        innerNumber: typeof val === "number" ? val : val?.innerNumber,
        innerString: typeof val === "string" ? val : val?.innerString,
        innerBoolean: typeof val === "boolean" ? val : val?.innerBoolean,
        innerValue: val,
      };
    },
    getField: (fieldName: string) => {
      if (typeof arg.getField === "function") return arg.getField(fieldName);
      return arg.fields?.get(fieldName);
    },
    module: {
      fullyQualifiedName: objectName,
      name: objectName,
      is: () => true,
    },
  };
}

export function buildWollokNativeProviders(
  specs: Record<string, Record<string, WollokNativeFunction>>,
): Map<string, any> {
  const providers = new Map<string, any>();

  for (const [scopeName, methods] of Object.entries(specs)) {
    for (const [methodName, nativeFunction] of Object.entries(methods)) {
      const lookupKey = `${scopeName}.${methodName}`;

      providers.set(lookupKey, (self: any, args: any[], ctx: any) => {
        // 1. Serializamos los campos internos del RuntimeObject de Yukigo (si tiene)
        if (self.fields && self.fields.size > 0) {
          const pairs: string[] = [];
          for (const [key, variable] of self.fields.entries()) {
            const innerVal: any = getInnerValue(variable);

            // Desactivamos el envoltorio de los primitivos de Yukigo (YuNumber, YuString, YuBoolean)
            const finalPlainValue =
              innerVal && typeof innerVal.value !== "undefined"
                ? innerVal.value
                : innerVal;

            pairs.push(`${key}=${finalPlainValue}`);
          }
        }

        const wollokFacade = toWollokFacade(self);
        const wrappedArgs = args.map((a) => toWollokFacade(a));

        // 3. Armamos el contexto simulado para el Bridge, incluyendo el reify
        const bridge = new WollokNativeBridge(ctx);
        const bridgeContext = {
          ...methods, // Heredamos los otros métodos hermanos
          reify: bridge.reify.bind(bridge),
          instantiate: bridge.instantiate.bind(bridge),
          send: bridge.send.bind(bridge),
        };

        // 4. Vinculamos el generador nativo al bridge simulado
        const boundNativeFunction = nativeFunction.bind(bridgeContext);
        const iterator = (boundNativeFunction as any)(
          wollokFacade,
          ...wrappedArgs,
        );

        // Tu pump recursivo CPS sigue exactamente igual
        const pump = (lastResult: any): any => {
          const nextStep = iterator.next(lastResult);

          if (nextStep.done) {
            const finalVal = nextStep.value;
            return finalVal && typeof (finalVal as any).execute === "function"
              ? finalVal
              : new StepCommand(finalVal);
          }

          const yieldedValue = nextStep.value;
          if (
            yieldedValue &&
            typeof (yieldedValue as any).execute === "function"
          ) {
            return new BindCommand(yieldedValue, (resolved) => pump(resolved));
          }

          return pump(yieldedValue);
        };

        return pump(undefined);
      });
    }
  }

  return providers;
}

const getInnerValue = (variable) => {
  // Si la variable contiene una celda o una expresión mutable interna de Yukigo, la abrimos paso a paso
  if (variable && typeof variable === "object") {
    if (typeof variable.value !== "undefined") {
      return variable.value;
    } else if (
      variable.expression &&
      typeof variable.expression.value !== "undefined"
    ) {
      return variable.expression.value;
    } else if (typeof variable.getValue === "function") {
      return variable.getValue();
    }
  }
  return variable
};
