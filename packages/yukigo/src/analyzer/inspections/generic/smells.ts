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
  return node.is(Sequence) && node.statements.length === 0;
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
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

@AutoScoped
export class DiscardsExceptions extends ScopedVisitor {
  visitCatch(node: Catch): void {
    const doesNotCatch =
      !node.body || node.body.is(NilPrimitive) || isSequenceEmpty(node.body);
    if (doesNotCatch) {
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
    if (!func.is(SymbolPrimitive)) return func.accept(this);
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
    const names = node.statements
      .filter((stmt) => stmt.is(Variable))
      .map((stmt) => stmt.identifier.value);

    names.forEach((nameA, i) => {
      const hasTypo = names.slice(i + 1).some((nameB) => {
        if (nameA.length <= 3 || nameB.length <= 3) return false;
        return getLevenshteinDistance(nameA, nameB) <= 2;
      });

      if (hasTypo) throw new StopTraversalException();
    });
  }
}

@AutoScoped
export class HasEmptyIfBranches extends ScopedVisitor {
  visitIf(node: If): void {
    const isThenEmpty = !node.then || isSequenceEmpty(node.then);
    const isElseEmpty = isSequenceEmpty(node.elseExpr);
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
    const isLeftBool = node.left.is(BooleanPrimitive);
    const isRightBool = node.right.is(BooleanPrimitive);
    if (isLeftBool || isRightBool) throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantIf extends ScopedVisitor {
  visitIf(node: If): void {
    if (!node.elseExpr) return;
    const { then, elseExpr } = node;

    if (this.isBooleanBlock(then) && this.isBooleanBlock(elseExpr))
      throw new StopTraversalException();
  }
  private isBooleanBlock(node: ASTNode): boolean {
    return (
      node.is(Sequence) && node.statements.some((s) => s.is(BooleanPrimitive))
    );
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

    stmts.forEach((stmt, i) => {
      const next = stmts[i + 1];
      if (!next) return;

      if (this.isPointlessAssignment(stmt, next)) {
        throw new StopTraversalException();
      }
    });
  }
  private isPointlessAssignment(current: ASTNode, next: ASTNode): boolean {
    return (
      current.is(Variable) &&
      next.is(Return) &&
      next.body !== undefined &&
      next.body.is(SymbolPrimitive) &&
      next.body.value === current.identifier.value
    );
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
    const { statements } = node;
    const declared = new Set(
      statements
        .filter((stmt) => stmt.is(Function) || stmt.is(Variable))
        .map((stmt) => stmt.identifier.value),
    );

    const called = statements
      .filter((stmt) => stmt.is(Call))
      .map((stmt) => stmt.callee.value);

    const hasTypo = called.some((usage) => {
      if (declared.has(usage) || usage.length <= 3) return false;

      return Array.from(declared).some(
        (decl) => getLevenshteinDistance(usage, decl) <= 1,
      );
    });

    if (hasTypo) throw new StopTraversalException();
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
