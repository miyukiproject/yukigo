# Imperative Inspections

| Inspection (v2 / v0)               | Meaning
|-----------------------------------|------------------------------------------------------
| `DeclaresEnumeration`             | is a given enumeration declared?
| `DeclaresProcedure`               | is a given procedure declared?
| `UsesForLoop`                     | is a c-style for loop used?
| `UsesLoop`                        | are any of: repeat / for loop / while used?
| `UsesRepeat` / `HasRepeat`        | is a `repeat` loop structure used?
| `UsesSwitch`                      | is a `switch` control structure used?
| `UsesWhile` / `HasWhile`          | is a `while` control structure used?

## Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `HasAssignmentCondition`          | is the code evaluating the result of an assignment where a boolean condition is expected?
| `HasAssignmentReturn`             | is the code returning the result of an assignment?
| `HasEmptyRepeat`                  | has the given code a `repeat` with empty body?
| `HasRedundantRepeat`              | has the given code an unnecessary - 1 iteration - `repeat` statement?