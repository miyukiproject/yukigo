# Interpreter

The `Interpreter` serves as the primary entry point for evaluating Abstract Syntax Tree (AST) nodes. It evaluates all the `Expression` nodes (and some `Statement`) and returns a `PrimitiveValue`.

## PrimitiveValue

The `PrimitiveValue` is the core data abstraction in Yukigo. It is a comprehensive union type that integrates JavaScript native primitives with custom runtime entities required for multi-paradigma support.

```ts
export type PrimitiveValue =
  | number
  | boolean
  | string
  | null
  | void
  | undefined
  | PrimitiveValue[]
  | RuntimeFunction
  | RuntimePredicate
  | LogicResult
  | LazyList
  | RuntimeObject
  | RuntimeClass
```

In Yukigo, the `PrimitiveValue` is a **first-class citizen**. This design ensures that any result produced by the interpreter, whether it is a simple scalar, a functional closure, a logic predicate, or a lazy structure, can be:

1. Passed as an argument to functions or predicates.
2. Returned from any evaluable block.
3. Assigned to identifiers within the `EnvBuilder` context.

## Why does it "evaluate" Statements?

The purpose of evaluating `Statement` nodes is to provide a way to declare things at runtime. For example, we can declare a `Variable` node with identifier `x` and body `2` like this:

```
> x = 2
```

The `Interpreter` processes the `Variable` (a `Statement`), registers the symbol `x` in the context, and returns `void`.

Then, when evaluating the symbol `x`
```
> x
2
```

The `Interpreter` retrieves the associated `PrimitiveValue` from the environment.