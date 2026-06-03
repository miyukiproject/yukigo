import {
  ApplicationPattern,
  AsPattern,
  ASTNode,
  ConsPattern,
  ConstructorPattern,
  Expression,
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
  EnvStack,
} from "yukigo-ast";
import { Bindings } from "../index.js";
import { InterpreterVisitor } from "./Visitor.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
} from "../components/kernel/commands.js";
import { RuntimeContext } from "./RuntimeContext.js";
import { Evaluator, getYukigoType } from "../utils.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";

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
export interface InternalConsState {
  readonly head: PrimitiveValue;
  readonly tailExpr: Expression;
  readonly evaluator: Evaluator;
  readonly capturedEnv: EnvStack;
  realizedTail?: PrimitiveValue;
}

export interface MemoizedLazyList extends LazyList {
  _sequence: SharedSequence;
  _offset: number;
  _consState?: InternalConsState;
  toJSON: () => any;
}

export function isMemoizedList(list: unknown): list is MemoizedLazyList {
  return (
    list !== null &&
    typeof list === "object" &&
    "type" in list &&
    "_offset" in list &&
    "_sequence" in list
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
/**
 * Recursively matches a value against a pattern node.
 * Updates `bindings` when variables are bound successfully.
 * Returns true if the pattern matches, false otherwise.
 */
export class PatternMatcher {
  constructor(
    private value: PrimitiveValue,
    private bindings: Bindings,
    private ctx: RuntimeContext,
  ) {}

  visitVariablePattern(node: VariablePattern): ExecutionCommand {
    this.bindings.push([node.name.value, this.value]);
    return new StepCommand(true);
  }

  visitWildcardPattern(node: WildcardPattern): ExecutionCommand {
    return new StepCommand(true);
  }

  visitLiteralPattern(node: LiteralPattern): ExecutionCommand {
    const literalValue = InterpreterVisitor.evaluateLiteral(node.name);
    return this.ctx.lazyRuntime.deepEqual(this.value, literalValue);
  }

  visitTuplePattern(node: TuplePattern): ExecutionCommand {
    const processValue = (val: PrimitiveValue): ExecutionCommand => {
      if (!Array.isArray(val)) return new StepCommand(false);
      if (val.length !== node.elements.length)
        return new StepCommand(false);

      return this.matchList(node.elements, val, 0);
    };

    if (isLazyList(this.value)) {
      return new BindCommand(this.ctx.lazyRuntime.realizeList(this.value), processValue);
    }
    return processValue(this.value);
  }

  visitListPattern(node: ListPattern): ExecutionCommand {
    const value = this.value;
    const neededLength = node.elements.length;

    const finishMatching = (valArr: PrimitiveValue): ExecutionCommand => {
      if(!Array.isArray(valArr)) throw new InterpreterError("[PatternMatcher]", `Expected ${valArr} to be a list.`)
      if (valArr.length !== neededLength) return new StepCommand(false);
      return this.matchList(node.elements, valArr, 0);
    };

    if (neededLength === 0) {
      if (Array.isArray(value) || typeof value === "string")
        return new StepCommand(value.length === 0);

      if (isLazyList(value)) {
        const iter = value.generator();
        return new StepCommand(Boolean(iter.next().done));
      }
      return new StepCommand(false);
    }

    if (Array.isArray(value)) return finishMatching(value);
    if (typeof value === "string") return finishMatching(value.split(""));

    if (isLazyList(value)) {
      return new BindCommand(this.ctx.lazyRuntime.realizeList(value), finishMatching);
    }

    return new StepCommand(false);
  }

  private matchList(
    elements: Pattern[],
    value: PrimitiveValue[],
    index: number,
  ): ExecutionCommand {
    if (index >= elements.length) return new StepCommand(true);

    const matcher = new PatternMatcher(value[index], this.bindings, this.ctx);
    return new BindCommand(elements[index].accept(matcher), (isMatch) => {
      if (!isMatch) return new StepCommand(false);
      return this.matchList(elements, value, index + 1);
    });
  }

  visitConsPattern(node: ConsPattern): ExecutionCommand {
    const [head, tail] = this.resolveCons(this.value);
    if (head === null || tail === null) return new StepCommand(false);

    const headMatcher = new PatternMatcher(head, this.bindings, this.ctx);
    return new BindCommand(node.left.accept(headMatcher), (headMatches) => {
      if (!headMatches) return new StepCommand(false);
      const tailMatcher = new PatternMatcher(tail, this.bindings, this.ctx);
      return node.right.accept(tailMatcher);
    });
  }

  visitTypePattern(node: TypePattern): ExecutionCommand {
    const actualType = getYukigoType(this.value);
    let matches = false;
    const targetType = node.targetType;

    if (targetType instanceof SimpleType) {
      matches = targetType.value === actualType;
    } else if (targetType instanceof ListType) {
      matches = actualType === "YuList";
    }

    if (!matches) return new StepCommand(false);

    if (node.innerPattern) {
      const innerMatcher = new PatternMatcher(
        this.value,
        this.bindings,
        this.ctx,
      );
      return node.innerPattern.accept(innerMatcher);
    }

    return new StepCommand(true);
  }

  private resolveCons(list: PrimitiveValue): [PrimitiveValue, PrimitiveValue] {
    if (Array.isArray(list)) {
      if (list.length === 0) return [null, null];
      const isLazy = this.ctx.config.lazyLoading;
      if (!isLazy) return [list[0], list.slice(1)];
      const tail: LazyList = {
        type: "LazyList",
        generator: function* () {
          for (let i = 1; i < list.length; i++) yield list[i];
        },
      };
      return [list[0], tail];
    }

    if (typeof list === "string") {
      if (list.length === 0) return [null, null];

      const isLazy = this.ctx.config.lazyLoading;
      if (!isLazy) return [list[0], list.slice(1)];
      const tail: LazyList = {
        type: "LazyList",
        generator: function* () {
          for (let i = 1; i < list.length; i++) yield list[i];
        },
      };
      return [list[0], tail];
    }

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

  visitConstructorPattern(node: ConstructorPattern): ExecutionCommand {
    if (!Array.isArray(this.value) || this.value.length === 0)
      return new StepCommand(false);
    if (this.value[0] !== node.identifier.value)
      return new StepCommand(false);

    const args = this.value.slice(1);
    return this.matchList(node.args, args, 0);
  }

  visitFunctorPattern(node: FunctorPattern): ExecutionCommand {
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitApplicationPattern(node: ApplicationPattern): ExecutionCommand {
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier, node.args),
    );
  }

  visitAsPattern(node: AsPattern): ExecutionCommand {
    const innerMatcher = new PatternMatcher(
      this.value,
      this.bindings,
      this.ctx,
    );

    return new BindCommand(node.right.accept(innerMatcher), (innerMatches) => {
      if (!innerMatches) return new StepCommand(false);

      const aliasMatcher = new PatternMatcher(
        this.value,
        this.bindings,
        this.ctx,
      );
      return node.left.accept(aliasMatcher);
    });
  }

  visitUnionPattern(node: UnionPattern): ExecutionCommand {
    const tryNext = (index: number): ExecutionCommand => {
      if (index >= node.elements.length) return new StepCommand(false);

      const pattern = node.elements[index];
      const trialBindings: Bindings = [];
      const matcher = new PatternMatcher(this.value, trialBindings, this.ctx);

      return new BindCommand(pattern.accept(matcher), (isMatch) => {
        if (isMatch) {
          this.bindings.push(...trialBindings);
          return new StepCommand(true);
        }
        return tryNext(index + 1);
      });
    };

    return tryNext(0);
  }

  visit(node: ASTNode): ExecutionCommand {
    return node.accept(this);
  }
  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(new UnexpectedNode(node.constructor.name, "PatternMatcher"));
  }
}
