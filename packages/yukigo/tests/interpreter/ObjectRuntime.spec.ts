import { expect } from "chai";
import {
  PrimitiveValue,
  RuntimeFunction,
  UnguardedBody,
  Sequence,
  Return,
  SymbolPrimitive,
  NumberPrimitive,
  VariablePattern,
  RuntimeObject,
  RuntimeClass,
  StringPrimitive,
  Primitive,
} from "yukigo-ast";
import { EnvStack } from "../../src/index.js";
import { ObjectRuntime } from "../../src/interpreter/components/ObjectRuntime.js";

const createMethodMap = (
  methods: RuntimeFunction[]
): Map<string, RuntimeFunction> =>
  new Map(methods.map((m) => [m.identifier, m]));
const createMethod = (name: string, returnVal: Primitive): RuntimeFunction => {
  return {
    identifier: name,
    arity: 0,
    pendingArgs: [],
    equations: [
      {
        patterns: [],
        body: new UnguardedBody(new Sequence([new Return(returnVal)])),
      },
    ],
  };
};

const createClass = (
  name: string,
  superclass?: string,
  methodDefs: Map<string, RuntimeFunction> = new Map(),
  mixins: string[] = []
): RuntimeClass => {
  return {
    type: "Class",
    identifier: name,
    fields: new Map(),
    methods: methodDefs,
    superclass,
    mixins,
  };
};

const dummyFactory = (env: EnvStack) => {
  return {
    evaluate: (n: any) => {
      if (n instanceof NumberPrimitive) return n.value;
      if (n instanceof StringPrimitive) return n.value;
      if (n instanceof SymbolPrimitive) {
        for (const map of env) {
          if (map.has(n.value)) return map.get(n.value);
        }
        throw new Error(`Var ${n.value} not found in test env`);
      }
      throw new Error("Unexpected value in dummyFactory: ", n);
    },
  };
};

