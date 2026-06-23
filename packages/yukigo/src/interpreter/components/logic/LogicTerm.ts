import {
  YuValue,
  YuString,
  YuNumber,
  YuNil,
  RuntimeObject,
  YuArray,
} from "../../primitives/index.js";
import { boolean } from "../../utils.js";
import { ExecutionCommand, StepCommand } from "../kernel/commands.js";
import { LogicTerm, Substitution } from "../../primitives/entities/LogicResult.js";

/**
 * Represents a logic variable with a unique numeric ID.
 */
export class VariableTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "Variable";
  constructor(
    public readonly id: number,
    public readonly name: string,
  ) {
    super();
  }

  public equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  public compare(other: YuValue): ExecutionCommand {
    throw new Error("Variables are not comparable");
  }
  public getType(): string {
    return "Variable";
  }
  public toJSON(): unknown {
    return { type: "Variable", id: this.id, name: this.name };
  }

  resolve(env: Substitution): LogicTerm {
    let current: LogicTerm = this;
    const seen = new Set<number>();
    while (current.logicTermType === "Variable") {
      const v = current as VariableTerm;
      if (seen.has(v.id)) break;
      seen.add(v.id);
      const bound = env.get(v.id);
      if (!bound) break;
      current = bound;
    }
    return current;
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    const r1 = this.resolve(env);
    const r2 = other.resolve(env);

    if (r1 === r2) return boolean(true);
    if (r1.logicTermType === "Variable") {
      const v1 = r1 as VariableTerm;
      if (r2.occurs(v1, env)) return boolean(false);
      env.set(v1.id, r2);
      return boolean(true);
    }
    if (r2.logicTermType === "Variable") {
      const v2 = r2 as VariableTerm;
      if (r1.occurs(v2, env)) return boolean(false);
      env.set(v2.id, r1);
      return boolean(true);
    }
    // If r1 resolved to a non-variable, delegate to its unify logic
    return r1.unify(r2, env);
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    const resolved = this.resolve(env);
    if (resolved.logicTermType === "Variable")
      return (resolved as VariableTerm).id === v.id;
    return resolved.occurs(v, env);
  }

  instantiate(env: Substitution, seen: Set<number> = new Set()): LogicTerm {
    let current: LogicTerm = this;
    const localSeen = new Set(seen);

    while (current.logicTermType === "Variable") {
      const v = current as VariableTerm;
      if (localSeen.has(v.id)) return current;
      localSeen.add(v.id);
      const bound = env.get(v.id);
      if (!bound) return current;
      current = bound;
    }

    return current.instantiate(env, localSeen);
  }

  toPrimitive(env: Substitution): YuValue {
    const resolved = this.resolve(env);
    if (resolved === this) return new YuString(this.name);
    return resolved.toPrimitive(env);
  }

  toString(): string {
    return `${this.name}_${this.id}`;
  }
}

/**
 * Represents a constant value (Numbers, Strings, Booleans).
 */
