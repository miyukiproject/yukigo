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
  PrimitiveValue,
  SymbolPrimitive,
  TuplePattern,
  UnionPattern,
  VariablePattern,
  Visitor,
  WildcardPattern,
} from "@yukigo/ast";
import { Bindings } from "../index.js";
import { InterpreterVisitor } from "./Visitor.js";

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
      return String(name.elements.map((elem) => elem.accept(this)));
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
    const head = node.head.accept(this);
    const tail = node.tail.accept(this);
    return `(${head}:${tail})`;
  }

  visitConstructorPattern(node: ConstructorPattern): string {
    const constr = node.constr;
    const args = node.patterns.map((pat) => pat.accept(this)).join(" ");
    return `${constr} ${args}`;
  }

  visitFunctorPattern(node: FunctorPattern): string {
    // Same as ConstructorPattern (alias)
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier.value, node.args)
    );
  }

  visitApplicationPattern(node: ApplicationPattern): string {
    // Same as FunctorPattern
    return this.visitConstructorPattern(
      new ConstructorPattern(node.symbol.value, node.args)
    );
  }

  visitAsPattern(node: AsPattern): string {
    const pattern = node.pattern.accept(this);
    const alias = node.alias.accept(this);
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
      if (!node.elements[i].accept(matcher)) {
        return false;
      }
    }
    return true;
  }

  visitListPattern(node: ListPattern): boolean {
    // Empty list pattern: []
    if (node.elements.length === 0) {
      if (Array.isArray(this.value)) {
        return this.value.length === 0;
      }
      if (isLazyList(this.value)) {
        const iter = this.value.generator();
        return iter.next().done; // true if empty
      }
      return false;
    }

    if (Array.isArray(this.value)) {
      if (this.value.length !== node.elements.length) return false;
      for (let i = 0; i < node.elements.length; i++) {
        const matcher = new PatternMatcher(this.value[i], this.bindings);
        if (!node.elements[i].accept(matcher)) {
          return false;
        }
      }
      return true;
    }
    if (isLazyList(this.value)) {
      // Realize the lazy list (with safety limit)
      const realized = this.realize(this.value);
      if (realized.length !== node.elements.length) return false;
      for (let i = 0; i < node.elements.length; i++) {
        const matcher = new PatternMatcher(realized[i], this.bindings);
        if (!node.elements[i].accept(matcher)) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  visitConsPattern(node: ConsPattern): boolean {
    //finite arrays
    if (Array.isArray(this.value)) {
      if (this.value.length === 0) return false;
      const headMatcher = new PatternMatcher(this.value[0], this.bindings);
      if (!node.head.accept(headMatcher)) return false;
      const tail = this.value.slice(1);
      const tailMatcher = new PatternMatcher(tail, this.bindings);
      return node.tail.accept(tailMatcher);
    }

    // LazyList
    if (isLazyList(this.value)) {
      const headIter = this.value.generator();
      const first = headIter.next();

      if (first.done) return false;

      const headMatcher = new PatternMatcher(first.value, this.bindings);
      if (!node.head.accept(headMatcher)) return false;

      const parentGeneratorFactory = this.value.generator;

      const tailGenerator = function* (): Generator<
        PrimitiveValue,
        void,
        unknown
      > {
        const freshIter = parentGeneratorFactory();
        freshIter.next();

        let next: IteratorResult<PrimitiveValue, void>;
        while (!(next = freshIter.next()).done) {
          yield next.value;
        }
      };

      const tailLazyList: LazyList = {
        type: "LazyList",
        generator: tailGenerator,
      };

      const tailMatcher = new PatternMatcher(tailLazyList, this.bindings);
      return node.tail.accept(tailMatcher);
    }

    return false;
  }

  visitConstructorPattern(node: ConstructorPattern): boolean {
    // Assume runtime representation: [constructorName, ...args]
    if (!Array.isArray(this.value) || this.value.length === 0) return false;
    if (this.value[0] !== node.constr) return false;

    const args = this.value.slice(1);
    if (args.length !== node.patterns.length) return false;

    for (let i = 0; i < node.patterns.length; i++) {
      const matcher = new PatternMatcher(args[i], this.bindings);
      if (!node.patterns[i].accept(matcher)) {
        return false;
      }
    }
    return true;
  }

  visitFunctorPattern(node: FunctorPattern): boolean {
    // Same as ConstructorPattern (alias)
    return this.visitConstructorPattern(
      new ConstructorPattern(node.identifier.value, node.args)
    );
  }

  visitApplicationPattern(node: ApplicationPattern): boolean {
    // Same as FunctorPattern
    return this.visitConstructorPattern(
      new ConstructorPattern(node.symbol.value, node.args)
    );
  }

  visitAsPattern(node: AsPattern): boolean {
    // First match the inner pattern
    const innerMatcher = new PatternMatcher(this.value, this.bindings);
    if (!node.pattern.accept(innerMatcher)) return false;

    // Then bind the alias
    const aliasMatcher = new PatternMatcher(this.value, this.bindings);
    return node.alias.accept(aliasMatcher);
  }

  visitUnionPattern(node: UnionPattern): boolean {
    // Try each pattern in order; succeed if any matches
    for (const pattern of node.patterns) {
      // Use a fresh bindings list for each attempt
      const trialBindings: Bindings = [];
      const matcher = new PatternMatcher(this.value, trialBindings);
      if (pattern.accept(matcher)) {
        // Commit the bindings
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
    return new InterpreterVisitor([new Map()], {}).realizeList(value);
  }
}
