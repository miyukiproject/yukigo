# Inspecciones Imperativas

| Inspección (v2 / v0)               | Significado
|-----------------------------------|------------------------------------------------------
| `DeclaresEnumeration`             | ¿se declara una enumeración dada?
| `DeclaresProcedure`               | ¿se declara un procedimiento dado?
| `UsesForLoop`                     | ¿se utiliza un bucle for estilo C?
| `UsesLoop`                        | ¿se utiliza alguno de los siguientes: repeat / bucle for / while?
| `UsesRepeat` / `HasRepeat`        | ¿se utiliza la estructura de repetición repeat?
| `UsesSwitch`                      | ¿se utiliza una estructura de control `switch`?
| `UsesWhile` / `HasWhile`          | ¿se utiliza una estructura de control `while`?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `HasAssignmentCondition`          | ¿el código evalúa el resultado de una asignación donde se espera una condición booleana?
| `HasAssignmentReturn`             | ¿el código retorna el resultado de una asignación?
| `HasEmptyRepeat`                  | ¿el código posee un `repeat` con cuerpo vacío?
| `HasRedundantRepeat`              | ¿el código posee una sentencia `repeat` innecesaria (de 1 sola iteración)?
