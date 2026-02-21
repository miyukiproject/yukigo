import {
  EnvStack,
  Fact,
  FunctorPattern,
  ListPattern,
  LiteralPattern,
  Pattern,
  Rule,
  VariablePattern,
  WildcardPattern,
  isRuntimePredicate,
  UnguardedBody,
  Findall,
  ConsPattern,
  Equation,
  SymbolPrimitive,
  Goal,
  Exist,
  LogicConstraint,
  Sequence,
  Not,
  ComparisonOperation,
  UnifyOperation,
  ApplicationPattern,
  TuplePattern,
  ConstructorPattern,
  UnionPattern,
  AsPattern,
  PatternVisitor,
  TypePattern,
  AssignOperation,
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  ConsExpression,
  ListPrimitive,
  TupleExpression,
  If,
  Forall,
  Call,
  ListBinaryOperation,
  ListUnaryOperation,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
  StringOperation,
  NumberPrimitive,
  StringPrimitive,
  BooleanPrimitive,
  NilPrimitive,
  CharPrimitive,
  Visitor,
} from "yukigo-ast";
import { lookup } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { Thunk } from "../../trampoline.js";
import { LogicExecutable } from "./LogicEngine.js";

/**
 * A Substitution maps variable names to their bound patterns.
 */
export type Substitution = Map<string, Pattern>;

/**
 * Internal result of a logic operation.
 */
export type InternalLogicResult = { success: true; substs: Substitution };

/**
 * Backtracking continuations.
 */
export type SuccessCont = (
  substs: Substitution,
  next: () => Thunk<any>,
) => Thunk<any>;
export type FailureCont = () => Thunk<any>;

/**
 * A function that can solve a sequence of logic goals/expressions in CPS.
 */
export type BodySolverCPS = (
  expressions: LogicExecutable[],
  env: Substitution,
  onSuccess: SuccessCont,
  onFailure: FailureCont,
) => Thunk<any>;

/**
 * Creates a successful logic result.
 */
export function success(substs: Substitution): InternalLogicResult {
  return { success: true, substs };
}

/**
 * Unifies two patterns given an existing set of substitutions.
 * Returns the updated substitution map or null if unification fails.
 */
export function unify(
  t1: Pattern,
  t2: Pattern,
  argEnv?: Substitution,
): Substitution | null {
  const env: Substitution = argEnv ? new Map(argEnv) : new Map();
  return unifyInPlace(t1, t2, env) ? env : null;
}

/**
 * Internal unification that modifies the environment in place for efficiency during recursion.
 */
function unifyInPlace(t1: Pattern, t2: Pattern, env: Substitution): boolean {
  const r1 = resolve(t1, env);
  const r2 = resolve(t2, env);

  if (r1 === r2) return true;

  if (r1 instanceof WildcardPattern || r2 instanceof WildcardPattern) {
    return true;
  }

  if (r1 instanceof VariablePattern) {
    env.set(r1.name.value, r2);
    return true;
  }
  if (r2 instanceof VariablePattern) {
    env.set(r2.name.value, r1);
    return true;
  }

  if (r1 instanceof LiteralPattern && r2 instanceof LiteralPattern) {
    return r1.name.equals(r2.name);
  }

  if (r1 instanceof FunctorPattern && r2 instanceof FunctorPattern) {
    if (r1.identifier.value !== r2.identifier.value) return false;
    if (r1.args.length !== r2.args.length) return false;

    for (let i = 0; i < r1.args.length; i++) {
      if (!unifyInPlace(r1.args[i], r2.args[i], env)) return false;
    }
    return true;
  }

  if (r1 instanceof ListPattern && r2 instanceof ListPattern) {
    if (r1.elements.length !== r2.elements.length) return false;
    for (let i = 0; i < r1.elements.length; i++) {
      if (!unifyInPlace(r1.elements[i], r2.elements[i], env)) return false;
    }
    return true;
  }

  if (r1 instanceof ConsPattern && r2 instanceof ConsPattern) {
    let curr1: Pattern = r1;
    let curr2: Pattern = r2;

    while (curr1 instanceof ConsPattern && curr2 instanceof ConsPattern) {
      if (!unifyInPlace(curr1.left, curr2.left, env)) return false;
      curr1 = resolve(curr1.right, env);
      curr2 = resolve(curr2.right, env);
    }
    return unifyInPlace(curr1, curr2, env);
  }

  if (r1 instanceof ConsPattern && r2 instanceof ListPattern) {
    if (r2.elements.length === 0) return false;
    const [head, ...tail] = r2.elements;
    return (
      unifyInPlace(r1.left, head, env) &&
      unifyInPlace(r1.right, new ListPattern(tail), env)
    );
  }

  if (r1 instanceof ListPattern && r2 instanceof ConsPattern) {
    if (r1.elements.length === 0) return false;
    const [head, ...tail] = r1.elements;
    return (
      unifyInPlace(head, r2.left, env) &&
      unifyInPlace(new ListPattern(tail), r2.right, env)
    );
  }

  return false;
}

