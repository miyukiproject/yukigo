import { LogicTerm, Substitution } from "../../../primitives/LogicResult.js";
import { PrimitiveValue } from "../../../primitives/primitives.js";

/**
 * Represents a logic variable with a unique numeric ID.
 */
export class VariableTerm implements LogicTerm {
  readonly logicTermType = "Variable";
  constructor(
    public readonly id: number,
    public readonly name: string,
  ) {}

  resolve(env: Substitution): LogicTerm {
    let current: LogicTerm = this;
    const seen = new Set<number>();
    while (current instanceof VariableTerm) {
      if (seen.has(current.id)) break;
      seen.add(current.id);
      const bound = env.get(current.id);
      if (!bound) break;
      current = bound;
    }
    return current;
  }

  unify(other: LogicTerm, env: Substitution): boolean {
    const r1 = this.resolve(env);
    const r2 = other.resolve(env);

    if (r1 === r2) return true;
    if (r1 instanceof VariableTerm) {
      if (r2.occurs(r1, env)) return false;
      env.set(r1.id, r2);
      return true;
    }
    if (r2 instanceof VariableTerm) {
      if (r1.occurs(r2, env)) return false;
      env.set(r2.id, r1);
      return true;
    }
    // If r1 resolved to a non-variable, delegate to its unify logic
    return r1.unify(r2, env);
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    const resolved = this.resolve(env);
    if (resolved instanceof VariableTerm) return resolved.id === v.id;
    return resolved.occurs(v, env);
  }

  instantiate(env: Substitution, seen: Set<number> = new Set()): LogicTerm {
    let current: LogicTerm = this;
    const localSeen = new Set(seen);
    
    while (current instanceof VariableTerm) {
      if (localSeen.has(current.id)) return current;
      localSeen.add(current.id);
      const bound = env.get(current.id);
      if (!bound) return current;
      current = bound;
    }
    
    return current.instantiate(env, localSeen);
  }

  toPrimitive(env: Substitution): PrimitiveValue {
    const resolved = this.resolve(env);
    if (resolved === this) return this.name;
    return resolved.toPrimitive(env);
  }

  toString(): string {
    return `${this.name}_${this.id}`;
  }
}

/**
 * Represents a constant value (Numbers, Strings, Booleans).
 */
export class ConstantTerm implements LogicTerm {
  readonly logicTermType = "Constant";
  constructor(public readonly value: number | string | boolean | null) {}

  resolve(): LogicTerm {
    return this;
  }

  occurs(): boolean {
    return false;
  }

  unify(other: LogicTerm, env: Substitution): boolean {
    const r2 = other.resolve(env);
    if (r2 instanceof WildcardTerm) return true;
    if (r2 instanceof VariableTerm) {
      env.set(r2.id, this);
      return true;
    }
    if (r2 instanceof ConstantTerm) {
      return this.value === r2.value;
    }
    return false;
  }

  instantiate(): LogicTerm {
    return this;
  }

  toPrimitive(): PrimitiveValue {
    return this.value as any;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * Represents a compound structure (Functors, Constructors, Application).
 */
export class CompoundTerm implements LogicTerm {
  readonly logicTermType = "Compound";
  constructor(
    public readonly functor: string,
    public readonly args: LogicTerm[],
  ) {}

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    return this.args.some((arg) => arg.occurs(v, env));
  }

  unify(other: LogicTerm, env: Substitution): boolean {
    const r2 = other.resolve(env);
    if (r2 instanceof WildcardTerm) return true;
    if (r2 instanceof VariableTerm) {
      if (this.occurs(r2, env)) return false;
      env.set(r2.id, this);
      return true;
    }
    if (r2 instanceof CompoundTerm) {
      if (this.functor !== r2.functor) return false;
      if (this.args.length !== r2.args.length) return false;
      return this.args.every((arg, i) => arg.unify(r2.args[i], env));
    }
    return false;
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    return new CompoundTerm(
      this.functor,
      this.args.map((a) => a.instantiate(env, seen)),
    );
  }

  toPrimitive(env: Substitution): PrimitiveValue {
    const args = this.args.map((a) => a.toPrimitive(env));
    // represent as a RuntimeObject
    return {
      type: "Object",
      className: this.functor,
      identifier: this.functor,
      fields: new Map(args.map((v, i) => [`_${i}`, v])),
      methods: new Map(),
    };
  }

  toString(): string {
    return `${this.functor}(${this.args.map((a) => a.toString()).join(", ")})`;
  }
}

/**
 * Represents the wildcard pattern (_).
 */
export class WildcardTerm implements LogicTerm {
  readonly logicTermType = "Wildcard";
  resolve(): LogicTerm {
    return this;
  }
  occurs(): boolean {
    return false;
  }
  unify(other: LogicTerm, env: Substitution): boolean {
    return true;
  }
  instantiate(): LogicTerm {
    return this;
  }
  toPrimitive(): PrimitiveValue {
    return undefined;
  }
  toString(): string {
    return "_";
  }
}

/**
 * Represents a List [x, y, z].
 */
export class ListTerm implements LogicTerm {
  readonly logicTermType = "List";
  constructor(public readonly elements: LogicTerm[]) {}

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    return this.elements.some((el) => el.occurs(v, env));
  }

