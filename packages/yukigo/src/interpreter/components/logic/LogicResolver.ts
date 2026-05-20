import { YukigoKernel } from "../kernel/index.js";
import {
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
  BooleanPrimitive,
  NilPrimitive,
  CharPrimitive,
  StringPrimitive,
  Visitor,
  isUnguardedBody,
  GuardedBody,
  ASTNode,
  Expression,
  Statement,
  PrimitiveValue,
  TupleExpression,
} from "yukigo-ast";
import { LogicExecutable } from "./LogicEngine.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { UnexpectedNode, InterpreterError } from "../../errors.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
  FailCommand,
  ChoiceCommand,
} from "../kernel/commands.js";
import { Evaluator } from "../../utils.js";
import { LogicTranslator } from "./LogicTranslator.js";

/**
 * A Substitution maps variable names to their bound patterns.
 */
export type Substitution = Map<string, Pattern>;

/**
 * Result of a single step in the logic resolution.
 */
export interface LogicStepResult {
  success: boolean;
  solutions: Substitution;
}

/**
 * Type guard for LogicStepResult.
 */
export function isLogicStepResult(obj: unknown): obj is LogicStepResult {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "success" in obj &&
    "solutions" in obj &&
    (obj as any).solutions instanceof Map
  );
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
      this.instantiate(node.left) as VariablePattern,
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

  public fallback(node: ASTNode): Pattern {
    throw new InterpreterError(
      "Instantiator",
      `${node.constructor.name} not expected.`,
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

class LogicVariableRenamer implements Visitor<ASTNode> {
  constructor(
    private renames: Map<string, string>,
    private freshId: number,
  ) {}

  public rename(node: ASTNode): ASTNode {
    return node.accept(this);
  }

  visitFact(node: Fact): Fact {
    return new Fact(
      node.identifier,
      node.patterns.map((p) => this.rename(p) as Pattern),
      node.loc,
    );
  }

  visitRule(node: Rule): Rule {
    const renamedEquations = node.equations.map((eq) => {
      const body = eq.body;
      if (!isUnguardedBody(body))
        throw new InterpreterError(
          "Logic",
          "GuardedBody renaming not implemented",
        );
      return new Equation(
        eq.patterns.map((p) => this.rename(p) as Pattern),
        this.rename(body) as UnguardedBody,
        eq.returnExpr,
        eq.loc,
      );
    });
    return new Rule(node.identifier, renamedEquations, node.loc);
  }

  visitUnguardedBody(node: UnguardedBody): UnguardedBody {
    return new UnguardedBody(
      new Sequence(
        node.sequence.statements.map((stmt) => this.rename(stmt) as Statement),
        node.sequence.loc,
      ),
      node.loc,
    );
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
      node.args.map((arg) => this.rename(arg) as Pattern),
      node.loc,
    );
  }

  visitTuplePattern(node: TuplePattern): Pattern {
    return new TuplePattern(
      node.elements.map((el) => this.rename(el) as Pattern),
      node.loc,
    );
  }

  visitListPattern(node: ListPattern): Pattern {
    return new ListPattern(
      node.elements.map((el) => this.rename(el) as Pattern),
      node.loc,
    );
  }

  visitFunctorPattern(node: FunctorPattern): Pattern {
    return new FunctorPattern(
      node.identifier,
      node.args.map((arg) => this.rename(arg) as Pattern),
      node.loc,
    );
  }

  visitAsPattern(node: AsPattern): Pattern {
    return new AsPattern(
      this.rename(node.left) as VariablePattern,
      this.rename(node.right) as Pattern,
      node.loc,
    );
  }

  visitWildcardPattern(node: WildcardPattern): Pattern {
    return node;
  }

  visitUnionPattern(node: UnionPattern): Pattern {
    return new UnionPattern(
      node.elements.map((el) => this.rename(el) as Pattern),
      node.loc,
    );
  }

  visitConstructorPattern(node: ConstructorPattern): Pattern {
    return new ConstructorPattern(
      node.identifier,
      node.args.map((arg) => this.rename(arg) as Pattern),
      node.loc,
    );
  }

  visitConsPattern(node: ConsPattern): Pattern {
    return new ConsPattern(
      this.rename(node.left) as Pattern,
      this.rename(node.right) as Pattern,
      node.loc,
    );
  }

  visitTypePattern(node: TypePattern): Pattern {
    return new TypePattern(
      node.targetType,
      node.innerPattern
        ? (this.rename(node.innerPattern) as Pattern)
        : undefined,
      node.loc,
    );
  }

  // Expression/Statement Visitor
  visitSymbolPrimitive(node: SymbolPrimitive): SymbolPrimitive {
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

  visitNumberPrimitive(node: NumberPrimitive): NumberPrimitive {
    return node;
  }
  visitBooleanPrimitive(node: BooleanPrimitive): BooleanPrimitive {
    return node;
  }
  visitNilPrimitive(node: NilPrimitive): NilPrimitive {
    return node;
  }
  visitCharPrimitive(node: CharPrimitive): CharPrimitive {
    return node;
  }
  visitStringPrimitive(node: StringPrimitive): StringPrimitive {
    return node;
  }

  visitGoal(node: Goal): Goal {
    return new Goal(
      node.identifier,
      node.args.map((arg) => this.rename(arg) as Pattern),
      node.loc,
    );
  }

  visitExist(node: Exist): Exist {
    return new Exist(
      node.identifier,
      node.patterns.map((pat) => this.rename(pat) as Pattern),
      node.loc,
    );
  }

  visitFindall(node: Findall): Findall {
    return new Findall(
      this.rename(node.template) as Pattern,
      this.rename(node.goal) as Pattern,
      this.rename(node.bag) as Pattern,
      node.loc,
    );
  }

  visitForall(node: Forall): Forall {
    return new Forall(
      this.rename(node.condition) as Pattern,
      this.rename(node.action) as Pattern,
      node.loc,
    );
  }

  visitCall(node: Call): Call {
    return new Call(
      this.rename(node.callee) as SymbolPrimitive,
      node.args.map((arg) => this.rename(arg) as Pattern),
      node.loc,
    );
  }

  visitNot(node: Not): Not {
    return new Not(this.rename(node.expression) as Expression, node.loc);
  }

  visitLogicConstraint(node: LogicConstraint): LogicConstraint {
    return new LogicConstraint(
      this.rename(node.expression) as Expression,
      node.loc,
    );
  }

  visitSequence(node: Sequence): Sequence {
    return new Sequence(
      node.statements.map((stmt) => this.rename(stmt) as Statement),
      node.loc,
    );
  }

  visitIf(node: If): If {
    return new If(
      this.rename(node.condition) as Expression,
      this.rename(node.then) as Expression,
      this.rename(node.elseExpr) as Expression,
      node.loc,
    );
  }

  visitComparisonOperation(node: ComparisonOperation): ComparisonOperation {
    return new ComparisonOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitUnifyOperation(node: UnifyOperation): UnifyOperation {
    return new UnifyOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitAssignOperation(node: AssignOperation): AssignOperation {
    return new AssignOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation,
  ): ArithmeticBinaryOperation {
    return new ArithmeticBinaryOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitArithmeticUnaryOperation(
    node: ArithmeticUnaryOperation,
  ): ArithmeticUnaryOperation {
    return new ArithmeticUnaryOperation(
      node.operator,
      this.rename(node.operand) as Expression,
      node.loc,
    );
  }

  visitListBinaryOperation(node: ListBinaryOperation): ListBinaryOperation {
    return new ListBinaryOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitListUnaryOperation(node: ListUnaryOperation): ListUnaryOperation {
    return new ListUnaryOperation(
      node.operator,
      this.rename(node.operand) as Expression,
      node.loc,
    );
  }

  visitLogicalBinaryOperation(
    node: LogicalBinaryOperation,
  ): LogicalBinaryOperation {
    return new LogicalBinaryOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitLogicalUnaryOperation(
    node: LogicalUnaryOperation,
  ): LogicalUnaryOperation {
    return new LogicalUnaryOperation(
      node.operator,
      this.rename(node.operand) as Expression,
      node.loc,
    );
  }

  visitBitwiseBinaryOperation(
    node: BitwiseBinaryOperation,
  ): BitwiseBinaryOperation {
    return new BitwiseBinaryOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitBitwiseUnaryOperation(
    node: BitwiseUnaryOperation,
  ): BitwiseUnaryOperation {
    return new BitwiseUnaryOperation(
      node.operator,
      this.rename(node.operand) as Expression,
      node.loc,
    );
  }

  visitStringOperation(node: StringOperation): StringOperation {
    return new StringOperation(
      node.operator,
      this.rename(node.left) as Expression,
      this.rename(node.right) as Expression,
      node.loc,
    );
  }

  visitConsExpression(node: ConsExpression): ConsExpression {
    return new ConsExpression(
      this.rename(node.head) as Expression,
      this.rename(node.tail) as Expression,
      node.loc,
    );
  }

  visitListPrimitive(node: ListPrimitive): ListPrimitive {
    return new ListPrimitive(
      node.value.map((el) => this.rename(el) as Expression),
      node.loc,
    );
  }

  visitTupleExpr(node: TupleExpression): TupleExpression {
    return new TupleExpression(
      node.elements.map((el) => this.rename(el)),
      node.loc,
    );
  }

  public fallback(node: ASTNode): ASTNode {
    throw new InterpreterError(
      "LogicVariableRenamer",
      `${node.constructor.name} not expected.`,
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
  return clause.accept(renamer) as T;
}

class KernelBodyVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private readonly solveBody: (
      expressions: LogicExecutable[],
      env: Substitution,
    ) => ExecutionCommand,
    private readonly substs: Substitution,
  ) {}

  public visitUnguardedBody(body: UnguardedBody): ExecutionCommand {
    return this.solveBody(body.sequence.statements, this.substs);
  }

  public visitGuardedBody(body: GuardedBody): ExecutionCommand {
    return new BindCommand(
      this.solveBody([body.condition], this.substs),
      (res: unknown) => {
        if (isLogicStepResult(res) && res.success) {
          return this.solveBody([body.body], res.solutions);
        }
        return new FailCommand(
          new InterpreterError("Logic", "Guard failed"),
          true,
        );
      },
    );
  }

  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new InterpreterError(
        "Logic",
        `Unexpected node ${node.constructor.name} in equation body`,
      ),
    );
  }
}

class GoalKernelVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private readonly args: Pattern[],
    private readonly baseSubst: Substitution,
    private readonly solveBody: (
      expressions: LogicExecutable[],
      env: Substitution,
    ) => ExecutionCommand,
  ) {}

  public visitFact(fact: Fact): ExecutionCommand {
    if (fact.patterns.length !== this.args.length)
      return new FailCommand(
        new InterpreterError("Logic", "Arity mismatch"),
        true,
      );

    const renamedFact = renameVariables(fact);
    const substs = unifyParameters(
      renamedFact.patterns,
      this.args,
      this.baseSubst,
    );

    if (substs) {
      const res: LogicStepResult = { success: true, solutions: substs };
      return new StepCommand(res as unknown as PrimitiveValue);
    }
    return new FailCommand(
      new InterpreterError("Logic", "Fact unification failed"),
      true,
    );
  }

  public visitRule(rule: Rule): ExecutionCommand {
    if (rule.equations.length === 0)
      return new FailCommand(
        new InterpreterError("Logic", "Rule has no equations"),
        true,
      );

    const arity = rule.equations[0].patterns.length;
    if (arity !== this.args.length)
      return new FailCommand(
        new InterpreterError("Logic", "Arity mismatch"),
        true,
      );

    const renamedRule = renameVariables(rule);

    const alternatives: ExecutionCommand[] = [];

    for (const eq of renamedRule.equations) {
      const substs = unifyParameters(eq.patterns, this.args, this.baseSubst);
      if (substs) {
        const bodyVisitor = new KernelBodyVisitor(this.solveBody, substs);

        if (isUnguardedBody(eq.body)) {
          alternatives.push(eq.body.accept(bodyVisitor));
        } else {
          const branches = (eq.body as GuardedBody[]).map((b) =>
            b.accept(bodyVisitor),
          );
          alternatives.push(new ChoiceCommand(branches));
        }
      }
    }

    if (alternatives.length === 0)
      return new FailCommand(
        new InterpreterError("Logic", "Clause head mismatch"),
        true,
      );
    return alternatives.length === 1
      ? alternatives[0]
      : new ChoiceCommand(alternatives);
  }

  public fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new InterpreterError(
        "Logic",
        `Unexpected node ${node.constructor.name} in predicate definition`,
      ),
    );
  }
}

/**
 * Solves a single logic goal (predicate call) using the Kernel.
 */
export function solveGoalKernel(
  ctx: RuntimeContext,
  predicateName: string,
  args: Pattern[],
  solveBody: (
    expressions: LogicExecutable[],
    env: Substitution,
  ) => ExecutionCommand,
  baseSubst: Substitution,
): ExecutionCommand {
  let equations: (Rule | Fact)[];

  try {
    const pred = ctx.lookup(predicateName);
    if (!pred || !isRuntimePredicate(pred))
      return new FailCommand(
        new InterpreterError("Logic", `Predicate ${predicateName} not found`),
        true,
      );
    equations = pred.equations;
  } catch (error) {
    return new FailCommand(
      new InterpreterError("Logic", `Predicate ${predicateName} lookup error`),
      true,
    );
  }

  const clauseVisitor = new GoalKernelVisitor(args, baseSubst, solveBody);

  const choices: ExecutionCommand[] = [];
  for (const clause of equations) {
    const res = clause.accept(clauseVisitor);
    // We only add to choices if it's NOT an immediate logic failure
    if (!(res instanceof FailCommand && res.isLogicFailure)) {
      choices.push(res);
    }
  }

  if (choices.length === 0)
    return new FailCommand(
      new InterpreterError("Logic", "Goal failed (no matching clauses)"),
      true,
    );
  return choices.length === 1 ? choices[0] : new ChoiceCommand(choices);
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
 * Solves a findall/3 goal using the Kernel.
 */
export function solveFindallKernel(
  node: Findall,
  currentSubsts: Substitution,
  evaluator: Evaluator,
  ctx: RuntimeContext,
  solveBody: (
    expressions: LogicExecutable[],
    env: Substitution,
  ) => ExecutionCommand,
): ExecutionCommand {
  const gathered: Pattern[] = [];
  const kernel = new YukigoKernel(evaluator);

  let nextCmd = solveBody([node.goal], currentSubsts);

  while (true) {
    const res: unknown = kernel.run(nextCmd);
    if (isLogicStepResult(res) && res.success) {
      gathered.push(instantiate(node.template, res.solutions));
      nextCmd = kernel.handleBacktrack();
    } else {
      break;
    }
  }

  const resultList = new ListPattern(gathered);
  const finalSubsts = unify(node.bag, resultList, currentSubsts);
  if (finalSubsts) {
    const res: LogicStepResult = {
      success: true,
      solutions: finalSubsts,
    };
    let bagVarName: string;
    if (node.bag instanceof VariablePattern) {
      bagVarName = node.bag.name.value;
    } else {
      return new FailCommand(
        new InterpreterError("Logic", "Findall bag must be a Pattern"),
      );
    }

    const pat = finalSubsts.get(bagVarName);
    if (!pat)
      return new FailCommand(
        new InterpreterError("Logic", "Findall bag not found in results"),
      );
    const translator = new LogicTranslator(evaluator, ctx);
    const val = translator.patternToPrimitive(pat, finalSubsts);
    return new StepCommand(val);
  }
  return new FailCommand(
    new InterpreterError("Logic", "Findall bag unification failed"),
    true,
  );
}