/**
 * Follows variable bindings in the substitution map until a non-variable or unbound variable is found.
 */
export function resolve(node: Pattern, env: Substitution): Pattern {
  let current = node;
  const seen = new Set<string>();
  while (current instanceof VariablePattern) {
    const name = current.name.value;
    if (seen.has(name)) break;
    seen.add(name);
    const bound = env.get(name);
    if (!bound) break;
    current = bound;
  }
  return current;
}

class Instantiator implements PatternVisitor<Pattern> {
  constructor(
    private substs: Substitution,
    private seen: Set<string> = new Set(),
  ) {}

  visitVariablePattern(node: VariablePattern): Pattern {
    const name = node.name.value;
    if (this.seen.has(name)) return node;
    const val = this.substs.get(name);
    if (val) {
      const nextSeen = new Set(this.seen);
      nextSeen.add(name);
      return new Instantiator(this.substs, nextSeen).instantiate(val);
    }
    return node;
  }

  visitLiteralPattern(node: LiteralPattern): Pattern {
    return node;
  }

  visitApplicationPattern(node: ApplicationPattern): Pattern {
    return new ApplicationPattern(
      node.identifier,
      node.args.map((arg) => this.instantiate(arg)),
      node.loc,
    );
  }

  visitTuplePattern(node: TuplePattern): Pattern {
    return new TuplePattern(
      node.elements.map((el) => this.instantiate(el)),
      node.loc,
    );
  }

  visitListPattern(node: ListPattern): Pattern {
    return new ListPattern(
      node.elements.map((el) => this.instantiate(el)),
      node.loc,
    );
  }

  visitFunctorPattern(node: FunctorPattern): Pattern {
    return new FunctorPattern(
      node.identifier,
      node.args.map((arg) => this.instantiate(arg)),
      node.loc,
    );
  }

  visitAsPattern(node: AsPattern): Pattern {
    return new AsPattern(
      this.instantiate(node.left) as any,
      this.instantiate(node.right),
      node.loc,
    );
  }

  visitWildcardPattern(node: WildcardPattern): Pattern {
    return node;
  }

  visitUnionPattern(node: UnionPattern): Pattern {
    return new UnionPattern(
      node.elements.map((el) => this.instantiate(el)),
      node.loc,
    );
  }

  visitConstructorPattern(node: ConstructorPattern): Pattern {
    return new ConstructorPattern(
      node.identifier,
      node.args.map((arg) => this.instantiate(arg)),
      node.loc,
    );
  }

  visitConsPattern(node: ConsPattern): Pattern {
    return new ConsPattern(
      this.instantiate(node.left),
      this.instantiate(node.right),
      node.loc,
    );
  }

