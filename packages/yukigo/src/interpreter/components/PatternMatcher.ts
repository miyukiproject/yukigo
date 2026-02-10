import {
  ApplicationPattern,
  AsPattern,
  ASTNode,
  ConsPattern,
  ConstructorPattern,
  FunctorPattern,
  isLazyList,
  LazyList,
  ListPattern,
  ListPrimitive,
  LiteralPattern,
  Pattern,
  PrimitiveValue,
  SymbolPrimitive,
  TuplePattern,
  UnionPattern,
  VariablePattern,
  Visitor,
  WildcardPattern,
} from "yukigo-ast";
import { Bindings } from "../index.js";
import { InterpreterVisitor } from "./Visitor.js";
import { createGlobalEnv, createStream } from "../utils.js";

class SharedSequence {
  private cache: PrimitiveValue[] = [];
  private source: Generator<PrimitiveValue, void, unknown>;
  private isDone: boolean = false;

  constructor(
    generatorFactory: () => Generator<PrimitiveValue, void, unknown>,
  ) {
    this.source = generatorFactory();
  }

  get(index: number): { value: PrimitiveValue | null; done: boolean } {
    if (index < this.cache.length)
      return { value: this.cache[index], done: false };

    if (this.isDone) return { value: null, done: true };

    while (this.cache.length <= index) {
      const next = this.source.next();
      if (next.done) {
        this.isDone = true;
        return { value: null, done: true };
      }
      this.cache.push(next.value);
    }

    return { value: this.cache[index], done: false };
  }
}

export interface MemoizedLazyList extends LazyList {
  _sequence: SharedSequence;
  _offset: number;
  toJSON: () => any;
}

export function isMemoizedList(list: any): list is MemoizedLazyList {
  return (
    list &&
    typeof list === "object" &&
    list.type === "LazyList" &&
    list._sequence instanceof SharedSequence
  );
}

export function createMemoizedStream(
  genFactory: () => Generator<PrimitiveValue, void, unknown>,
  sequence?: SharedSequence,
  offset: number = 0,
): MemoizedLazyList {
  const seq = sequence ?? new SharedSequence(genFactory);

  return {
    type: "LazyList",
    _sequence: seq,
    _offset: offset,

    generator: function* () {
      let currentIdx = offset;
      while (true) {
        const res = seq.get(currentIdx);
        if (res.done) return;
        yield res.value!;
        currentIdx++;
      }
    },
    toJSON() {
      const iterator = this.generator();
      const buffer: PrimitiveValue[] = [];
      let next = iterator.next();

      while (!next.done) {
        buffer.push(next.value);
        next = iterator.next();
      }

      return buffer;
    },
  };
}

export class PatternResolver implements Visitor<string> {
  visitVariablePattern(node: VariablePattern): string {
    return node.name.value;
  }

  visitWildcardPattern(node: WildcardPattern): string {
    return "_";
  }

  visitLiteralPattern(node: LiteralPattern): string {
    const { name } = node;
    if (name instanceof ListPrimitive)
      return String(name.value.map((elem) => elem.accept(this)));
    return String(name.value);
  }

  visitTuplePattern(node: TuplePattern): string {
    return String(node.elements.map((elem) => elem.accept(this)));
  }

  visitListPattern(node: ListPattern): string {
    const { elements } = node;
    return elements.length === 0
      ? "[]"
      : String(elements.map((elem) => elem.accept(this)));
  }

  visitConsPattern(node: ConsPattern): string {
    const head = node.left.accept(this);
    const tail = node.right.accept(this);
    return `(${head}:${tail})`;
  }

  visitConstructorPattern(node: ConstructorPattern): string {
    const constr = node.identifier.value;
    const args = node.args.map((pat) => pat.accept(this)).join(" ");
    return `${constr} ${args}`;
  }

  visitFunctorPattern(node: FunctorPattern): string {
    // Same as ConstructorPattern (alias)
    return this.visitConstructorPattern(
<<<<<<< HEAD
      new ConstructorPattern(node.identifier, node.args)
=======
      new ConstructorPattern(node.identifier.value, node.args),
>>>>>>> c518def (fix(yukigo): enhance pattern matching to support strings as lists and update related logic)
    );
  }

  visitApplicationPattern(node: ApplicationPattern): string {
    // Same as FunctorPattern
    return this.visitConstructorPattern(
<<<<<<< HEAD
      new ConstructorPattern(node.identifier, node.args)
=======
      new ConstructorPattern(node.symbol.value, node.args),
>>>>>>> c518def (fix(yukigo): enhance pattern matching to support strings as lists and update related logic)
    );
  }

  visitAsPattern(node: AsPattern): string {
    const alias = node.left.accept(this);
    const pattern = node.right.accept(this);
    return `${alias}@${pattern}`;
  }

  visit(node: ASTNode): string {
    return node.accept(this);
  }
}
/**
 * Recursively matches a value against a pattern node.
 * Updates `bindings` when variables are bound successfully.
 * Returns true if the pattern matches, false otherwise.
 */
export class PatternMatcher implements Visitor<boolean> {
  private value: PrimitiveValue;
  private bindings: Bindings;

  constructor(value: PrimitiveValue, bindings: Bindings) {
    this.value = value;
    this.bindings = bindings;
  }

  visitVariablePattern(node: VariablePattern): boolean {
    this.bindings.push([node.name.value, this.value]);
    return true;
  }

  visitWildcardPattern(node: WildcardPattern): boolean {
    return true;
  }

