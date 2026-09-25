# Generic Inspections

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `Assigns`                         | the given variable or attribute assigned?
| `Calls`                           | is the given method, function or procedure called?
| `Declares`                        | is the given element declared?
| `DeclaresComputation`             | does the given computation  - method, predicate, function, etc - exist?
| `DeclaresComputationWithArity`    | does the given computation have no arguments?
| `DeclaresEntryPoint`              | is there a program entry point, like a `main` procedure?
| `DeclaresFunction`                | is a given function declared?
| `DeclaresRecursively`             | is a given computation declared using recusion?
| `DeclaresTypeAlias`               | is a given type synonym declared?
| `DeclaresTypeSignature`           | is a given computation type signature declared?
| `DeclaresVariable`                | is a given local or global variable declared?
| `Delegates`                       | is a non-empty method, function or procedure declared *and* called?
| `Raises`                          | is the given _exception type_ raised?
| `Rescues`                         | is the given _exception type_ rescued?
| `SubordinatesDeclarationsTo`      | are all the declarations in the code called from the given declaration?
| `SubordinatesDeclarationsToEntryPoint` | are all the declarations in the code called from an entry point?
| `TypesAs`                         | is the given type used to type a variable?
| `TypesParameterAs`                | is a parameter typed as a given type?
| `TypesReturnAs`                   | is the given type used to type a return?
| `Uses`                            | is there any reference to the given element?
| `UsesArithmetic`                  | are arithmetic operators used?
| `UsesConditional`                 | are any conditional control structure used? 
| `UsesExceptionHandling`           | is any _exception_ handlded?
| `UsesExceptions`                  | is any _exception_ raised?
| `UsesFor`                         | is any kind of comprehension or indexed repetition used?
| `UsesIf`                          | is an `if` control structure used?
| `UsesLogic`                       | are boolean operators used?
| `UsesMath`                        | are artithmetic operators used?
| `UsesPrint`                       | is a print statement used?
| `UsesType`                        | is the given typed used in a signature?

## Code Smells

### Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `DiscardsExceptions`              | are exceptions discarded within an empty catch block?
| `DoesConsolePrint`                | is there any console-print-statement like `System.out.println`, `puts` or `console.log`?
| `HasDeclarationTypos`             | is an identifier *not* declared but a very similar one declared instead?
| `HasEmptyIfBranches`              | has the given code an empty `if` branch?
| `HasLongParameterList`            | does a given method/function/predicate take too many parameters?
| `HasMisspelledIdentifiers`        | an identifier is not a domain language dictionary's word and not part of its jargon
| `HasRedundantBooleanComparison`   |
| `HasRedundantIf`                  | can a combination of `if`s, `assignment`s and `return`s be replaced by a boolean expression?
| `HasRedundantLocalVariableReturn` | does a callable declare and return a variable just after declaring it?
| `HasTooShortIdentifiers`          | whether an identifier is too short and not part of domain language's jargon
| `HasUsageTypos`                   | is an identifier *not* called but a very similar one called instead?
| `HasWrongCaseIdentifiers`         | whether an identifier does not match the domain language's case style
| `IsLongCode`                      | has the code long sequences of statements?
| `ShouldInvertIfCondition`         | has the given code an `if` with an empty `then` but a non-empty `else`?