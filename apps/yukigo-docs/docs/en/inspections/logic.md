# Logic Inspections

| Inspection (v2 / v0)               | Meaning
|-----------------------------------|------------------------------------------------------
| `DeclaresFact`                    | is a given logic fact declared?
| `DeclaresPredicate`               | is a given rule or fact declared?
| `DeclaresRule`                    | is a given logic rule declared?
| `UsesFindall` / `HasFindall`      | is the logic `findall` consult used?
| `UsesForall` / `HasForall`        | is the logic `forall` consult used?
| `UsesNot` / `HasNot`              | is the `not` operator used?

## Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `HasRedundantReduction`           | is an `is` operator used to unify individuals that don't require a reduction, like `X is 4`?
| `UsesCut`                         | is the logic `!` consult used?
| `UsesFail`                        | is the logic `fail` consult used?
| `UsesUnificationOperator`         | is the logic unification operator `=` used?