export class ConstantTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "Constant";
  constructor(public readonly value: YuValue) {
    super();
  }

  equals(other: YuValue): ExecutionCommand {
    if (!(other instanceof ConstantTerm)) return boolean(false);
    return this.value.equals(other.value);
  }
  compare(other: YuValue): ExecutionCommand {
    if (!(other instanceof ConstantTerm))
      throw new Error("Type mismatch in compare");
    return this.value.compare(other.value);
  }
  getType(): string {
    return "Constant";
  }
  toJSON(): unknown {
    return this.value.toJSON();
  }

  resolve(): LogicTerm {
    return this;
  }

  occurs(): boolean {
    return false;
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    const r2 = other.resolve(env);
    if (r2.logicTermType === "Wildcard") return boolean(true);
    if (r2.logicTermType === "Variable") {
      env.set((r2 as VariableTerm).id, this);
      return boolean(true);
    }
    if (r2.logicTermType === "Constant") {
      return this.value.equals((r2 as ConstantTerm).value);
    }
    return boolean(false);
  }

  instantiate(): LogicTerm {
    return this;
  }

  toPrimitive(): YuValue {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

/**
 * Represents a compound structure (Functors, Constructors, Application).
 */
export class CompoundTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "Compound";
  constructor(
    public readonly functor: string,
    public readonly args: LogicTerm[],
  ) {
    super();
  }

  equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  compare(other: YuValue): ExecutionCommand {
    throw new Error("Compound terms are not comparable");
  }
  getType(): string {
    return "Compound";
  }
  toJSON(): unknown {
    return {
      type: "Compound",
      functor: this.functor,
      args: this.args.map((a) => a.toJSON()),
    };
  }

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    return this.args.some((arg) => arg.occurs(v, env));
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    const r2 = other.resolve(env);
    if (r2.logicTermType === "Wildcard") return boolean(true);
    if (r2.logicTermType === "Variable") {
      const v2 = r2 as VariableTerm;
      if (this.occurs(v2, env)) return boolean(false);
      env.set(v2.id, this);
      return boolean(true);
    }
    if (r2.logicTermType === "Compound") {
      const c2 = r2 as CompoundTerm;
      if (this.functor !== c2.functor) return boolean(false);
      if (this.args.length !== c2.args.length) return boolean(false);
      return boolean(this.args.every((arg, i) => arg.unify(c2.args[i], env) as any));
    }
    return boolean(false);
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    return new CompoundTerm(
      this.functor,
      this.args.map((a) => a.instantiate(env, seen)),
    );
  }

  toPrimitive(env: Substitution): YuValue {
    const args = this.args.map((a) => a.toPrimitive(env));
    // represent as a RuntimeObject
    return new RuntimeObject(
      this.functor,
      this.functor,
      new Map(args.map((v, i) => [`_${i}`, v])),
      new Map(),
    );
  }

  toString(): string {
    return `${this.functor}(${this.args.map((a) => a.toString()).join(", ")})`;
  }
}

/**
 * Represents the wildcard pattern (_).
 */
export class WildcardTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "Wildcard";
  constructor() {
    super();
  }

  equals(other: YuValue): ExecutionCommand {
    return boolean(other instanceof WildcardTerm);
  }
  compare(other: YuValue): ExecutionCommand {
    return new StepCommand(new YuNumber(0));
  }
  getType(): string {
    return "Wildcard";
  }
  toJSON(): unknown {
    return "_";
  }

  resolve(): LogicTerm {
    return this;
  }

  occurs(): boolean {
    return false;
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    return boolean(true);
  }

  instantiate(): LogicTerm {
    return this;
  }

  toPrimitive(): YuValue {
    return YuNil.getInstance();
  }

  toString(): string {
    return "_";
  }
}

/**
 * Represents a List [x, y, z].
 */
export class ListTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "List";
  constructor(public readonly elements: LogicTerm[]) {
    super();
  }

  equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  compare(other: YuValue): ExecutionCommand {
    throw new Error("List terms are not comparable");
  }
  getType(): string {
    return "ListTerm";
  }
  toJSON(): unknown {
    return this.elements.map((e) => e.toJSON());
  }

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    return this.elements.some((el) => el.occurs(v, env));
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    const r2 = other.resolve(env);
    if (r2.logicTermType === "Wildcard") return boolean(true);
    if (r2.logicTermType === "Variable") {
      const v2 = r2 as VariableTerm;
      if (this.occurs(v2, env)) return boolean(false);
      env.set(v2.id, this);
      return boolean(true);
    }
    if (r2.logicTermType === "List") {
      const l2 = r2 as ListTerm;
      if (this.elements.length !== l2.elements.length) return boolean(false);
      return boolean(this.elements.every((el, i) => el.unify(l2.elements[i], env) as any));
    }
    if (r2.logicTermType === "Cons") {
      // Delegate to ConsTerm.unify to leverage iterative unrolling
      return r2.unify(this, env);
    }
    return boolean(false);
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    return new ListTerm(this.elements.map((e) => e.instantiate(env, seen)));
  }

  toPrimitive(env: Substitution): YuValue {
    return new YuArray(this.elements.map((e) => e.toPrimitive(env)));
  }

  toString(): string {
    return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
  }
}

