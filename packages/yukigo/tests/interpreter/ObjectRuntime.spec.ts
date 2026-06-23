import { expect } from "chai";
import {
  UnguardedBody,
  Sequence,
  Return,
  SymbolPrimitive,
  NumberPrimitive,
  VariablePattern,
  StringPrimitive,
  Primitive,
  Super,
  ArithmeticBinaryOperation,
} from "yukigo-ast";
import { createGlobalEnv, EnvStack } from "../../src/interpreter/utils.js";
import { RuntimeContext } from "../../src/interpreter/components/RuntimeContext.js";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import {
  YuValue,
  RuntimeFunction,
  RuntimeClass,
  RuntimeObject,
  YuNumber,
  YuString,
} from "../../src/interpreter/primitives/index.js";

const createMethodMap = (
  methods: RuntimeFunction[],
): Map<string, RuntimeFunction> =>
  new Map(methods.map((m) => [m.identifier!, m]));
const createMethod = (name: string, returnVal: Primitive): RuntimeFunction => {
  return new RuntimeFunction(
    0,
    [
      {
        patterns: [],
        body: new UnguardedBody(new Sequence([new Return(returnVal)])),
      },
    ],
    name,
    [],
  );
};

const createClass = (
  env: EnvStack,
  name: string,
  superclass?: string,
  methodDefs: Map<string, RuntimeFunction> = new Map(),
  mixins: string[] = [],
): RuntimeClass => {
  const cls = new RuntimeClass(name, new Map(), methodDefs, mixins, superclass);
  env.head.set(name, cls);
  return cls;
};