  visitTypePattern(node: TypePattern): Pattern {
    return new TypePattern(
      node.targetType,
      node.innerPattern ? this.instantiate(node.innerPattern) : undefined,
      node.loc,
    );
  }

  instantiate(pattern: Pattern): Pattern {
    return pattern.accept(this);
  }
}

/**
 * Fully instantiates a pattern by replacing all bound variables with their values.
 */
export function instantiate(
  pattern: Pattern,
  substs: Substitution,
  seen: Set<string> = new Set(),
): Pattern {
  return new Instantiator(substs, seen).instantiate(pattern);
}

let variableCounter = 0;

class LogicVariableRenamer implements PatternVisitor<Pattern> {
  constructor(
    private renames: Map<string, string>,
    private freshId: number,
  ) {}

  public rename(node: any): any {
    if (!node || typeof node !== "object") return node;
    if (typeof node.accept === "function") {
      return node.accept(this);
    }
    return node;
  }

  // PatternVisitor
  visitVariablePattern(node: VariablePattern): Pattern {
    const name = node.name.value;
    let newName = this.renames.get(name);
    if (!newName) {
      newName = `${name}_${this.freshId}`;
      this.renames.set(name, newName);
    }
    return new VariablePattern(new SymbolPrimitive(newName), node.loc);
  }

  visitLiteralPattern(node: LiteralPattern): Pattern {
    return node;
  }

  visitApplicationPattern(node: ApplicationPattern): Pattern {
    return new ApplicationPattern(
      node.identifier,
      node.args.map((arg) => this.rename(arg)),
      node.loc,
    );
  }

  visitTuplePattern(node: TuplePattern): Pattern {
    return new TuplePattern(
      node.elements.map((el) => this.rename(el)),
      node.loc,
    );
  }

  visitListPattern(node: ListPattern): Pattern {
    return new ListPattern(
      node.elements.map((el) => this.rename(el)),
      node.loc,
    );
  }

  visitFunctorPattern(node: FunctorPattern): Pattern {
    return new FunctorPattern(
      node.identifier,
      node.args.map((arg) => this.rename(arg)),
      node.loc,
    );
  }

  visitAsPattern(node: AsPattern): Pattern {
    return new AsPattern(
      this.rename(node.left) as any,
      this.rename(node.right),
      node.loc,
    );
  }

  visitWildcardPattern(node: WildcardPattern): Pattern {
    return node;
  }

  visitUnionPattern(node: UnionPattern): Pattern {
    return new UnionPattern(
      node.elements.map((el) => this.rename(el)),
      node.loc,
    );
  }

  visitConstructorPattern(node: ConstructorPattern): Pattern {
    return new ConstructorPattern(
      node.identifier,
      node.args.map((arg) => this.rename(arg)),
      node.loc,
    );
  }

