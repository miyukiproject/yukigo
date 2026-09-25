# Functional Inspections

| Inspection (v2 / v0)               | Meaning
|-----------------------------------|------------------------------------------------------
| `UsesAnonymousVariable` / `HasAnonymousVariable` | is the wildcard pattern `_` used?
| `UsesComposition` / `HasComposition`             | is the composition operator used?
| `UsesComprehension` / `HasComprehension`         | is the functional for/do/list comprehension used?
| `UsesGuards` / `HasGuards`                       | the function has a guarded body?
| `UsesLambda` / `HasLambda`                       | is there a lambda in the body?
| `UsesOtherwise` / `HasOtherwise`                 | is the `otherwise` keyword/guard used?
| `UsesPatternMatching` / `HasPatternMatching`     | is pattern matching used?
| `UsesYield` / `HasYield`                         | is an expression yielded within a comprehension?

## Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `HasRedundantGuards`              | the function has redundant or unnecessary guards?
| `HasRedundantLambda`              | the function has a redundant lambda expression?
| `HasRedundantParameter`           | the function has an unused or redundant parameter?
| `ShouldUseOtherwise`              | a boolean guard should use `otherwise` instead of `True`?