describe("ctx.objRuntime", () => {
  let objectInstance: RuntimeObject;
  let kernel: YukigoKernel;
  const className = "TestClass";
  const initialFields = new Map<string, YuValue>([
    ["count", new YuNumber(10)],
    ["name", new YuString("Yukigo")],
  ]);
  const methods = new Map<string, RuntimeFunction>();
  const classDef = new RuntimeClass(
    className,
    initialFields,
    methods,
    [],
    undefined,
  );
  const env: EnvStack = createGlobalEnv();
  env.head.set(className, classDef);
  const ctx = new RuntimeContext();
  ctx.setEnv(env);
  beforeEach(() => {
    env.head.clear();
    env.head.set(className, classDef);
    objectInstance = classDef.instantiate("obj");
    kernel = new YukigoKernel(new InterpreterVisitor(ctx));
  });

  describe("instantiate()", () => {
    it("debe crear un objeto con la estructura correcta", () => {
      expect(objectInstance).to.be.an.instanceOf(RuntimeObject);
      expect(objectInstance.className).to.equal(className);
    });

    it("debe clonar el mapa de campos (no usar la referencia original)", () => {
      const fieldsDef = new Map([["x", new YuNumber(1)]]);
      const classA = new RuntimeClass("A", fieldsDef, new Map(), []);
      const obj = classA.instantiate("objA");

      fieldsDef.set("x", new YuNumber(2));

      expect((obj.fields.get("x") as YuValue).toJSON()).to.equal(1);
    });
  });

  describe("Field Access (Get/Set)", () => {
    it("getField debe devolver el valor de un campo existente", () => {
      const val = ctx.objRuntime.getField(objectInstance, "count");
      expect(val.toJSON()).to.equal(10);
    });

    it("getField debe lanzar error si el campo no existe", () => {
      expect(() => {
        ctx.objRuntime.getField(objectInstance, "non_existent");
      }).to.throw(/Field 'non_existent' not found/);
    });

    it("getField debe lanzar error si el target no es un objeto", () => {
      expect(() => {
        ctx.objRuntime.getField(new YuNumber(123) as any, "count");
      }).to.throw(/Target is not an object/);
    });

    it("setField debe actualizar el valor de un campo existente", () => {
      ctx.objRuntime.setField(objectInstance, "count", new YuNumber(20));
      expect((objectInstance.fields.get("count") as YuValue).toJSON()).to.equal(
        20,
      );
    });

    it("setField debe lanzar error si intentas crear un campo nuevo (strict mode)", () => {
      expect(() => {
        ctx.objRuntime.setField(objectInstance, "newProp", new YuNumber(99));
      }).to.throw(/Cannot set unknown field/);
    });
  });

  describe("dispatch()", () => {
    it("debe ejecutar un método que accede a 'self' (campos del objeto)", () => {
      const getCountMethod = new RuntimeFunction(
        0,
        [
          {
            patterns: [],
            body: new UnguardedBody(
              new Sequence([new Return(new SymbolPrimitive("count"))]),
            ),
          },
        ],
        "getCount",
        [],
      );

      objectInstance.methods.set("getCount", getCountMethod);

      const result = kernel.run(
        ctx.objRuntime.dispatch(objectInstance, "getCount", []),
      ) as YuValue;

      expect(result.toJSON()).to.equal(10);
    });

    it("debe fallar si el método no existe", () => {
      expect(() => {
        kernel.run(
          ctx.objRuntime.dispatch(objectInstance, "unknownMethod", []),
        );
      }).to.throw(/does not understand 'unknownMethod'/);
    });

    it("debe fallar si el receiver no es un objeto", () => {
      expect(() => {
        kernel.run(
          ctx.objRuntime.dispatch(
            new YuString("soy un string") as any,
            "toString",
            [],
          ),
        );
      }).to.throw(/is not an object/);
    });

    it("debe permitir argumentos en el método", () => {
      const returnArgAST = new Return(new SymbolPrimitive("val"));
      const addMethod = new RuntimeFunction(
        1,
        [
          {
            patterns: [new VariablePattern(new SymbolPrimitive("val"))],
            body: new UnguardedBody(new Sequence([returnArgAST])),
          },
        ],
        "echo",
        [],
      );

      objectInstance.methods.set("echo", addMethod);

      const result = kernel.run(
        ctx.objRuntime.dispatch(objectInstance, "echo", [new YuNumber(999)]),
      ) as YuValue;

      expect(result.toJSON()).to.equal(999);
    });
  });
  describe("Method Lookup", () => {
    it("debe delegar a la superclase si el método no está en la instancia ni en la clase", () => {
      createClass(
        env,
        "Animal",
        undefined,
        createMethodMap([createMethod("speak", new StringPrimitive("Guau"))]),
      );
      const Perro = createClass(env, "Perro", "Animal");

      const perro = Perro.instantiate("dogObj");

      const res = kernel.run(
        ctx.objRuntime.dispatch(perro, "speak", []),
      ) as YuValue;
      expect(res.toJSON()).to.equal("Guau");
    });

    it("debe subir múltiples niveles en la jerarquía (Abuelo -> Padre -> Hijo)", () => {
      createClass(
        env,
        "A",
        undefined,
        createMethodMap([createMethod("id", new NumberPrimitive(1))]),
      );
      createClass(env, "B", "A");
      const C = createClass(env, "C", "B");

      const objC = C.instantiate("objC");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(objC, "id", [])) as YuValue
        ).toJSON(),
      ).to.equal(1);
    });

    it("debe encontrar métodos definidos en un Mixin", () => {
      createClass(
        env,
        "Volador",
        undefined,
        createMethodMap([createMethod("volar", new StringPrimitive("Wosh"))]),
      );
      const Ave = createClass(env, "Ave", undefined, undefined, ["Volador"]);

      const pepita = Ave.instantiate("birdObj");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(pepita, "volar", [])) as YuValue
        ).toJSON(),
      ).to.equal("Wosh");
    });

    it("debe soportar Mixines recursivos (Mixin incluye otro Mixin)", () => {
      createClass(
        env,
        "HabilidadA",
        undefined,
        createMethodMap([createMethod("skill", new StringPrimitive("Fire"))]),
      );
      createClass(env, "HabilidadB", undefined, undefined, ["HabilidadA"]);
      const Heroe = createClass(env, "Heroe", undefined, undefined, [
        "HabilidadB",
      ]);

      const heroe = Heroe.instantiate("heroObj");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(heroe, "skill", [])) as YuValue
        ).toJSON(),
      ).to.equal("Fire");
    });

    it("Prioridad: La Clase Propia gana a Mixines y Superclase", () => {
      createClass(
        env,
        "Super",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(1))]),
      );
      createClass(
        env,
        "Mixin",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(2))]),
      );

      const Child = createClass(
        env,
        "Child",
        "Super",
        createMethodMap([createMethod("val", new NumberPrimitive(3))]),
        ["Mixin"],
      );

      const child = Child.instantiate("childObj");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(child, "val", [])) as YuValue
        ).toJSON(),
      ).to.equal(3);
    });

    it("Prioridad: El Mixin gana a la Superclase", () => {
      createClass(
        env,
        "Super",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(1))]),
      );
      createClass(
        env,
        "Mixin",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(2))]),
      );
      const Child = createClass(env, "Child", "Super", undefined, ["Mixin"]);

      const child = Child.instantiate("childObj");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(child, "val", [])) as YuValue
        ).toJSON(),
      ).to.equal(2);
    });

    it("Prioridad: El último Mixin de la lista gana (Shadowing de derecha a izquierda)", () => {
      createClass(
        env,
        "MixinA",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(10))]),
      );
      createClass(
        env,
        "MixinB",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(20))]),
      );

      const Clase = createClass(env, "Clase", undefined, undefined, [
        "MixinA",
        "MixinB",
      ]);

      const obj = Clase.instantiate("objC");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(obj, "val", [])) as YuValue
        ).toJSON(),
      ).to.equal(20);
    });

    it("Prioridad: Orden inverso de Mixines", () => {
      createClass(
        env,
        "MixinA",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(10))]),
      );
      createClass(
        env,
        "MixinB",
        undefined,
        createMethodMap([createMethod("val", new NumberPrimitive(20))]),
      );

      const Clase = createClass(env, "Clase", undefined, undefined, [
        "MixinB",
        "MixinA",
      ]);

      const obj = Clase.instantiate("obj");
      expect(
        (
          kernel.run(ctx.objRuntime.dispatch(obj, "val", [])) as YuValue
        ).toJSON(),
      ).to.equal(10);
    });
  });
  describe("Super", () => {
    it("debe invocar al método de la superclase y operar con el resultado", () => {
      createClass(
        env,
        "Base",
        undefined,
        createMethodMap([createMethod("calc", new NumberPrimitive(10))]),
      );

      const astBody = new UnguardedBody(
        new Sequence([
          new Return(
            new ArithmeticBinaryOperation(
              "Plus",
              new Super([]),
              new NumberPrimitive(5),
            ),
          ),
        ]),
      );

      const methodHijo = new RuntimeFunction(
        0,
        [
          {
            patterns: [],
            body: astBody,
          },
        ],
        "calc",
        [],
      );

      const Hijo = createClass(
        env,
        "Hijo",
        "Base",
        new Map([["calc", methodHijo]]),
        [],
      );

      const hijoInstance = Hijo.instantiate("childObj");

      const result = kernel.run(
        ctx.objRuntime.dispatch(hijoInstance, "calc", []),
      ) as YuValue;

      expect(result.toJSON()).to.equal(15);
    });
  });
});