  visitConsPattern(node: ConsPattern): Pattern {
    return new ConsPattern(
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitTypePattern(node: TypePattern): Pattern {
    return new TypePattern(
      node.targetType,
      node.innerPattern ? this.rename(node.innerPattern) : undefined,
      node.loc,
    );
  }

  // Expression/Statement Visitor
  visitSymbolPrimitive(node: SymbolPrimitive): any {
    const name = node.value;
    if (/^[A-Z_]/.test(name) && name !== "_") {
      let newName = this.renames.get(name);
      if (!newName) {
        newName = `${name}_${this.freshId}`;
        this.renames.set(name, newName);
      }
      return new SymbolPrimitive(newName, node.loc);
    }
    return node;
  }

  visitNumberPrimitive(node: NumberPrimitive): any {
    return node;
  }
  visitStringPrimitive(node: StringPrimitive): any {
    return node;
  }
  visitBooleanPrimitive(node: BooleanPrimitive): any {
    return node;
  }
  visitNilPrimitive(node: NilPrimitive): any {
    return node;
  }
  visitCharPrimitive(node: CharPrimitive): any {
    return node;
  }

  visitGoal(node: Goal): any {
    return new Goal(
      node.identifier,
      node.args.map((arg) => this.rename(arg)),
      node.loc,
    );
  }

  visitExist(node: Exist): any {
    return new Exist(
      node.identifier,
      node.patterns.map((pat) => this.rename(pat)),
      node.loc,
    );
  }

  visitFindall(node: Findall): any {
    return new Findall(
      this.rename(node.template),
      this.rename(node.goal),
      this.rename(node.bag),
      node.loc,
    );
  }

  visitForall(node: Forall): any {
    return new Forall(this.rename(node.condition), this.rename(node.action), node.loc);
  }

  visitCall(node: Call): any {
    return new Call(
      this.rename(node.callee),
      node.args.map((arg) => this.rename(arg)),
      node.loc,
    );
  }

  visitNot(node: Not): any {
    return new Not(this.rename(node.expression), node.loc);
  }

  visitLogicConstraint(node: LogicConstraint): any {
    return new LogicConstraint(this.rename(node.expression), node.loc);
  }

  visitSequence(node: Sequence): any {
    return new Sequence(
      node.statements.map((stmt) => this.rename(stmt)),
      node.loc,
    );
  }

  visitIf(node: If): any {
    return new If(
      this.rename(node.condition),
      this.rename(node.then),
      this.rename(node.elseExpr),
      node.loc,
    );
  }

  visitComparisonOperation(node: ComparisonOperation): any {
    return new ComparisonOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitUnifyOperation(node: UnifyOperation): any {
    return new UnifyOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitAssignOperation(node: AssignOperation): any {
    return new AssignOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitArithmeticBinaryOperation(node: ArithmeticBinaryOperation): any {
    return new ArithmeticBinaryOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): any {
    return new ArithmeticUnaryOperation(
      node.operator,
      this.rename(node.operand),
      node.loc,
    );
  }

  visitListBinaryOperation(node: ListBinaryOperation): any {
    return new ListBinaryOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): any {
    return new ListUnaryOperation(
      node.operator,
      this.rename(node.operand),
      node.loc,
    );
  }

  visitLogicalBinaryOperation(node: LogicalBinaryOperation): any {
    return new LogicalBinaryOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitLogicalUnaryOperation(node: LogicalUnaryOperation): any {
    return new LogicalUnaryOperation(
      node.operator,
      this.rename(node.operand),
      node.loc,
    );
  }

  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): any {
    return new BitwiseBinaryOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): any {
    return new BitwiseUnaryOperation(
      node.operator,
      this.rename(node.operand),
      node.loc,
    );
  }

  visitStringOperation(node: StringOperation): any {
    return new StringOperation(
      node.operator,
      this.rename(node.left),
      this.rename(node.right),
      node.loc,
    );
  }

  visitConsExpression(node: ConsExpression): any {
    return new ConsExpression(
      this.rename(node.head),
      this.rename(node.tail),
      node.loc,
    );
  }

  visitListPrimitive(node: ListPrimitive): any {
    return new ListPrimitive(
      node.value.map((el) => this.rename(el)),
      node.loc,
    );
  }

  visitTupleExpr(node: TupleExpression): any {
    return new TupleExpression(
      node.elements.map((el) => this.rename(el)),
      node.loc,
    );
  }
}

/**
 * Renames all variables in a Rule or Fact to fresh names to avoid name clashes during unification.
 */
export function renameVariables<T extends Rule | Fact>(clause: T): T {
  const renames = new Map<string, string>();
  const freshId = ++variableCounter;
  const renamer = new LogicVariableRenamer(renames, freshId);

  if (clause instanceof Fact) {
    return new Fact(
      clause.identifier,
      clause.patterns.map((p) => renamer.rename(p)),
      clause.loc,
    ) as T;
  }

  if (clause instanceof Rule) {
    const renamedEquations = clause.equations.map((eq) => {
      let renamedBody = eq.body;
      if (eq.body instanceof UnguardedBody) {
        renamedBody = new UnguardedBody(
          new Sequence(
            eq.body.sequence.statements.map((stmt) => renamer.rename(stmt)),
            eq.body.sequence.loc,
          ),
          eq.body.loc,
        );
      }
      return new Equation(
        eq.patterns.map((p) => renamer.rename(p)),
        renamedBody,
        eq.returnExpr,
        eq.loc,
      );
    });
    return new Rule(clause.identifier, renamedEquations, clause.loc) as T;
  }

  return clause;
}

/**
 * Solves a single logic goal (predicate call) using CPS.
 */
export function solveGoalCPS(
  envs: EnvStack,
  predicateName: string,
  args: Pattern[],
  solveBody: BodySolverCPS,
  baseSubst: Substitution,
  onSuccess: SuccessCont,
  onFailure: FailureCont,
): Thunk<any> {
  const pred = lookup(envs, predicateName);
  if (!pred || !isRuntimePredicate(pred)) return () => onFailure();

  const tryClause = (index: number): Thunk<any> => {
    if (index >= pred.equations.length) return () => onFailure();

    const clause = pred.equations[index];

    const arity =
      clause instanceof Fact
        ? clause.patterns.length
        : clause.equations[0].patterns.length;

    if (arity !== args.length) return () => tryClause(index + 1);

    if (clause instanceof Fact) {
      const renamedFact = renameVariables(clause);
      const substs = unifyParameters(renamedFact.patterns, args, baseSubst);
      if (substs) {
        return onSuccess(substs, () => tryClause(index + 1));
      }
      return () => tryClause(index + 1);
    }

    if (clause instanceof Rule) {
      const renamedRule = renameVariables(clause);
      const tryRuleEq = (eqIndex: number): Thunk<any> => {
        if (eqIndex >= renamedRule.equations.length)
          return () => tryClause(index + 1);
        const eq = renamedRule.equations[eqIndex];
        const substs = unifyParameters(eq.patterns, args, baseSubst);
        if (!substs) return () => tryRuleEq(eqIndex + 1);

        if (eq.body instanceof UnguardedBody) {
          return solveBody(eq.body.sequence.statements, substs, onSuccess, () =>
            tryRuleEq(eqIndex + 1),
          );
        }
        // TODO: Handle GuardedBody
        return () => tryRuleEq(eqIndex + 1);
      };
      return () => tryRuleEq(0);
    }

    throw new InterpreterError("solveGoal", `Unexpected clause type ${clause}`);
  };

  return () => tryClause(0);
}

/**
 * Unifies two lists of parameters. Returns the resulting Substitution or null.
 */
function unifyParameters(
  patterns: Pattern[],
  args: Pattern[],
  baseSubst: Substitution,
): Substitution | null {
  let subst: Substitution = new Map(baseSubst);
  for (let i = 0; i < patterns.length; i++) {
    const nextSubst = unify(patterns[i], args[i], subst);
    if (!nextSubst) return null;
    subst = nextSubst;
  }
  return subst;
}

/**
 * Solves a findall/3 goal using CPS.
 */
export function solveFindallCPS(
  node: Findall,
  currentSubsts: Substitution,
  solveBody: BodySolverCPS,
  onSuccess: SuccessCont,
  onFailure: FailureCont,
): Thunk<any> {
  const gathered: Pattern[] = [];

  const collectResults = (): Thunk<any> => {
    return solveBody(
      [node.goal],
      currentSubsts,
      (resultSubsts, next) => {
        gathered.push(instantiate(node.template, resultSubsts));
        return () => next();
      },
      () => {
        const resultList = new ListPattern(gathered);
        const finalSubsts = unify(node.bag, resultList, currentSubsts);
        if (finalSubsts) {
          return onSuccess(finalSubsts, onFailure);
        }
        return () => onFailure();
      },
    );
  };

  return collectResults();
}
