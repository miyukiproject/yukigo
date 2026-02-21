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
  TuplePattern,
  UnionPattern,
  VariablePattern,
  Visitor,
  WildcardPattern,
  TypePattern,
  SimpleType,
  ListType,
} from "yukigo-ast";
import { Bindings } from "../index.js";
import { InterpreterVisitor } from "./Visitor.js";
import { CPSThunk, Thunk, Continuation } from "../trampoline.js";
import { LazyRuntime } from "./runtimes/LazyRuntime.js";
import { getYukigoType } from "../utils.js";

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
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitApplicationPattern(node: ApplicationPattern): string {
    // Same as FunctorPattern
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitAsPattern(node: AsPattern): string {
    const alias = node.left.accept(this);
    const pattern = node.right.accept(this);
    return `${alias}@${pattern}`;
  }

  visitTypePattern(node: TypePattern): string {
    const typeStr = node.targetType.toString();
    return node.innerPattern
      ? `(${typeStr} ${node.innerPattern.accept(this)})`
      : typeStr;
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
export class PatternMatcher implements Visitor<CPSThunk<boolean>> {
  constructor(
    private value: PrimitiveValue,
    private bindings: Bindings,
    private lazyRuntime: LazyRuntime,
  ) {}

  visitVariablePattern(node: VariablePattern): CPSThunk<boolean> {
    return (k) => {
      this.bindings.push([node.name.value, this.value]);
      return k(true);
    };
  }

  visitWildcardPattern(node: WildcardPattern): CPSThunk<boolean> {
    return (k) => k(true);
  }

  visitLiteralPattern(node: LiteralPattern): CPSThunk<boolean> {
    return (k) => {
      const literalValue = InterpreterVisitor.evaluateLiteral(node.name);
      return this.deepEqual(this.value, literalValue, k);
    };
  }

  visitTuplePattern(node: TuplePattern): CPSThunk<boolean> {
    return (k) => {
      const processValue = (val: PrimitiveValue): Thunk<boolean> => {
        if (!Array.isArray(val)) return k(false);
        if (val.length !== node.elements.length) return k(false);

        const matchNext = (index: number): Thunk<boolean> => {
          if (index >= node.elements.length) return k(true);
          const matcher = new PatternMatcher(
            val[index],
            this.bindings,
            this.lazyRuntime,
          );
          return node.elements[index].accept(matcher)((isMatch) => {
            if (!isMatch) return k(false);
            return () => matchNext(index + 1);
          });
        };
        return matchNext(0);
      };

      if (isLazyList(this.value)) {
        return this.lazyRuntime.realizeList(this.value, (val) => {
          return () => processValue(val);
        });
      }
      return processValue(this.value);
    };
  }

  visitListPattern(node: ListPattern): CPSThunk<boolean> {
    return (k) => {
      const value = this.value;
      const neededLength = node.elements.length;

      const finishMatching = (valArr: PrimitiveValue[]): Thunk<boolean> => {
        if (valArr.length !== neededLength) return k(false);
        return this.matchList(node.elements, valArr, k);
      };

      // empty list case
      if (neededLength === 0) {
        if (Array.isArray(value) || typeof value === "string")
          return k(value.length === 0);

        if (isLazyList(value)) {
          const iter = value.generator();
          return k(iter.next().done);
        }
        return k(false);
      }

      if (Array.isArray(value)) return finishMatching(value);
      if (typeof value === "string") return finishMatching(value.split(""));

      if (isLazyList(value)) {
        return this.lazyRuntime.realizeList(value, (valArr) => {
          return () => finishMatching(valArr);
        });
      }

      return k(false);
    };
  }

  private matchList(
    elements: Pattern[],
    value: PrimitiveValue[],
    k: Continuation<boolean>,
  ): Thunk<boolean> {
    if (value.length !== elements.length) return k(false);
    const matchNext = (index: number): Thunk<boolean> => {
      if (index >= elements.length) return k(true);
      const matcher = new PatternMatcher(
        value[index],
        this.bindings,
        this.lazyRuntime,
      );
      return elements[index].accept(matcher)((isMatch) => {
        if (!isMatch) return k(false);
        return () => matchNext(index + 1);
      });
    };
    return matchNext(0);
  }

  visitConsPattern(node: ConsPattern): CPSThunk<boolean> {
    return (k) => {
      const [head, tail] = this.resolveCons(this.value);
      if (head === null || tail === null) return k(false);

      const headMatcher = new PatternMatcher(
        head,
        this.bindings,
        this.lazyRuntime,
      );
      return node.left.accept(headMatcher)((headMatches) => {
        if (!headMatches) return k(false);
        const tailMatcher = new PatternMatcher(
          tail,
          this.bindings,
          this.lazyRuntime,
        );
        return node.right.accept(tailMatcher)(k);
      });
    };
  }

  visitTypePattern(node: TypePattern): CPSThunk<boolean> {
    return (k) => {
      const actualType = getYukigoType(this.value);

      let matches = false;
      const targetType = node.targetType;

      if (targetType instanceof SimpleType) {
        matches = targetType.value === actualType;
      } else if (targetType instanceof ListType) {
        matches = actualType === "YuList";
      }

      if (!matches) return k(false);

      if (node.innerPattern) {
        const innerMatcher = new PatternMatcher(
          this.value,
          this.bindings,
          this.lazyRuntime,
        );
        return node.innerPattern.accept(innerMatcher)(k);
      }

      return k(true);
    };
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

  visitConstructorPattern(node: ConstructorPattern): CPSThunk<boolean> {
    return (k) => {
      if (!Array.isArray(this.value) || this.value.length === 0)
        return k(false);
      if (this.value[0] !== node.identifier.value) return k(false);

      const args = this.value.slice(1);
      return this.matchList(node.args, args, k);
    };
  }

  visitFunctorPattern(node: FunctorPattern): CPSThunk<boolean> {
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitApplicationPattern(node: ApplicationPattern): CPSThunk<boolean> {
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitAsPattern(node: AsPattern): CPSThunk<boolean> {
    return (k) => {
      const innerMatcher = new PatternMatcher(
        this.value,
        this.bindings,
        this.lazyRuntime,
      );
      return node.right.accept(innerMatcher)((innerMatches) => {
        if (!innerMatches) return k(false);
        const aliasMatcher = new PatternMatcher(
          this.value,
          this.bindings,
          this.lazyRuntime,
        );
        return node.left.accept(aliasMatcher)(k);
      });
    };
  }

  visitUnionPattern(node: UnionPattern): CPSThunk<boolean> {
    return (k) => {
      const tryNext = (index: number): Thunk<boolean> => {
        if (index >= node.elements.length) return k(false);
        const pattern = node.elements[index];
        const trialBindings: Bindings = [];
        const matcher = new PatternMatcher(
          this.value,
          trialBindings,
          this.lazyRuntime,
        );
        return pattern.accept(matcher)((isMatch) => {
          if (isMatch) {
            this.bindings.push(...trialBindings);
            return k(true);
          }
          return () => tryNext(index + 1);
        });
      };
      return tryNext(0);
    };
  }

  visit(node: ASTNode): CPSThunk<boolean> {
    return node.accept(this);
  }

  private deepEqual(
    a: PrimitiveValue,
    b: PrimitiveValue,
    k: Continuation<boolean>,
  ): Thunk<boolean> {
    return this.lazyRuntime.deepEqual(a, b, k);
  }
}
