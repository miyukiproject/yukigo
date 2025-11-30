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