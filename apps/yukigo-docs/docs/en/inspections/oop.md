# OOP Inspections

| Inspection                        | Meaning
|-----------------------------------|------------------------------------------------------
| `DeclaresAttribute`               | is a given attribute declared?
| `DeclaresClass`                   | is a given class declared?
| `DeclaresInterface`               | is a given interface declared?
| `DeclaresMethod`                  | is a given method declared?
| `DeclaresObject`                  | is a given named object declared?
| `DeclaresPrimitive`               | Is the given primitive operator overriden?
| `DeclaresSuperclass`              | is a given class declared as superclass?
| `Implements`                      | is the given interface implemented?
| `Includes`                        | is a given mixins included?
| `Inherits`                        | is a given class declared as superclass? - alias of `declaresSuperclass`
| `Instantiates`                    | is the given class instantiated?
| `UsesDynamicPolymorphism`          | are there two or more methods definitions for some sent selector?
| `UsesDynamicMethodOverload`       | is there a class that defined two methods with different arity but with the same name?
| `UsesInheritance`                 | is any superclass explicitly declared?
| `UsesMixins`                      | is any mixins explicitly included?
| `UsesObjectComposition`           | is there a class that declares an attributes and sends a message to it?
| `UsesStaticMethodOverload`        | is there a class that defined two method signatures but with the same name?
| `UsesStaticPolymorphism`          | is there an interface with at least a method signature that is implemented by two or more classes and used in the code?
| `UsesTemplateMethod`              | is there a class that sends a message whose corresonding method is not declared?

## Code Smells