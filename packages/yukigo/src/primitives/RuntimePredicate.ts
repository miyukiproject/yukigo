import { Fact, Rule, Visitor } from "yukigo-ast";
import { PrimitiveValue } from "./primitives.js";
import { InterpreterError } from "../interpreter/errors.js";

export class RuntimePredicate {
  public readonly arity: number;
  constructor(
    public identifier: string,
    public equations: (Fact | Rule)[],
  ) {
    if (equations.length === 0) {
      throw new InterpreterError(
        "RuntimePredicate",
        `Predicate "${identifier}" must have at least one clause.`,
      );
    }
    this.arity = this.getArityFromClause(equations[0]);
  }
  public apply<T>(visitor: Visitor<T>): T[] {
    return this.equations.map((clause) => clause.accept(visitor));
  }
  public addClause(clause: Fact | Rule) {
    const clauseArity = this.getArityFromClause(clause);
    if (!this.validateClause(clause)) {
      throw new InterpreterError(
        "RuntimePredicate",
        `Arity mismatch for "${this.identifier}": expected ${this.arity}, got ${clauseArity}.`,
      );
    }
    this.equations.push(clause);
  }
  private validateClause(clause: Fact | Rule): boolean {
    const clauseArity = this.getArityFromClause(clause);
    return this.validateArity(clauseArity);
  }
  public validateArity(args: number): boolean {
    return this.arity === args;
  }
  private getArityFromClause(clause: Fact | Rule): number {
    if (clause.is(Fact)) return clause.patterns.length;
    const patterns =
      clause.equations.length > 0 ? clause.equations[0].patterns : [];
    return patterns.length;
  }
  public toString() {
    return `[Predicate: ${this.identifier}/${this.arity}]`;
  }
}

export const isRuntimePredicate = (
  prim: PrimitiveValue,
): prim is RuntimePredicate => {
  return prim instanceof RuntimePredicate;
};