  visitLiteralPattern(node: LiteralPattern): boolean {
    const literalValue = InterpreterVisitor.evaluateLiteral(node.name);
    return this.deepEqual(this.value, literalValue);
  }

  visitTuplePattern(node: TuplePattern): boolean {
    if (!Array.isArray(this.value)) return false;
    if (this.value.length !== node.elements.length) return false;

    for (let i = 0; i < node.elements.length; i++) {
      const matcher = new PatternMatcher(this.value[i], this.bindings);
      if (!node.elements[i].accept(matcher)) return false;
    }
    return true;
  }

  visitListPattern(node: ListPattern): boolean {
    const value = this.value;
    const neededLength = node.elements.length;
    // empty list case
    if (node.elements.length === 0) {
      if (Array.isArray(value) || typeof value === "string")
        return value.length === 0;

      if (isLazyList(value)) {
        const iter = value.generator();
        return iter.next().done;
      }
      return false;
    }

    // finite list case
    if (Array.isArray(value)) {
      if (value.length !== neededLength) return false;
      return this.matchList(node.elements, value);
    }

    // string case
    if (typeof value === "string") {
      if (value.length !== neededLength) return false;
      return this.matchList(node.elements, value.split(""));
    }

    // lazy list case
    if (isLazyList(value)) {
      const iterator = value.generator();
      const bufferedValues: PrimitiveValue[] = [];

      for (let i = 0; i < neededLength; i++) {
        const next = iterator.next();
        if (next.done) return false;
        bufferedValues.push(next.value);
      }
      const peek = iterator.next();
      if (!peek.done) return false;

      return this.matchList(node.elements, bufferedValues);
    }

    return false;
  }
  private matchList(elements: Pattern[], value: PrimitiveValue[]) {
    if (value.length !== elements.length) return false;
    for (let i = 0; i < elements.length; i++) {
      const matcher = new PatternMatcher(value[i], this.bindings);
      const isMatch = elements[i].accept(matcher);
      if (!isMatch) return false;
    }
    return true;
  }

  visitConsPattern(node: ConsPattern): boolean {
    const [head, tail] = this.resolveCons(this.value);
    if (head === null || tail === null) return false;
    const headMatcher = new PatternMatcher(head, this.bindings);
    const headMatches = node.left.accept(headMatcher);
    if (!headMatches) return false;

    const tailMatcher = new PatternMatcher(tail, this.bindings);
    return node.right.accept(tailMatcher);
  }
  private resolveCons(list: PrimitiveValue): [PrimitiveValue, PrimitiveValue] {
    if (Array.isArray(list))
      return list.length === 0 ? [null, null] : [list[0], list.slice(1)];

    if (typeof list === "string")
      return list.length === 0 ? [null, null] : [list[0], list.slice(1)];

    // lazy list case
    if (isLazyList(list)) {
      let memoList: MemoizedLazyList;

      // optimize, convert to memoized
      if (isMemoizedList(list)) {
        memoList = list;
      } else {
        memoList = createMemoizedStream(list.generator);
      }
      const currentRes = memoList._sequence.get(memoList._offset);

      if (currentRes.done) return [null, null];
      const tail = createMemoizedStream(
        list.generator,
        memoList._sequence,
        memoList._offset + 1,
      );

      return [currentRes.value!, tail];
    }

    return [null, null];
  }

  visitConstructorPattern(node: ConstructorPattern): boolean {
    if (!Array.isArray(this.value) || this.value.length === 0) return false;
    if (this.value[0] !== node.identifier.value) return false;

    const args = this.value.slice(1);
    return this.matchList(node.args, args);
  }

  visitFunctorPattern(node: FunctorPattern): boolean {
    return this.visitConstructorPattern(
<<<<<<< HEAD
      new ConstructorPattern(node.identifier, node.args)
=======
      new ConstructorPattern(node.identifier.value, node.args),
>>>>>>> c518def (fix(yukigo): enhance pattern matching to support strings as lists and update related logic)
    );
  }

  visitApplicationPattern(node: ApplicationPattern): boolean {
    return this.visitConstructorPattern(
<<<<<<< HEAD
      new ConstructorPattern(node.identifier, node.args)
=======
      new ConstructorPattern(node.symbol.value, node.args),
>>>>>>> c518def (fix(yukigo): enhance pattern matching to support strings as lists and update related logic)
    );
  }

  visitAsPattern(node: AsPattern): boolean {
    const innerMatcher = new PatternMatcher(this.value, this.bindings);
    const innerMatches = node.right.accept(innerMatcher);
    if (!innerMatches) return false;

    const aliasMatcher = new PatternMatcher(this.value, this.bindings);
    return node.left.accept(aliasMatcher);
  }

  visitUnionPattern(node: UnionPattern): boolean {
    for (const pattern of node.elements) {
      const trialBindings: Bindings = [];
      const matcher = new PatternMatcher(this.value, trialBindings);
      if (pattern.accept(matcher)) {
        this.bindings.push(...trialBindings);
        return true;
      }
    }
    return false;
  }

  visit(node: ASTNode): boolean {
    return node.accept(this);
  }

  private deepEqual(a: PrimitiveValue, b: PrimitiveValue): boolean {
    if (a === b) return true;

    // Support comparing char primitives with strings
    if (typeof a === "string" && typeof b === "string") return a === b;

    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    return false;
  }

  private realize(value: PrimitiveValue): PrimitiveValue[] {
    return new InterpreterVisitor(createGlobalEnv(), {}).realizeList(value);
  }
}
