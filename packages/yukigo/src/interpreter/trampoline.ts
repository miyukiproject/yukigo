import { PrimitiveValue } from "yukigo-ast";

// A Thunk now represents a deferred computation that, when called,
// will produce either a value or another thunk.
// Importantly, for our visitor, the Thunk will wrap the *decision* of what to do next.
// A node's evaluation might return a function that *takes* the continuation for that node.
export type CallableThunk<T> = () => Thunk<T>;
export type Thunk<T> = T | CallableThunk<T>;

const isCallableThunk = <T>(thunk: Thunk<T>): thunk is CallableThunk<T> =>
  typeof thunk === "function";

// A Continuation is a function that takes a value and returns a Thunk,
// representing the "rest of the computation" after the value is produced.
export type Continuation<T, R = any> = (value: T) => Thunk<R>;

// The identity continuation: simply returns the value as a resolved Thunk.
// This is used for the very last step of a computation or when a value is final.
export const idContinuation: Continuation<PrimitiveValue> = (value) => value;

// The trampoline function executes a chain of Thunks until a final non-function value is reached.
export function trampoline<T>(thunk: Thunk<T>): T {
  let result = thunk;
  while (isCallableThunk(result)) result = result();
  return result;
}

/**
 * A specialized Thunk type for our CPS visitor.
 * This is a function that, when called, takes the continuation for the current node's evaluation
 * and returns the actual Thunk chain for that node.
 * This effectively injects the continuation *after* the `visit` method has returned.
 */
export type CPSThunk<T, R = any> = (k: Continuation<T, R>) => Thunk<R>;

// Helper to create a CPSThunk for visitor methods.
// Visitor methods will call this, providing a function that knows how to use 'k'.
export function makeCPSThunk<T>(
  fn: (k: Continuation<T>) => Thunk<T>,
): CPSThunk<T> {
  return fn;
}

// Helper to compose asynchronous/CPS operations.
// `cpsA` is a CPSThunk that eventually produces a value A.
// `f` is a function that takes A and returns a CPSThunk that eventually produces B.
export function bindCPS<A, B, R>(
  cpsA: CPSThunk<A, R>,
  f: (valueA: A) => CPSThunk<B, R>,
): CPSThunk<B, R> {
  return (k: Continuation<B, R>): Thunk<R> => {
    return () =>
      cpsA((valueA: A): Thunk<R> => {
        // f(valueA) returns a CPSThunk<B, R>
        // calling that with 'k' returns Thunk<R>
        return f(valueA)(k);
      });
  };
}

// Helper to lift a direct value into a CPSThunk
export function valueToCPS<T, R>(value: T): CPSThunk<T, R> {
  return (k: Continuation<T, R>) => () => k(value);
}

// Helper to lift a regular Thunk into a CPSThunk (if it resolves a simple Thunk)
export function thunkToCPS<T>(thunk: Thunk<T>): CPSThunk<T> {
  return (k: Continuation<T>) => {
    return () => k(trampoline(thunk)); // Trampoline the simple thunk and pass its result to k
  };
}
