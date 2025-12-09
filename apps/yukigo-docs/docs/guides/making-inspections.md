# Guide: How to Make a Custom Inspection Set

This guide explains how to extend Yukigo with your own custom inspections. Inspections are the core logic used to verify if code meets specific structural requirements ("Does this function use pattern matching?" or "Is there a recursive call?").

## Concepts

There are three main components you need to understand:

1.  **The Visitor:** A class extending `TraverseVisitor` that walks the AST looking for a specific node type.
2.  **The Handler:** A function that instantiates the visitor and executes it on the AST.

## Step 1: Create the Visitor

The visitor is responsible for finding the node you are interested in. When the node is found, you should throw a `StopTraversalException`. This signals to the analyzer that the inspection has "passed".

If you are inspecting a specific function ("Does the function `calculate` use recursion?"), you need to handle scoping logic to ensure you don't accidentally check nested functions or other top-level definitions.

::: tip Use a Base Visitor
It is highly recommended to create a base visitor (like `FunctionVisitor` below) that handles finding the target function name so you don't have to rewrite that logic for every inspection.
:::

```ts
import { 
  TraverseVisitor, 
  StopTraversalException, 
  Function, 
  Recursion 
} from "yukigo-ast";

// A helper visitor that only enters the function with the specific name
export class ScopedFunctionVisitor extends TraverseVisitor {
  private readonly targetBinding: string;
  protected isInsideTargetScope: boolean = false;

  constructor(binding: string) {
    super();
    this.targetBinding = binding;
  }

  visitFunction(node: Function): void {
    const currentName = node.identifier.value;

    // Check if this is the function we are looking for
    if (!this.isInsideTargetScope) {
      if (!this.targetBinding || currentName === this.targetBinding) {
        this.isInsideTargetScope = true;
        // Continue traversing specifically into this function's body
        this.traverseCollection(node.equations);
        this.isInsideTargetScope = false;
      }
      return; 
    }
    
    // If we are already inside, just keep traversing
    this.traverseCollection(node.equations);
  }
}

// Our actual inspection logic
export class UsesRecursion extends ScopedFunctionVisitor {
  visitApplication(node: Application): void {
     // If the function called is the same as the target binding, it's recursion
     if (node.identifier.value === this.targetBinding) {
        throw new StopTraversalException();
     }
  }
}
```

## Step 2: Create the Inspection Map

An **Inspection Set** is simply a TypeScript object (a record) mapping inspection names to their handler functions. The handler receives the current AST node, any arguments, and the optional binding name.

Use the `executeVisitor` helper to run your visitor safely.

```ts
import { InspectionMap, executeVisitor } from "yukigo";

export const myCustomInspections: InspectionMap = {
  // Simple registration
  UsesRecursion: (node, args, binding) => 
    executeVisitor(node, new UsesRecursion(binding)),

  // You can also add complex logic here before calling the visitor
  UsesComplexFeature: (node, args, binding) => {
    if (!binding) throw Error("UseComplexFeature requires a binding name");
    return executeVisitor(node, new ComplexVisitor(binding));
  }
};
```

## Step 3: Register and Run

You can inject your custom set into the analyzer in three ways:

### Option A: At Instantiation (Replacing Defaults)

This is useful if you want to completely replace the standard rules with your own domain-specific ones.

```ts
import { Analyzer } from "yukigo";
import { myCustomInspections } from "./my-inspections";

const analyzer = new Analyzer(myCustomInspections);
```

### Option B: Merging (Extending Defaults)

This is the most common approach. You keep the standard Yukigo inspections and add your own on top.

```ts
import { Analyzer, defaultInspectionSet } from "yukigo";
import { myCustomInspections } from "./my-inspections";

const combinedInspections = {
  ...defaultInspectionSet,
  ...myCustomInspections
};

const analyzer = new Analyzer(combinedInspections);
```

### Option C: Runtime Registration

You can also register a single inspection dynamically after the analyzer has been created.

```ts
const analyzer = new Analyzer();

analyzer.registerInspection("UsesRecursion", (node, args, binding) => {
   return executeVisitor(node, new UsesRecursion(binding));
});
```