/**
 * Represents a Cons cell (head:tail).
 */
export class ConsTerm extends YuValue implements LogicTerm {
  readonly logicTermType = "Cons";
  constructor(
    public readonly head: LogicTerm,
    public readonly tail: LogicTerm,
  ) {
    super();
  }

  equals(other: YuValue): ExecutionCommand {
    return boolean(other === this);
  }
  compare(other: YuValue): ExecutionCommand {
    throw new Error("Cons terms are not comparable");
  }
  getType(): string {
    return "ConsTerm";
  }
  toJSON(): unknown {
    return { head: this.head.toJSON(), tail: this.tail.toJSON() };
  }

  resolve(): LogicTerm {
    return this;
  }

  occurs(v: VariableTerm, env: Substitution): boolean {
    let curr: LogicTerm = this;
    while (curr.logicTermType === "Cons") {
      const c = curr as ConsTerm;
      if (c.head.occurs(v, env)) return true;
      curr = c.tail.resolve(env);
    }
    return curr.occurs(v, env);
  }

  unify(other: LogicTerm, env: Substitution): ExecutionCommand {
    let curr1: LogicTerm = this;
    let curr2 = other.resolve(env);

    while (curr1.logicTermType === "Cons") {
      const c1 = curr1 as ConsTerm;
      if (curr2.logicTermType === "Wildcard") return boolean(true);
      if (curr2.logicTermType === "Variable") {
        const v2 = curr2 as VariableTerm;
        if (c1.occurs(v2, env)) return boolean(false);
        env.set(v2.id, c1);
        return boolean(true);
      }
      if (curr2.logicTermType === "Cons") {
        const c2 = curr2 as ConsTerm;
        if (!(c1.head.unify(c2.head, env) as any)) return boolean(false);
        curr1 = c1.tail.resolve(env);
        curr2 = c2.tail.resolve(env);
      } else if (curr2.logicTermType === "List") {
        const l2 = curr2 as ListTerm;
        if (l2.elements.length === 0) return boolean(false);
        const [h, ...t] = l2.elements;
        if (!(c1.head.unify(h, env) as any)) return boolean(false);
        curr1 = c1.tail.resolve(env);
        curr2 = new ListTerm(t);
      } else {
        return boolean(false);
      }
    }

    return curr1.unify(curr2, env);
  }

  instantiate(env: Substitution, seen?: Set<number>): LogicTerm {
    let curr: LogicTerm = this;
    const heads: LogicTerm[] = [];
    while (curr.logicTermType === "Cons") {
      const c = curr as ConsTerm;
      heads.push(c.head.instantiate(env, seen));
      curr = c.tail.resolve(env);
    }
    let result = curr.instantiate(env, seen);
    for (let i = heads.length - 1; i >= 0; i--) {
      result = new ConsTerm(heads[i], result);
    }
    return result;
  }

  toPrimitive(env: Substitution): YuValue {
    let curr: LogicTerm = this;
    const heads: YuValue[] = [];
    while (curr.logicTermType === "Cons") {
      const c = curr as ConsTerm;
      heads.push(c.head.toPrimitive(env));
      curr = c.tail.resolve(env);
    }
    const tailVal = curr.toPrimitive(env);

    let res = tailVal;
    for (let i = heads.length - 1; i >= 0; i--) {
      const seq = res.asSequence;
      if (seq && seq instanceof YuArray) {
        res = new YuArray([heads[i], ...seq]);
      } else {
        // Hybrid cons case?
        res = new YuArray([heads[i], res]);
      }
    }
    return res;
  }

  toString(): string {
    return `(${this.head.toString()}:${this.tail.toString()})`;
  }
}
