# Guía: Cómo crear un conjunto de inspecciones personalizado

Esta guía explica cómo extender Yukigo con tus propias inspecciones personalizadas. Las inspecciones son la lógica central que se usa para verificar si el código cumple con requisitos estructurales específicos ("¿Esta función usa pattern matching?" o "¿Hay una llamada recursiva?").

## Conceptos

Hay tres componentes principales que necesitás entender:

1. **El Visitor:** Una clase que extiende `TraverseVisitor` y recorre el AST buscando un tipo de nodo específico.
2. **El Handler:** Una función que instancia el visitor y lo ejecuta sobre el AST.

## Paso 1: Crear el Visitor

El visitor es responsable de encontrar el nodo que te interesa. Cuando el nodo es encontrado, debés lanzar una `StopTraversalException`. Esto le indica al analizador que la inspección "pasó".

Si estás inspeccionando una función específica ("¿La función `calculate` usa recursión?"), necesitás manejar la lógica de alcance para asegurarte de no revisar accidentalmente funciones anidadas u otras definiciones de nivel superior.

::: tip Usá un Visitor Base
Es muy recomendable crear un visitor base (como el `FunctionVisitor` de abajo) que se encargue de encontrar el nombre de la función objetivo, para no tener que reescribir esa lógica en cada inspección.
:::
```ts
import { 
  TraverseVisitor, 
  StopTraversalException, 
  Function, 
  Recursion 
} from "yukigo-ast";

// Un visitor auxiliar que solo entra a la función con el nombre específico
export class ScopedFunctionVisitor extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false;

  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }

  visitFunction(node: Function): void {
    const currentName = node.identifier.value;

    // Verificamos si esta es la función que estamos buscando
    if (!this.isInsideTargetScope) {
      if (!this.targetBinding || currentName === this.targetBinding) {
        this.isInsideTargetScope = true;
        // Continuamos recorriendo específicamente el cuerpo de esta función
        this.traverseCollection(node.equations);
        this.isInsideTargetScope = false;
      }
      return; 
    }
    
    // Si ya estamos adentro, seguimos recorriendo
    this.traverseCollection(node.equations);
  }
}

// La lógica real de nuestra inspección
export class UsesRecursion extends ScopedFunctionVisitor {
  visitApplication(node: Application): void {
     // Si la función llamada es la misma que el binding objetivo, es recursión
     if (node.identifier.value === this.targetBinding) {
        throw new StopTraversalException();
     }
  }
}
```

## Paso 2: Crear el Mapa de Inspecciones

Un **Inspection Set** es simplemente un objeto TypeScript (un record) que mapea nombres de inspecciones a sus funciones handler. El handler recibe el nodo AST actual, los argumentos, y el nombre del binding opcional.

Usá el helper `executeVisitor` para ejecutar tu visitor de forma segura.
```ts
import { InspectionMap, executeVisitor } from "yukigo";

export const myCustomInspections: InspectionMap = {
  // Registro simple
  UsesRecursion: (node, args, binding) => 
    executeVisitor(node, new UsesRecursion(binding)),

  // También podés agregar lógica compleja antes de llamar al visitor
  UsesComplexFeature: (node, args, binding) => {
    if (!binding) throw Error("UseComplexFeature requires a binding name");
    return executeVisitor(node, new ComplexVisitor(binding));
  }
};
```

## Paso 3: Registrar y Ejecutar

Podés inyectar tu conjunto personalizado en el analizador de tres formas:

### Opción A: En la Instanciación (Reemplazando los Defaults)

Es útil cuando querés reemplazar completamente las reglas estándar con las tuyas propias, específicas de tu dominio.
```ts
import { Analyzer } from "yukigo";
import { myCustomInspections } from "./my-inspections";

const analyzer = new Analyzer(myCustomInspections);
```

### Opción B: Combinando (Extendiendo los Defaults)

Es el enfoque más común. Mantenés las inspecciones estándar de Yukigo y agregás las tuyas encima.
```ts
import { Analyzer, defaultInspectionSet } from "yukigo";
import { myCustomInspections } from "./my-inspections";

const combinedInspections = {
  ...defaultInspectionSet,
  ...myCustomInspections
};

const analyzer = new Analyzer(combinedInspections);
```

### Opción C: Registro en Tiempo de Ejecución

También podés registrar una inspección de forma dinámica después de que el analizador fue creado.
```ts
const analyzer = new Analyzer();

analyzer.registerInspection("UsesRecursion", (node, args, binding) => {
   return executeVisitor(node, new UsesRecursion(binding));
});
```