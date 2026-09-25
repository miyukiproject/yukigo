# Generic Inspections

| Inspection (v2 / v0)               | Meaning
|-----------------------------------|------------------------------------------------------
| `Assigns`                         | the given variable or attribute assigned?
| `Calls`                           | is the given method, function or procedure called?
| `Declares` / `HasBinding`         | is the given element declared?
| `DeclaresComputation`             | does the given computation (method, predicate, function, etc.) exist?
| `DeclaresComputationWithArity` / `HasArity` | does the given computation have the target arity?
| `DeclaresEntryPoint`              | is there a program entry point, like a `main` procedure?
| `DeclaresFunction`                | is a given function declared?
| `DeclaresRecursively`             | is a given computation declared using recursion?
| `DeclaresTypeAlias` / `HasTypeDeclaration` | is a given type synonym declared?
| `DeclaresTypeSignature` / `HasTypeSignature` | is a given computation type signature declared?
| `DeclaresVariable` / `HasVariable` | is a given local or global variable declared?
| `HasBinding`                      | checks if a given binding/declaration exists in scope
| `HasDirectRecursion`              | does the computation call itself directly?
| `Raises`                          | is the given _exception type_ raised?
| `Rescues`                         | is the given _exception type_ rescued?
| `SubordinatesDeclarationsTo`      | are all the declarations in the code called from the given declaration?
| `SubordinatesDeclarationsToEntryPoint` | are all the declarations in the code called from an entry point?
| `TypesAs`                         | is the given type used to type a variable?
| `TypesParameterAs`                | is a parameter typed as a given type?
| `TypesReturnAs`                   | is the given type used to type a return?
| `Uses` / `HasUsage`               | is there any reference to the given element?
| `UsesArithmetic` / `UsesMath`     | are arithmetic operators used?
| `UsesConditional` / `UsesIf` / `HasConditional` / `HasIf` | are any conditional control structures used?
| `UsesExceptionHandling`           | is any _exception_ handled?
| `UsesExceptions`                  | is any _exception_ raised or handled?
| `UsesLogic`                       | are boolean operators used?
| `UsesPrint`                       | is a print statement used?
| `UsesType`                        | is the given type used in a signature?

## Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `DiscardsExceptions`              | are exceptions discarded within an empty catch block?
| `DoesConsolePrint`                | is there any console-print-statement like `System.out.println`, `puts` or `console.log`?
| `HasDeclarationTypos`             | is an identifier *not* declared but a very similar one declared instead?
| `HasEmptyIfBranches`              | has the given code an empty `if` branch?
| `HasLongParameterList`            | does a given method/function/predicate take too many parameters?
| `HasMisspelledIdentifiers`        | an identifier is not a domain language dictionary's word and not part of its jargon
| `HasRedundantBooleanComparison`   | is there a redundant boolean comparison (e.g. `x == true`)?
| `HasRedundantIf`                  | can a combination of `if`s, `assignment`s and `return`s be replaced by a boolean expression?
| `HasRedundantLocalVariableReturn` | does a callable declare and return a variable just after declaring it?
| `HasTooShortIdentifiers`          | whether an identifier is too short and not part of domain language's jargon
| `HasUsageTypos`                   | is an identifier *not* called but a very similar one called instead?
| `HasWrongCaseIdentifiers` / `UsesWrongCaseBindings` | whether an identifier does not match the domain language's case style
| `IsLongCode`                      | has the code long sequences of statements?
| `ShouldInvertIfCondition`         | has the given code an `if` with an empty `then` but a non-empty `else`?