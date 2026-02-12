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
  Equation,
  Super,
  ArithmeticBinaryOperation,
  EnvStack,
} from "yukigo-ast";
import { ObjectRuntime } from "../../src/interpreter/components/ObjectRuntime.js";
import { InterpreterVisitor } from "../../src/interpreter/components/Visitor.js";
import { createGlobalEnv, lookup } from "../../src/interpreter/utils.js";
import { DefaultConfiguration } from "../../src/index.js";
import { Continuation, idContinuation, Thunk, trampoline } from "../../src/interpreter/trampoline.js";

const createEmptyEnv = () => ({ head: new Map(), tail: null });

const createMethodMap = (
  methods: RuntimeFunction[]
): Map<string, RuntimeFunction> =>
  new Map(methods.map((m) => [m.identifier, m]));
const createMethod = (name: string, returnVal: Primitive): RuntimeFunction => {
  return {
    type: "Function",
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
    evaluate: (n: any, k: Continuation<PrimitiveValue>): Thunk<PrimitiveValue> => {
      if (n instanceof NumberPrimitive) return k(n.value);
      if (n instanceof StringPrimitive) return k(n.value);
      if (n instanceof SymbolPrimitive) return k(lookup(env, n.value));
      throw new Error("Unexpected value in dummyFactory: " + n);
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
  const env: EnvStack = createGlobalEnv();
  env.head.set(className, classDef);
  beforeEach(() => {
    objectInstance = ObjectRuntime.instantiate(
      className,
      "obj",
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
      const obj = ObjectRuntime.instantiate("A", "objA", fieldsDef, new Map());

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
      ObjectRuntime.setField(objectInstance, "count", 20, DefaultConfiguration);
      expect(objectInstance.fields.get("count")).to.equal(20);
    });

    it("setField debe lanzar error si intentas crear un campo nuevo (strict mode)", () => {
      expect(() => {
        ObjectRuntime.setField(objectInstance, "newProp", 99, DefaultConfiguration);
      }).to.throw(/Cannot set unknown field/);
    });
  });

  describe("dispatch()", () => {
    it("debe ejecutar un método que accede a 'self' (campos del objeto)", () => {
      const getCountMethod: RuntimeFunction = {
        type: "Function",
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

      const result = trampoline(ObjectRuntime.dispatch(
        objectInstance,
        "getCount",
        [],
        env,
        dummyFactory,
        idContinuation
      ));

      expect(result).to.equal(10);
    });

    it("debe fallar si el método no existe", () => {
      expect(() => {
        trampoline(ObjectRuntime.dispatch(
          objectInstance,
          "unknownMethod",
          [],
          env,
          dummyFactory,
          idContinuation
        ));
      }).to.throw(/does not understand 'unknownMethod'/);
    });

    it("debe fallar si el receiver no es un objeto", () => {
      expect(() => {
        trampoline(ObjectRuntime.dispatch(
          "soy un string" as any,
          "toString",
          [],
          createEmptyEnv() as any,
          dummyFactory,
          idContinuation
        ));
      }).to.throw(/is not an object/);
    });

    it("debe permitir argumentos en el método", () => {
      const returnArgAST = new Return(new SymbolPrimitive("val"));
      const addMethod: RuntimeFunction = {
        type: "Function",
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

      const result = trampoline(ObjectRuntime.dispatch(
        objectInstance,
        "echo",
        [999],
        env,
        dummyFactory,
        idContinuation
      ));

      expect(result).to.equal(999);
    });
  });
  describe("Method Lookup", () => {
    it("debe delegar a la superclase si el método no está en la instancia ni en la clase", () => {
      env.head.set(
        "Animal",
        createClass(
          "Animal",
          undefined,
          createMethodMap([createMethod("speak", new StringPrimitive("Guau"))])
        )
      );
      env.head.set("Perro", createClass("Perro", "Animal"));

      const perro = ObjectRuntime.instantiate(
        "Perro",
        "dogObj",
        new Map(),
        new Map()
      );

      const res = trampoline(ObjectRuntime.dispatch(perro, "speak", [], env, dummyFactory, idContinuation));
      expect(res).to.equal("Guau");
    });

    it("debe subir múltiples niveles en la jerarquía (Abuelo -> Padre -> Hijo)", () => {
      env.head.set(
        "A",
        createClass(
          "A",
          undefined,
          createMethodMap([createMethod("id", new NumberPrimitive(1))])
        )
      );
      env.head.set("B", createClass("B", "A"));
      env.head.set("C", createClass("C", "B"));

      const objC = ObjectRuntime.instantiate("C", "objC", new Map(), new Map());
      expect(
        trampoline(ObjectRuntime.dispatch(objC, "id", [], env, dummyFactory, idContinuation))
      ).to.equal(1);
    });

    it("debe encontrar métodos definidos en un Mixin", () => {
      env.head.set(
        "Volador",
        createClass(
          "Volador",
          undefined,
          createMethodMap([createMethod("volar", new StringPrimitive("Wosh"))])
        )
      );
      env.head.set(
        "Ave",
        createClass("Ave", undefined, undefined, ["Volador"])
      );

      const pepita = ObjectRuntime.instantiate(
        "Ave",
        "birdObj",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(pepita, "volar", [], env, dummyFactory, idContinuation))
      ).to.equal("Wosh");
    });

    it("debe soportar Mixines recursivos (Mixin incluye otro Mixin)", () => {
      env.head.set(
        "HabilidadA",
        createClass(
          "HabilidadA",
          undefined,
          createMethodMap([createMethod("skill", new StringPrimitive("Fire"))])
        )
      );
      env.head.set(
        "HabilidadB",
        createClass("HabilidadB", undefined, undefined, ["HabilidadA"])
      );
      env.head.set(
        "Heroe",
        createClass("Heroe", undefined, undefined, ["HabilidadB"])
      );

      const heroe = ObjectRuntime.instantiate(
        "Heroe",
        "heroObj",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(heroe, "skill", [], env, dummyFactory, idContinuation))
      ).to.equal("Fire");
    });

    it("Prioridad: La Clase Propia gana a Mixines y Superclase", () => {
      env.head.set(
        "Super",
        createClass(
          "Super",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(1))])
        )
      );
      env.head.set(
        "Mixin",
        createClass(
          "Mixin",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(2))])
        )
      );

      env.head.set(
        "Child",
        createClass(
          "Child",
          "Super",
          createMethodMap([createMethod("val", new NumberPrimitive(3))]),
          ["Mixin"]
        )
      );

      const child = ObjectRuntime.instantiate(
        "Child",
        "childObj",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(child, "val", [], env, dummyFactory, idContinuation))
      ).to.equal(3);
    });

    it("Prioridad: El Mixin gana a la Superclase", () => {
      env.head.set(
        "Super",
        createClass(
          "Super",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(1))])
        )
      );
      env.head.set(
        "Mixin",
        createClass(
          "Mixin",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(2))])
        )
      );
      env.head.set(
        "Child",
        createClass("Child", "Super", undefined, ["Mixin"])
      );

      const child = ObjectRuntime.instantiate(
        "Child",
        "childObj",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(child, "val", [], env, dummyFactory, idContinuation))
      ).to.equal(2);
    });

    it("Prioridad: El último Mixin de la lista gana (Shadowing de derecha a izquierda)", () => {
      env.head.set(
        "MixinA",
        createClass(
          "MixinA",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(10))])
        )
      );
      env.head.set(
        "MixinB",
        createClass(
          "MixinB",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(20))])
        )
      );

      env.head.set(
        "Clase",
        createClass("Clase", undefined, undefined, ["MixinA", "MixinB"])
      );

      const obj = ObjectRuntime.instantiate(
        "Clase",
        "objC",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(obj, "val", [], env, dummyFactory, idContinuation))
      ).to.equal(20);
    });

    it("Prioridad: Orden inverso de Mixines", () => {
      env.head.set(
        "MixinA",
        createClass(
          "MixinA",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(10))])
        )
      );
      env.head.set(
        "MixinB",
        createClass(
          "MixinB",
          undefined,
          createMethodMap([createMethod("val", new NumberPrimitive(20))])
        )
      );

      env.head.set(
        "Clase",
        createClass("Clase", undefined, undefined, ["MixinB", "MixinA"])
      );

      const obj = ObjectRuntime.instantiate(
        "Clase",
        "obj",
        new Map(),
        new Map()
      );
      expect(
        trampoline(ObjectRuntime.dispatch(obj, "val", [], env, dummyFactory, idContinuation))
      ).to.equal(10);
    });
  });
  describe("Super", () => {
    it("debe invocar al método de la superclase y operar con el resultado", () => {
      env.head.set(
        "Base",
        createClass(
          "Base",
          undefined,
          createMethodMap([createMethod("calc", new NumberPrimitive(10))])
        )
      );

      const astBody = new UnguardedBody(
        new Sequence([
          new Return(
            new ArithmeticBinaryOperation(
              "Plus",
              new Super([]),
              new NumberPrimitive(5)
            )
          ),
        ])
      );

      const methodHijo: RuntimeFunction = {
        type: "Function",
        identifier: "calc",
        arity: 0,
        pendingArgs: [],
        equations: [
          {
            patterns: [],
            body: astBody,
          },
        ],
      };

      const Hijo: RuntimeClass = {
        type: "Class",
        identifier: "Hijo",
        fields: new Map(),
        methods: new Map([["calc", methodHijo]]),
        superclass: "Base",
        mixins: [],
      };
      env.head.set("Hijo", Hijo);

      const hijoInstance = ObjectRuntime.instantiate(
        "Hijo",
        "childObj",
        new Map(),
        new Map()
      );

      const result = trampoline(ObjectRuntime.dispatch(
        hijoInstance,
        "calc",
        [],
        env,
        (newEnv) => new InterpreterVisitor(newEnv, {}, []),
        idContinuation
      ));

      expect(result).to.equal(15);
    });
  });
});