describe("ObjectRuntime", () => {
  let objectInstance: RuntimeObject;
  const className = "TestClass";
  const initialFields = new Map<string, PrimitiveValue>([
    ["count", 10],
    ["name", "Yukigo"],
  ]);
  const methods = new Map<string, RuntimeFunction>();
  const classDef: RuntimeClass = {
    type: "Class",
    identifier: className,
    fields: initialFields,
    methods,
    mixins: [],
    superclass: undefined,
  };
  const env: EnvStack = [new Map([[className, classDef]])];
  beforeEach(() => {
    objectInstance = ObjectRuntime.instantiate(
      className,
      initialFields,
      methods
    );
  });

  describe("instantiate()", () => {
    it("debe crear un objeto con la estructura correcta", () => {
      expect(objectInstance.type).to.equal("Object");
      expect(objectInstance.className).to.equal(className);
    });

    it("debe clonar el mapa de campos (no usar la referencia original)", () => {
      const fieldsDef = new Map([["x", 1]]);
      const obj = ObjectRuntime.instantiate("A", fieldsDef, new Map());

      fieldsDef.set("x", 2);

      expect(obj.fields.get("x")).to.equal(1);
    });
  });

  describe("Field Access (Get/Set)", () => {
    it("getField debe devolver el valor de un campo existente", () => {
      const val = ObjectRuntime.getField(objectInstance, "count");
      expect(val).to.equal(10);
    });

    it("getField debe lanzar error si el campo no existe", () => {
      expect(() => {
        ObjectRuntime.getField(objectInstance, "non_existent");
      }).to.throw(/Field 'non_existent' not found/);
    });

    it("getField debe lanzar error si el target no es un objeto", () => {
      expect(() => {
        ObjectRuntime.getField(123 as any, "count");
      }).to.throw(/Target is not an object/);
    });

    it("setField debe actualizar el valor de un campo existente", () => {
      ObjectRuntime.setField(objectInstance, "count", 20);
      expect(objectInstance.fields.get("count")).to.equal(20);
    });

    it("setField debe lanzar error si intentas crear un campo nuevo (strict mode)", () => {
      expect(() => {
        ObjectRuntime.setField(objectInstance, "newProp", 99);
      }).to.throw(/Cannot set unknown field/);
    });
  });

  describe("dispatch()", () => {
    it("debe ejecutar un método que accede a 'self' (campos del objeto)", () => {
      const getCountMethod: RuntimeFunction = {
        identifier: "getCount",
        arity: 0,
        pendingArgs: [],
        equations: [
          {
            patterns: [],
            body: new UnguardedBody(
              new Sequence([new Return(new SymbolPrimitive("count"))])
            ),
          },
        ],
      };

      objectInstance.methods.set("getCount", getCountMethod);

      const result = ObjectRuntime.dispatch(
        objectInstance,
        "getCount",
        [],
        [],
        dummyFactory
      );

      expect(result).to.equal(10);
    });

    it("debe fallar si el método no existe", () => {
      expect(() => {
        ObjectRuntime.dispatch(
          objectInstance,
          "unknownMethod",
          [],
          env,
          dummyFactory
        );
      }).to.throw(/does not understand 'unknownMethod'/);
    });

    it("debe fallar si el receiver no es un objeto", () => {
      expect(() => {
        ObjectRuntime.dispatch(
          "soy un string" as any,
          "toString",
          [],
          [],
          dummyFactory
        );
      }).to.throw(/Cannot call method 'toString' on non-object/);
    });

    it("debe permitir argumentos en el método", () => {
      const returnArgAST = new Return(new SymbolPrimitive("val"));
      const addMethod: RuntimeFunction = {
        identifier: "echo",
        arity: 1,
        pendingArgs: [],
        equations: [
          {
            patterns: [new VariablePattern(new SymbolPrimitive("val"))],
            body: new UnguardedBody(new Sequence([returnArgAST])),
          },
        ],
      };

      objectInstance.methods.set("echo", addMethod);

      const result = ObjectRuntime.dispatch(
        objectInstance,
        "echo",
        [999],
        [],
        dummyFactory
      );

      expect(result).to.equal(999);
    });
  });
  describe("Method Lookup", () => {
    it("debe delegar a la superclase si el método no está en la instancia ni en la clase", () => {
      env[0].set(
        "Animal",
        createClass(
          "Animal",
          undefined,
          createMethodMap([createMethod("speak", new StringPrimitive("Guau"))])
        )
      );
      env[0].set("Perro", createClass("Perro", "Animal"));

      const perro = ObjectRuntime.instantiate("Perro", new Map(), new Map());

      const res = ObjectRuntime.dispatch(perro, "speak", [], env, dummyFactory);
      expect(res).to.equal("Guau");
    });

    it("debe subir múltiples niveles en la jerarquía (Abuelo -> Padre -> Hijo)", () => {
      env[0].set(
        "A",
        createClass(
          "A",
          undefined,
          createMethodMap([createMethod("id", new NumberPrimitive(1))])
        )
      );
      env[0].set("B", createClass("B", "A"));
      env[0].set("C", createClass("C", "B"));

      const objC = ObjectRuntime.instantiate("C", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(objC, "id", [], env, dummyFactory)
      ).to.equal(1);
    });

    it("debe encontrar métodos definidos en un Mixin", () => {
      env[0].set(
        "Volador",
        createClass(
          "Volador",
          undefined,
          createMethodMap([createMethod("volar", new StringPrimitive("Wosh"))])
        )
      );
      env[0].set("Ave", createClass("Ave", undefined, undefined, ["Volador"]));

      const pepita = ObjectRuntime.instantiate("Ave", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(pepita, "volar", [], env, dummyFactory)
      ).to.equal("Wosh");
    });

    it("debe soportar Mixines recursivos (Mixin incluye otro Mixin)", () => {
      env[0].set(
        "HabilidadA",
        createClass(
          "HabilidadA",
          undefined,
          createMethodMap([createMethod("skill", new StringPrimitive("Fire"))])
        )
      );
      env[0].set(
        "HabilidadB",
        createClass("HabilidadB", undefined, undefined, ["HabilidadA"])
      );
      env[0].set(
        "Heroe",
        createClass("Heroe", undefined, undefined, ["HabilidadB"])
      );

      const heroe = ObjectRuntime.instantiate("Heroe", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(heroe, "skill", [], env, dummyFactory)
      ).to.equal("Fire");
    });

    it("Prioridad: La Clase Propia gana a Mixines y Superclase", () => {
      env[0].set(
        "Super",
        createClass(
          "Super",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(1))])
        )
      );
      env[0].set(
        "Mixin",
        createClass(
          "Mixin",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(2))])
        )
      );

      env[0].set(
        "Child",
        createClass(
          "Child",
          "Super",
          createMethodMap([createMethod("val", new NumberPrimitive(3))]),
          ["Mixin"]
        )
      );

      const child = ObjectRuntime.instantiate("Child", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(child, "val", [], env, dummyFactory)
      ).to.equal(3);
    });

    it("Prioridad: El Mixin gana a la Superclase", () => {
      env[0].set(
        "Super",
        createClass(
          "Super",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(1))])
        )
      );
      env[0].set(
        "Mixin",
        createClass(
          "Mixin",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(2))])
        )
      );
      env[0].set("Child", createClass("Child", "Super", undefined, ["Mixin"]));

      const child = ObjectRuntime.instantiate("Child", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(child, "val", [], env, dummyFactory)
      ).to.equal(2);
    });

    it("Prioridad: El último Mixin de la lista gana (Shadowing de derecha a izquierda)", () => {
      env[0].set(
        "MixinA",
        createClass(
          "MixinA",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(10))])
        )
      );
      env[0].set(
        "MixinB",
        createClass(
          "MixinB",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(20))])
        )
      );

      env[0].set(
        "Clase",
        createClass("Clase", undefined, undefined, ["MixinA", "MixinB"])
      );

      const obj = ObjectRuntime.instantiate("Clase", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(obj, "val", [], env, dummyFactory)
      ).to.equal(20);
    });

    it("Prioridad: Orden inverso de Mixines", () => {
      env[0].set(
        "MixinA",
        createClass(
          "MixinA",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(10))])
        )
      );
      env[0].set(
        "MixinB",
        createClass(
          "MixinB",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(20))])
        )
      );

      env[0].set(
        "Clase",
        createClass("Clase", undefined, undefined, ["MixinB", "MixinA"])
      );

      const obj = ObjectRuntime.instantiate("Clase", new Map(), new Map());
      expect(
        ObjectRuntime.dispatch(obj, "val", [], env, dummyFactory)
      ).to.equal(10);
    });
  });
});
