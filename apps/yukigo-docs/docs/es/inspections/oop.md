# Inspecciones de POO (Programación Orientada a Objetos)

| Inspección (v2 / v0)               | Significado
|-----------------------------------|------------------------------------------------------
| `DeclaresAttribute`               | ¿se declara un atributo dado?
| `DeclaresClass`                   | ¿se declara una clase dada?
| `DeclaresInterface`               | ¿se declara una interfaz dada?
| `DeclaresMethod`                  | ¿se declara un método dado?
| `DeclaresObject`                  | ¿se declara un objeto nombrado dado?
| `DeclaresPrimitive`               | ¿se sobreescribe el operador primitivo dado?
| `DeclaresSuperclass` / `Inherits` | ¿se declara una clase dada como superclase?
| `Implements`                      | ¿se implementa la interfaz dada?
| `IncludeMixin`                    | ¿se incluye un mixin dado?
| `Inherits`                        | ¿se declara una clase dada como superclase? (alias de `DeclaresSuperclass`)
| `Instantiates`                    | ¿se instancia la clase dada?
| `UsesDynamicPolymorphism`          | ¿existen dos o más definiciones de métodos para un selector enviado?
| `UsesDynamicMethodOverload`       | ¿existe una clase que defina dos métodos con diferente aridad pero con el mismo nombre?
| `UsesInheritance`                 | ¿se declara explícitamente alguna superclase?
| `UsesMixins`                      | ¿se incluye explícitamente algún mixin?
| `UsesObjectComposition`           | ¿existe una clase que declare un atributo y le envíe un mensaje?
| `UsesStaticMethodOverload` / `UsesStaticPolymorphism` | ¿existe una clase que defina dos firmas de método pero con el mismo nombre?
| `UsesTemplateMethod`              | ¿existe una clase que envíe un mensaje cuyo método correspondiente no esté declarado?

## Code Smells

| Inspección                         | Significado
|-----------------------------------|------------------------------------------------------
| `DoesNilTest`                     | ¿se realiza una verificación contra un valor nulo, como `if x == nil then puts 'is nil'`?
| `DoesTypeTest`                    | ¿se realiza alguna verificación contra cadenas de texto literales o tipos?
| `HasTooManyMethods`               | ¿una clase/objeto/interfaz dada posee demasiados métodos?
| `OverridesEqualOrHashButNotBoth` | ¿una clase dada sobreescribe equals pero no hash, o hash pero no equals?
| `ReturnsNil`                      | ¿un método retorna explícitamente nulo/nil?
| `UsesNamedSelfReference`          | ¿un objeto se referencia a sí mismo por su nombre en lugar de usar `self`?
