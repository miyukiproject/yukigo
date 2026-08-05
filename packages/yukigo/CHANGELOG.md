## 0.3.4 (2026-08-05)

### 🩹 Fixes

- **yukigo:** Fix MulangAdapter target suffix and matcher ([4d0a988](https://github.com/miyukiproject/yukigo/commit/4d0a988))
- **yukigo:** fix v0 Mulang Inspections translation ([2995ccc](https://github.com/miyukiproject/yukigo/commit/2995ccc))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.3.4

### ❤️ Thank You

- noiseArch

## 0.3.3 (2026-08-05)

### 🩹 Fixes

- **yukigo:** Fix MulangAdapter target suffix and matcher ([4d0a988](https://github.com/miyukiproject/yukigo/commit/4d0a988))
- **yukigo:** fix v0 Mulang Inspections translation ([2995ccc](https://github.com/miyukiproject/yukigo/commit/2995ccc))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.3.3

### ❤️ Thank You

- noiseArch

## 0.3.2 (2026-08-05)

### 🩹 Fixes

- **yukigo:** fix v0 Mulang Inspections translation ([2995ccc](https://github.com/miyukiproject/yukigo/commit/2995ccc))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.3.2

### ❤️ Thank You

- noiseArch

## 0.3.1 (2026-08-01)

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.3.1

## 0.3.0 (2026-08-01)

### 🚀 Features

- Interpreter NativeBody support & YukigoHooks ([0b854b4](https://github.com/miyukiproject/yukigo/commit/0b854b4))
- **interpreter:** implement semantic error handling and stack traces ([b61768f](https://github.com/miyukiproject/yukigo/commit/b61768f))
- **interpreter:** integrate Kernel as the primary execution engine ([503af3d](https://github.com/miyukiproject/yukigo/commit/503af3d))
- **interpreter:** introduce YukigoKernel and command-based infrastructure ([9380892](https://github.com/miyukiproject/yukigo/commit/9380892))
- **yukigo:** implement and test YukigoKernel ([3d42ac4](https://github.com/miyukiproject/yukigo/commit/3d42ac4))

### 🩹 Fixes

- **yukigo-e2e:** fixes to pass E2E tests ([02d895f](https://github.com/miyukiproject/yukigo/commit/02d895f))
- **yukigo:** allow concatenation with Plus operator ([7799416](https://github.com/miyukiproject/yukigo/commit/7799416))
- **yukigo:** fix circular dependency ([64534a8](https://github.com/miyukiproject/yukigo/commit/64534a8))
- **yukigo:** failed test didnt throw bc now it handles 1 + "a" ([23ebeb6](https://github.com/miyukiproject/yukigo/commit/23ebeb6))
- **yukigo:** zero-arity functions and Wollok bugs ([995dad4](https://github.com/miyukiproject/yukigo/commit/995dad4))
- **yukigo:** ObjectRuntime error should return RaiseCommand not FailCommand ([ccb31fa](https://github.com/miyukiproject/yukigo/commit/ccb31fa))
- **yukigo:** method registration with arity to allow overload ([8ffcb36](https://github.com/miyukiproject/yukigo/commit/8ffcb36))
- TypeSignature is not a Binding ([13c2c5a](https://github.com/miyukiproject/yukigo/commit/13c2c5a))
- **yukigo:** support If and Call nodes in LogicEngine ([a0f4086](https://github.com/miyukiproject/yukigo/commit/a0f4086))
- **yukigo:** fixed functional tester was evaluating logic tests ([914310e](https://github.com/miyukiproject/yukigo/commit/914310e))
- **yukigo:** solved scope leak at logical binary operations ([8779899](https://github.com/miyukiproject/yukigo/commit/8779899))
- ToString operator ([f5284ab](https://github.com/miyukiproject/yukigo/commit/f5284ab))
- **yukigo:** fix pattern matching in FunctionRuntime ([467cdf7](https://github.com/miyukiproject/yukigo/commit/467cdf7))
- **yukigo:** fix bitwise negation ([b13ef4d](https://github.com/miyukiproject/yukigo/commit/b13ef4d))
- **yukigo:** fix asynchronous logic unification and parameter resolution ([e467068](https://github.com/miyukiproject/yukigo/commit/e467068))
- **yukigo:** arreglo operaciones y sustitucion logica ([c95f33f](https://github.com/miyukiproject/yukigo/commit/c95f33f))
- fix parsers grammar compilation to export to .cjs ([ef59727](https://github.com/miyukiproject/yukigo/commit/ef59727))
- **yukigo:** fix tests to reflect correct representations ([76b1512](https://github.com/miyukiproject/yukigo/commit/76b1512))
- **yukigo:** fix Visitor and LazyRuntime to use new correct methods from context ([0eb9168](https://github.com/miyukiproject/yukigo/commit/0eb9168))
- **yukigo:** arreglos en logicengine ([0604555](https://github.com/miyukiproject/yukigo/commit/0604555))
- **yukigo:** fix mini error in oop test ([b9fd07e](https://github.com/miyukiproject/yukigo/commit/b9fd07e))
- **yukigo:** removed unwanted error handling ([0d1ff15](https://github.com/miyukiproject/yukigo/commit/0d1ff15))
- **yukigo:** replace instanceof with .is method in analyzer ([d953413](https://github.com/miyukiproject/yukigo/commit/d953413))
- **yukigo:** add InterpreterConfig as export ([280146c](https://github.com/miyukiproject/yukigo/commit/280146c))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.3.0

### ❤️ Thank You

- noiseArch

## 0.2.3 (2026-05-02)

### 🩹 Fixes

- **yukigo:** fix bugs on MulangAdapter ([7fc193d](https://github.com/miyukiproject/yukigo/commit/7fc193d))

### ❤️ Thank You

- noiseArch

## 0.2.2 (2026-05-01)

### 🩹 Fixes

- **yukigo:** MulangAdapter handle v1 and v2 inspections ([872558f](https://github.com/miyukiproject/yukigo/commit/872558f))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.2.1

### ❤️ Thank You

- noiseArch

## 0.2.1 (2026-05-01)

### 🩹 Fixes

- **yukigo:** MulangAdapter handle v1 and v2 inspections ([872558f](https://github.com/miyukiproject/yukigo/commit/872558f))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.2.0

### ❤️ Thank You

- noiseArch

## 0.2.0 (2026-04-11)

### 🚀 Features

- **yukigo:** agrego `clone` a `RuntimeContext` para clonar el entorno ([ee8e0af](https://github.com/miyukiproject/yukigo/commit/ee8e0af))

### 🩹 Fixes

- **yukigo:** permitir a las inspections tener args undefined ([4f36ebe](https://github.com/miyukiproject/yukigo/commit/4f36ebe))
- **yukigo:** Evaluar `Equal` y `NotEqual` fuera de `processBinary` ([31eca15](https://github.com/miyukiproject/yukigo/commit/31eca15))
- **yukigo:** delegue logica de deepEqual a LazyRuntime ([8496113](https://github.com/miyukiproject/yukigo/commit/8496113))
- **yukigo:** evaluateConcatLazy permite eager y lazy evaluation ([3faf646](https://github.com/miyukiproject/yukigo/commit/3faf646))
- **yukigo:** corrijo `isEqual` para que compare strings con listas ([d6225c9](https://github.com/miyukiproject/yukigo/commit/d6225c9))
- **yukigo:** corrijo manejo de entorno en `applyArguments` y `visitApplication` ([5c7ab1f](https://github.com/miyukiproject/yukigo/commit/5c7ab1f))
- **yukigo:** capturar correctamente el entorno en `evaluateCons` ([a1bc7a4](https://github.com/miyukiproject/yukigo/commit/a1bc7a4))
- **yukigo:** `popEnv` no tiene que esperar el `env` por parametro ([575bacf](https://github.com/miyukiproject/yukigo/commit/575bacf))
- **yukigo:** agrego metodo visitTypeCast faltante ([61c9984](https://github.com/miyukiproject/yukigo/commit/61c9984))

### 🧱 Updated Dependencies

- Updated yukigo-ast to 0.2.0

### ❤️ Thank You

- noiseArch

## 0.1.0 (2025-12-09)

### 🧱 Updated Dependencies

- Updated yukigo-prolog-parser to 0.1.0
- Updated yukigo-ast to 0.1.0