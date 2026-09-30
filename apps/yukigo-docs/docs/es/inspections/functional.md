# Inspecciones Funcionales

| Inspección (v2 / v0)               | Significado
|-----------------------------------|------------------------------------------------------
| `UsesAnonymousVariable` / `HasAnonymousVariable` | ¿se utiliza el patrón comodín `_`?
| `UsesComposition` / `HasComposition`             | ¿se utiliza el operador de composición?
| `UsesComprehension` / `HasComprehension`         | ¿se utiliza la comprensión funcional de lista / for / do?
| `UsesGuards` / `HasGuards`                       | ¿la función tiene un cuerpo con guardas?
| `UsesLambda` / `HasLambda`                       | ¿hay una función lambda en el cuerpo?
| `UsesOtherwise` / `HasOtherwise`                 | ¿se utiliza la palabra clave / guarda `otherwise`?
| `UsesPatternMatching` / `HasPatternMatching`     | ¿se utiliza pattern matching?
| `UsesYield` / `HasYield`                         | ¿se produce/retorna una expresión con `yield` dentro de una comprensión?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `HasRedundantGuards`              | ¿posee guardas redundantes o innecesarias?
| `HasRedundantLambda`              | ¿posee una función lambda redundante?
| `HasRedundantParameter`           | ¿posee un parámetro redundante o no utilizado?
| `ShouldUseOtherwise`              | ¿debería utilizar la cláusula `otherwise` en lugar de `True`?
