import {
  ApplicationPattern,
  AsPattern,
  ASTNode,
  ConsPattern,
  ConstructorPattern,
  FunctorPattern,
  ListPattern,
  LiteralPattern,
  Pattern,
  TuplePattern,
  UnionPattern,
  VariablePattern,
  WildcardPattern,
  TypePattern,
  SimpleType,
  ListType,
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
import { boolean, getYukigoType } from "../utils.js";
import { InterpreterError, UnexpectedNode } from "../errors.js";
import { EqualityComparer } from "./EqualityComparer.js";
import {
  YuValue,
  YuBoolean,
  YuArray,
  isLazyList,
  YuNil,
  YuString,
  LazyList,
  LazyStepResult,
  YuChar,
} from "../primitives/index.js";

/**
 * Recursively matches a value against a pattern node.
 * Updates `bindings` when variables are bound successfully.
 * Returns true if the pattern matches, false otherwise.
 */
export class PatternMatcher {
  constructor(
    private value: YuValue,
    private bindings: Bindings,
    private ctx: RuntimeContext,
  ) {}

  visitVariablePattern(node: VariablePattern): ExecutionCommand {
    this.bindings.push([node.name.value, this.value]);
    return boolean(true);
  }

  visitWildcardPattern(node: WildcardPattern): ExecutionCommand {
    return boolean(true);
  }

  visitLiteralPattern(node: LiteralPattern): ExecutionCommand {
    const literalValue = InterpreterVisitor.evaluateLiteral(node.name);
    return EqualityComparer.compare(this.value, literalValue);
  }

  visitTuplePattern(node: TuplePattern): ExecutionCommand {
    const processValue = (val: YuValue): ExecutionCommand => {
      const seq = val.asSequence;
      if (!(seq instanceof YuArray))
        return boolean(false);
      if (seq.items.length !== node.elements.length)
        return boolean(false);

      return this.matchList(node.elements, seq, 0);
    };

    const valSeq = this.value.asSequence;
    if (valSeq && isLazyList(valSeq)) {
      return new BindCommand(
        this.ctx.lazyRuntime.realizeList(this.value),
        processValue,
      );
    }
    return processValue(this.value);
  }

  visitListPattern(node: ListPattern): ExecutionCommand {
    const value = this.value;
    const neededLength = node.elements.length;

    const finishMatching = (valArr: YuValue): ExecutionCommand => {
      const seq = valArr.asSequence;
      if (!(seq instanceof YuArray))
        throw new InterpreterError(
          "[PatternMatcher]",
          `Expected ${valArr} to be a list.`,
        );
      if (seq.items.length !== neededLength)
        return boolean(false);
      return this.matchList(node.elements, seq, 0);
    };

    if (neededLength === 0) {
      if (value instanceof YuNil) return boolean(true);
      const seq = value.asSequence;
      if (seq) {
        if (seq instanceof YuArray || seq instanceof YuString) {
          return new StepCommand(
            new YuBoolean((seq.toJSON() as any).length === 0),
          );
        }
        if (isLazyList(seq)) {
          return new BindCommand(
            seq.step(),
            (res) => boolean(res instanceof YuNil),
          );
        }
      }
      return boolean(false);
    }

    if (value instanceof YuNil) return boolean(false);

    const seq = value.asSequence;
    if (seq) {
      if (seq instanceof YuArray) return finishMatching(value);
      if (seq instanceof YuString)
        return new BindCommand(seq.split(), (splitted) =>
          finishMatching(splitted),
        );

      if (isLazyList(seq)) {
        return new BindCommand(
          this.ctx.lazyRuntime.realizeList(value),
          finishMatching,
        );
      }
    }

    return boolean(false);
  }

  private matchList(
    elements: Pattern[],
    value: YuArray,
    index: number,
  ): ExecutionCommand {
    if (index >= elements.length) return boolean(true);

    const matcher = new PatternMatcher(
      value.at(index),
      this.bindings,
      this.ctx,
    );
    return new BindCommand(elements[index].accept(matcher), (res) => {
      const isMatch = res instanceof YuBoolean && res.value;
      if (!isMatch) return boolean(false);
      return this.matchList(elements, value, index + 1);
    });
  }

  visitConsPattern(node: ConsPattern): ExecutionCommand {
    return new BindCommand(this.resolveCons(this.value), (resolved) => {
      if (!(resolved instanceof YuArray) || resolved.items.length !== 2)
        return boolean(false);
      const head = resolved.at(0);
      const tail = resolved.at(1);

      const headMatcher = new PatternMatcher(head, this.bindings, this.ctx);
      return new BindCommand(node.left.accept(headMatcher), (headRes) => {
        const headMatches = headRes instanceof YuBoolean && headRes.value;
        if (!headMatches) return boolean(false);
        const tailMatcher = new PatternMatcher(tail, this.bindings, this.ctx);
        return node.right.accept(tailMatcher);
      });
    });
  }

  visitTypePattern(node: TypePattern): ExecutionCommand {
    const actualType = getYukigoType(this.value);
    let matches = false;
    const targetType = node.targetType;

    if (targetType instanceof SimpleType) {
      matches = targetType.value === actualType;
    } else if (targetType instanceof ListType) {
      matches =
        actualType === "List" ||
        actualType === "Array" ||
        actualType === "String";
    }

    if (!matches) return boolean(false);

    if (node.innerPattern) {
      const innerMatcher = new PatternMatcher(
        this.value,
        this.bindings,
        this.ctx,
      );
      return node.innerPattern.accept(innerMatcher);
    }

    return boolean(true);
  }

  private resolveCons(val: YuValue): ExecutionCommand {
    const list = val.asSequence;
    if (!list) return new StepCommand(YuNil.getInstance());

    if (list instanceof YuArray) {
      if (list.items.length === 0) return new StepCommand(YuNil.getInstance());
      const isLazy = this.ctx.config.lazyLoading;
      if (!isLazy)
        return new StepCommand(
          new YuArray([
            list.at(0),
            new YuArray(list.items.slice(list.index + 1)),
          ]),
        );

      const tail = new LazyList(() => {
        const next = (arr: YuArray, idx: number): ExecutionCommand => {
          if (idx >= arr.items.length)
            return new StepCommand(YuNil.getInstance());
          return new StepCommand(
            new LazyStepResult(
              arr.items[idx],
              new LazyList(() => next(arr, idx + 1)),
            ),
          );
        };
        return next(list, list.index + 1);
      });
      const arr = new YuArray([list.at(0), tail]);
      return new StepCommand(arr);
    }

    if (list instanceof YuString) {
      const s = list.toJSON();
      if (s.length === 0) return new StepCommand(YuNil.getInstance());

      const isLazy = this.ctx.config.lazyLoading;
      if (!isLazy)
        return new StepCommand(
          new YuArray([new YuString(s[0]), new YuString(s.slice(1))]),
        );
      const tail = new LazyList(() => {
        const next = (str: string, idx: number): ExecutionCommand => {
          if (idx >= str.length) return new StepCommand(YuNil.getInstance());
          return new StepCommand(
            new LazyStepResult(
              new YuChar(str[idx]),
              new LazyList(() => next(str, idx + 1)),
            ),
          );
        };
        return next(s, 1);
      });
      return new StepCommand(new YuArray([new YuChar(s[0]), tail]));
    }

    // lazy list case
    if (isLazyList(list)) {
      return new BindCommand(list.step(), (stepRes) => {
        if (stepRes.isNil) return new StepCommand(YuNil.getInstance());

        const stepResult = stepRes.asStepResult;
        if (!stepResult)
          throw new Error("PatternMatcher: step did not return StepResult");

        return new StepCommand(
          new YuArray([
            stepResult.head,
            stepResult.tail || YuNil.getInstance(),
          ]),
        );
      });
    }

    return new StepCommand(YuNil.getInstance());
  }

  visitConstructorPattern(node: ConstructorPattern): ExecutionCommand {
    const seq = this.value.asSequence;
    if (!(seq instanceof YuArray) || seq.items.length === 0)
      return boolean(false);
    const head = seq.at(0);
    if (!(head instanceof YuString) || head.toJSON() !== node.identifier.value)
      return boolean(false);

    const args = new YuArray(seq.items.slice(seq.index + 1));
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

    return new BindCommand(node.right.accept(innerMatcher), (res) => {
      const innerMatches = res instanceof YuBoolean && res.value;
      if (!innerMatches) return boolean(false);

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
      if (index >= node.elements.length)
        return boolean(false);

      const pattern = node.elements[index];
      const trialBindings: Bindings = [];
      const matcher = new PatternMatcher(this.value, trialBindings, this.ctx);

      return new BindCommand(pattern.accept(matcher), (res) => {
        const isMatch = res instanceof YuBoolean && res.value;
        if (isMatch) {
          this.bindings.push(...trialBindings);
          return boolean(true);
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
    return new FailCommand(
      new UnexpectedNode(node.constructor.name, "PatternMatcher"),
    );
  }
}
