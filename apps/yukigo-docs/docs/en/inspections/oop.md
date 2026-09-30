# OOP Inspections

| Inspection (v2 / v0)               | Meaning
|-----------------------------------|------------------------------------------------------
| `DeclaresAttribute`               | is a given attribute declared?
| `DeclaresClass`                   | is a given class declared?
| `DeclaresInterface`               | is a given interface declared?
| `DeclaresMethod`                  | is a given method declared?
| `DeclaresObject`                  | is a given named object declared?
| `DeclaresPrimitive`               | Is the given primitive operator overriden?
| `DeclaresSuperclass` / `Inherits` | is a given class declared as superclass?
| `Implements`                      | is the given interface implemented?
| `IncludeMixin`                    | is a given mixin included?
| `Instantiates`                    | is the given class instantiated?
| `UsesDynamicPolymorphism`          | are there two or more method definitions for some sent selector?
| `UsesDynamicMethodOverload`       | is there a class that defined two methods with different arity but with the same name?
| `UsesInheritance`                 | is any superclass explicitly declared?
| `UsesMixins`                      | is any mixin explicitly included?
| `UsesObjectComposition`           | is there a class that declares an attribute and sends a message to it?
| `UsesStaticMethodOverload` / `UsesStaticPolymorphism` | is there a class that defined two method signatures but with the same name?
| `UsesTemplateMethod`              | is there a class that sends a message whose corresponding method is not declared?

## Code Smells

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `DoesNilTest`                     | is there a test against a null value, like `if x == nil then puts 'is nil'`?
| `DoesTypeTest`                    | are there any tests against literal strings or types?
| `HasTooManyMethods`               | does a given class/object/interface have too many methods?
| `OverridesEqualOrHashButNotBoth` | does a given class override equals but not hash? or hash but not equals?
| `ReturnsNil`                      | does a method explicitly return null/nil?
| `UsesNamedSelfReference`          | does an object reference itself by its name instead of using `self`?