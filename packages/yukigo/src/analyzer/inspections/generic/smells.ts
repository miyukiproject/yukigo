import {
  Application,
  ASTNode,
  BooleanPrimitive,
  Call,
  Catch,
  Equation,
  Expression,
  Function,
  If,
  LogicalBinaryOperation,
  NilPrimitive,
  Print,
  Return,
  Sequence,
  StopTraversalException,
  SymbolPrimitive,
  Variable,
  VariablePattern,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";

function isSequenceEmpty(node: Expression): boolean {
  return node instanceof Sequence && node.statements.length === 0;
}

/**
 * Basic Levenshtein distance for typo detection
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

@AutoScoped
export class DiscardsExceptions extends ScopedVisitor {
  visitCatch(node: Catch): void {
    if (
      !node.body ||
      node.body instanceof NilPrimitive ||
      isSequenceEmpty(node.body)
    ) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class DoesConsolePrint extends ScopedVisitor {
  visitPrint(node: Print): void {
    throw new StopTraversalException();
  }

  visitCall(node: Call): void {
    const name = node.callee.value;
    if (this.isPrintFunc(name)) throw new StopTraversalException();
  }

  visitApplication(node: Application): void {
    const func = node.functionExpr;
    if (!(func instanceof SymbolPrimitive)) return func.accept(this);
    const name = func.value;
    if (this.isPrintFunc(name)) throw new StopTraversalException();
  }
  private isPrintFunc(name: string): boolean {
    const printFuncs = [
      "print",
      "println",
      "puts",
      "log",
      "console.log",
      "System.out.println",
      "fmt.Println",
    ];
    if (printFuncs.includes(name)) return true;
    return false;
  }
}

@AutoScoped
export class HasDeclarationTypos extends ScopedVisitor {
  /*
   * Checks if two variables declared in the same scope are suspiciously similar
   * (Levenshtein distance <= 2), indicating a possible typo (e.g., 'count' vs 'conut').
   */
  visitSequence(node: Sequence): void {
    const declaredNames: string[] = [];

    for (const stmt of node.statements) {
      if (stmt instanceof Variable) declaredNames.push(stmt.identifier.value);
    }

    for (let i = 0; i < declaredNames.length; i++) {
      for (let j = i + 1; j < declaredNames.length; j++) {
        const a = declaredNames[i];
        const b = declaredNames[j];
        if (a.length > 3 && b.length > 3) {
          if (getLevenshteinDistance(a, b) <= 2) {
            throw new StopTraversalException();
          }
        }
      }
    }
  }
}

@AutoScoped
export class HasEmptyIfBranches extends ScopedVisitor {
  visitIf(node: If): void {
    const isThenEmpty = !node.then || isSequenceEmpty(node.then);
    const isElseEmpty = node.elseExpr && isSequenceEmpty(node.elseExpr);
    if (isThenEmpty || isElseEmpty) throw new StopTraversalException();
  }
}

@AutoScoped
export class HasLongParameterList extends ScopedVisitor {
  private readonly maxParams: number;

  constructor(maxParams: number = 5, scope?: string) {
    super(scope);
    this.maxParams = Number(maxParams);
  }

  visitEquation(node: Equation): void {
    const params = node.patterns;
    if (params.length > this.maxParams) throw new StopTraversalException();
  }
}

@AutoScoped
export class HasMisspelledIdentifiers extends ScopedVisitor {
  private readonly dictionary: Set<string>;

  constructor(dictionaryWords: string[] = [], scope?: string) {
    super(scope);
    // In a real app, load a standard dictionary + jargon here
    this.dictionary = new Set(dictionaryWords.map((w) => w.toLowerCase()));
  }

  visitVariable(node: Variable): void {
    this.checkSpelling(node.identifier.value);
  }

  visitFunction(node: Function): void {
    this.checkSpelling(node.identifier.value);
  }

