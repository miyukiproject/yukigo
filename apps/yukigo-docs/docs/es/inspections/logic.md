# Inspecciones Lógicas

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `DeclaresFact`                    | ¿se declara un hecho lógico dado?
| `DeclaresPredicate`               | ¿se declara una regla o hecho dado?
| `DeclaresRule`                    | ¿se declara una regla lógica dada?
| `UsesFindall`                     | ¿se utiliza la consulta lógica `findall`?
| `UsesForall`                      | ¿se utiliza la consulta lógica `forall`?
| `UsesNot`                         | ¿se utiliza el operador `not`?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `HasRedundantReduction`           | ¿se utiliza un operador `is` para unificar individuos que no requieren reducción, como `X is 4`?
| `UsesCut`                         | ¿se utiliza la consulta lógica corte `!`?
| `UsesFail`                        | ¿se utiliza la consulta lógica `fail`?
| `UsesUnificationOperator`         | ¿se utiliza el operador lógico de unificación `=`?