  unify(other: LogicTerm, env: Substitution): boolean {
    const r2 = other.resolve(env);
    if (r2 instanceof WildcardTerm) return true;
    if (r2 instanceof VariableTerm) {
      if (this.occurs(r2, env)) return false;
      env.set(r2.id, this);
      return true;
    }
    if (r2 instanceof ListTerm) {
      if (this.elements.length !== r2.elements.length) return false;
      return this.elements.every((el, i) => el.unify(r2.elements[i], env));
    }
    if (r2 instanceof ConsTerm) {
      // Delegate to ConsTerm.unify to leverage iterative unrolling
      return r2.unify(this, env);
    }
    return false;
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    return new ListTerm(this.elements.map((e) => e.instantiate(env, seen)));
  }

  toPrimitive(env: Substitution): PrimitiveValue {
    return this.elements.map((e) => e.toPrimitive(env));
  }

  toString(): string {
    return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
  }
}

/**
 * Represents a Cons cell (head:tail).
 */
export class ConsTerm implements LogicTerm {
  readonly logicTermType = "Cons";
  constructor(
    public readonly head: LogicTerm,
    public readonly tail: LogicTerm,
  ) {}

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    let curr: LogicTerm = this;
    while (curr instanceof ConsTerm) {
      if (curr.head.occurs(v, env)) return true;
      curr = curr.tail.resolve(env);
    }
    return curr.occurs(v, env);
  }

  unify(other: LogicTerm, env: Substitution): boolean {
    let curr1: LogicTerm = this;
    let curr2: LogicTerm = other.resolve(env);

    while (curr1 instanceof ConsTerm) {
      if (curr2 instanceof WildcardTerm) return true;
      if (curr2 instanceof VariableTerm) {
        if (curr1.occurs(curr2, env)) return false;
        env.set(curr2.id, curr1);
        return true;
      }
      if (curr2 instanceof ConsTerm) {
        if (!curr1.head.unify(curr2.head, env)) return false;
        curr1 = curr1.tail.resolve(env);
        curr2 = curr2.tail.resolve(env);
      } else if (curr2 instanceof ListTerm) {
        if (curr2.elements.length === 0) return false;
        const [h, ...t] = curr2.elements;
        if (!curr1.head.unify(h, env)) return false;
        curr1 = curr1.tail.resolve(env);
        curr2 = new ListTerm(t);
      } else {
        return false;
      }
    }
    
    return curr1.unify(curr2, env);
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    let curr: LogicTerm = this;
    const heads: LogicTerm[] = [];
    while (curr instanceof ConsTerm) {
      heads.push(curr.head.instantiate(env, seen));
      curr = curr.tail.resolve(env);
    }
    let result = curr.instantiate(env, seen);
    for (let i = heads.length - 1; i >= 0; i--) {
      result = new ConsTerm(heads[i], result);
    }
    return result;
  }

  toPrimitive(env: Substitution): PrimitiveValue {
    let curr: LogicTerm = this;
    const heads: PrimitiveValue[] = [];
    while (curr instanceof ConsTerm) {
      heads.push(curr.head.toPrimitive(env));
      curr = curr.tail.resolve(env);
    }
    const tailVal = curr.toPrimitive(env);
    
    let res: any = tailVal;
    for (let i = heads.length - 1; i >= 0; i--) {
      if (Array.isArray(res)) {
        res = [heads[i], ...res];
      } else {
        res = [heads[i], res];
      }
    }
    return res;
  }

  toString(): string {
    return `(${this.head.toString()}:${this.tail.toString()})`;
  }
}