  private checkSpelling(word: string): void {
    // Skip if no dictionary provided or word is very short
    if (this.dictionary.size === 0 || word.length < 3) return;

    // Naive camelCase splitter
    const parts = word.split(/(?=[A-Z])|[-_]/);

    for (const part of parts) {
      if (!this.dictionary.has(part.toLowerCase()))
        throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class HasRedundantBooleanComparison extends ScopedVisitor {
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): void {
    const isLeftBool = node.left instanceof BooleanPrimitive;
    const isRightBool = node.right instanceof BooleanPrimitive;
    if (isLeftBool || isRightBool) throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantIf extends ScopedVisitor {
  visitIf(node: If): void {
    if (node.elseExpr) {
      const thenStmt = node.then;
      const elseStmt = node.elseExpr;

      if (thenStmt instanceof Sequence && elseStmt instanceof Sequence) {
        // Check if returning booleans
        if (
          thenStmt.statements.some(
            (stmt) => stmt instanceof BooleanPrimitive
          ) &&
          elseStmt.statements.some((stmt) => stmt instanceof BooleanPrimitive)
        ) {
          throw new StopTraversalException();
        }
      }
    }
  }
}

@AutoScoped
export class HasRedundantLocalVariableReturn extends ScopedVisitor {
  /*
   * Detects:
   * var x = something;
   * return x;
   */
  visitSequence(node: Sequence): void {
    const stmts = node.statements;
    for (let i = 0; i < stmts.length - 1; i++) {
      const stmt = stmts[i];
      const nextStmt = stmts[i + 1];

      if (stmt instanceof Variable && nextStmt instanceof Return) {
        if (
          nextStmt.body instanceof SymbolPrimitive &&
          nextStmt.body.value === stmt.identifier.value
        ) {
          throw new StopTraversalException();
        }
      }
    }
  }
}

@AutoScoped
export class HasTooShortIdentifiers extends ScopedVisitor {
  private readonly minLength: number;

  constructor(minLength: number = 3, scope?: string) {
    super(scope);
    this.minLength = Number(minLength);
  }

  visitVariable(node: Variable): void {
    // exclude common counters
    const allowed = ["i", "j", "k", "x", "y", "z", "id"];
    const name = node.identifier.value;

    if (name.length < this.minLength && !allowed.includes(name)) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class HasUsageTypos extends ScopedVisitor {
  visitSequence(node: Sequence): void {
    const declaredNames = new Set<string>();
    const usedNames = new Set<string>();

    for (const stmt of node.statements) {
      if (stmt instanceof Function || stmt instanceof Variable) {
        declaredNames.add(stmt.identifier.value);
      }
    }

    for (const stmt of node.statements) {
      if (stmt instanceof Call) usedNames.add(stmt.callee.value);
    }

    for (const usage of usedNames) {
      if (!declaredNames.has(usage)) {
        for (const decl of declaredNames) {
          if (usage.length > 3 && getLevenshteinDistance(usage, decl) <= 1) {
            throw new StopTraversalException();
          }
        }
      }
    }
  }
}

@AutoScoped
export class UsesWrongCaseBindings extends ScopedVisitor {
  private readonly caseType: "camel" | "snake" | "pascal";

  constructor(caseType: string = "camel", scopeName?: string) {
    super(scopeName);
    this.caseType = caseType as any;
  }

  visitSymbolPrimitive(node: SymbolPrimitive): void {
    this.checkCase(node.value);
  }

  private checkCase(name: string): void {
    // Ignore operators (names not starting with a letter or underscore)
    if (!/^[a-zA-Z_]/.test(name)) return;

    let regex: RegExp;

    switch (this.caseType) {
      case "snake":
        regex = /^[a-z][a-z0-9_]*$/;
        break;
      case "pascal":
        regex = /^[A-Z][a-zA-Z0-9]*$/;
        break;
      case "camel":
      default:
        regex = /^[a-z][a-zA-Z0-9]*$/;
        break;
    }

    if (!regex.test(name)) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class IsLongCode extends ScopedVisitor {
  private readonly maxStatements: number;

  constructor(maxStatements: number = 50, scopeName?: string) {
    super(scopeName);
    this.maxStatements = Number(maxStatements);
  }

  visitSequence(node: Sequence): void {
    if (node.statements.length > this.maxStatements) {
      throw new StopTraversalException();
    }
  }
}

@AutoScoped
export class ShouldInvertIfCondition extends ScopedVisitor {
  visitIf(node: If): void {
    const thenEmpty = !node.then || isSequenceEmpty(node.then);
    const elseNonEmpty = node.elseExpr && !isSequenceEmpty(node.elseExpr);

    if (thenEmpty && elseNonEmpty) {
      throw new StopTraversalException();
    }
  }
}

export const genericSmells: Record<string, VisitorConstructor> = {
  DiscardsExceptions: DiscardsExceptions,
  DoesConsolePrint: DoesConsolePrint,
  HasDeclarationTypos: HasDeclarationTypos,
  HasEmptyIfBranches: HasEmptyIfBranches,
  HasLongParameterList: HasLongParameterList,
  HasMisspelledIdentifiers: HasMisspelledIdentifiers,
  HasRedundantBooleanComparison: HasRedundantBooleanComparison,
  HasRedundantIf: HasRedundantIf,
  HasRedundantLocalVariableReturn: HasRedundantLocalVariableReturn,
  HasTooShortIdentifiers: HasTooShortIdentifiers,
  HasUsageTypos: HasUsageTypos,
  HasWrongCaseIdentifiers: UsesWrongCaseBindings,
  UsesWrongCaseBindings: UsesWrongCaseBindings,
  IsLongCode: IsLongCode,
  ShouldInvertIfCondition: ShouldInvertIfCondition,
};
