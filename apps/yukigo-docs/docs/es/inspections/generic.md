# Inspecciones Genéricas

| Inspección (v2 / v0)               | Significado
|-----------------------------------|------------------------------------------------------
| `Assigns`                         | ¿se asigna la variable o atributo especificado?
| `Calls`                           | ¿se llama al método, función o procedimiento especificado?
| `Declares` / `HasBinding`         | ¿se declara el elemento especificado?
| `DeclaresComputation`             | ¿existe el cómputo especificado (método, predicado, función, etc.)?
| `DeclaresComputationWithArity` / `HasArity` | ¿el cómputo especificado posee la aridad dada?
| `DeclaresEntryPoint`              | ¿existe un punto de entrada al programa, como un procedimiento `main`?
| `DeclaresFunction`                | ¿se declara una función especificada?
| `DeclaresRecursively`             | ¿se declara un cómputo dado utilizando recursión?
| `DeclaresTypeAlias` / `HasTypeDeclaration` | ¿se declara un sinónimo/alias de tipo especificado?
| `DeclaresTypeSignature` / `HasTypeSignature` | ¿se declara la firma de tipo de un cómputo especificado?
| `DeclaresVariable` / `HasVariable` | ¿se declara una variable local o global especificada?
| `HasBinding`                      | verifica si existe una declaración / binding dado en el alcance
| `HasDirectRecursion`              | ¿el cómputo se llama a sí mismo de forma directa?
| `Raises`                          | ¿se lanza el _tipo de excepción_ especificado?
| `Rescues`                         | ¿se captura/maneja el _tipo de excepción_ especificado?
| `SubordinatesDeclarationsTo`      | ¿todas las declaraciones en el código son llamadas desde la declaración dada?
| `SubordinatesDeclarationsToEntryPoint` | ¿todas las declaraciones en el código son llamadas desde un punto de entrada?
| `TypesAs`                         | ¿se utiliza el tipo especificado para tipar una variable?
| `TypesParameterAs`                | ¿un parámetro está tipado con el tipo especificado?
| `TypesReturnAs`                   | ¿se utiliza el tipo especificado para tipar un retorno?
| `Uses` / `HasUsage`               | ¿existe alguna referencia al elemento especificado?
| `UsesArithmetic` / `UsesMath`     | ¿se utilizan operadores aritméticos?
| `UsesConditional` / `UsesIf` / `HasConditional` / `HasIf` | ¿se utiliza alguna estructura de control condicional?
| `UsesExceptionHandling`           | ¿se maneja alguna _excepción_?
| `UsesExceptions`                  | ¿se lanza o maneja alguna _excepción_?
| `UsesLogic`                       | ¿se utilizan operadores booleanos / lógicos?
| `UsesPrint`                       | ¿se utiliza una sentencia de impresión por pantalla?
| `UsesType`                        | ¿se utiliza el tipo especificado en una firma?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `DiscardsExceptions`              | ¿se descartan excepciones dentro de un bloque catch vacío?
| `DoesConsolePrint`                | ¿hay alguna sentencia de impresión en consola como `System.out.println`, `puts` o `console.log`?
| `HasDeclarationTypos`             | ¿hay un identificador *no* declarado pero en su lugar se declaró uno muy similar?
| `HasEmptyIfBranches`              | ¿el código posee una rama `if` vacía?
| `HasLongParameterList`            | ¿un método, función o predicado dado recibe demasiados parámetros?
| `HasMisspelledIdentifiers`        | ¿un identificador no es una palabra del diccionario del lenguaje de dominio ni parte de su jerga?
| `HasRedundantBooleanComparison`   | ¿se realiza una comparación booleana redundante (ej. `x == true`)?
| `HasRedundantIf`                  | ¿puede una combinación de `if`s, asignaciones y `return`s reemplazarse por una expresión booleana?
| `HasRedundantLocalVariableReturn` | ¿un elemento invocable declara y retorna una variable inmediatamente después de declararla?
| `HasTooShortIdentifiers`          | ¿un identificador es demasiado corto y no forma parte de la jerga del lenguaje de dominio?
| `HasUsageTypos`                   | ¿hay un identificador al que *no* se llama pero en su lugar se llama a uno muy similar?
| `HasWrongCaseIdentifiers` / `UsesWrongCaseBindings` | ¿un identificador no coincide con el estilo de convención de nombres (case style) del lenguaje de dominio?
| `IsLongCode`                      | ¿el código tiene secuencias demasiado largas de sentencias?
| `ShouldInvertIfCondition`         | ¿el código posee un `if` con la rama `then` vacía pero un `else` no vacío?
