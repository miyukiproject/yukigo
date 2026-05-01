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