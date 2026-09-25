# Inspecciones Funcionales

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `UsesAnonymousVariable`           | ¿se utiliza el patrón comodín `_`?
| `UsesComposition`                 | ¿se utiliza el operador de composición?
| `UsesForComprehension`            | ¿se utiliza la comprensión funcional de lista / for / do?
| `UsesGuards`                      | ¿la función tiene un cuerpo con guardas?
| `UsesLambda`                      | ¿hay una función lambda en el cuerpo?
| `UsesYield`                       | ¿se produce/retorna una expresión con `yield` dentro de una comprensión?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `HasRedundantGuards`              | ¿posee guardas redundantes o innecesarias?
| `HasRedundantLambda`              | ¿posee una función lambda redundante?
| `HasRedundantParameter`           | ¿posee un parámetro redundante?
| `ShouldUseOtherwise`              | ¿debería utilizar la cláusula `otherwise`?
