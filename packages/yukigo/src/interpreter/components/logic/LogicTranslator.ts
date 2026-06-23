import {
  Expression,
  Variable,
  ListPrimitive,
  ConsExpression,
  SymbolPrimitive,
  isPattern,
  Pattern,
  LiteralPattern,
  VariablePattern,
  ListPattern,
  TuplePattern,
  ConsPattern,
  FunctorPattern,
  WildcardPattern,
  ConstructorPattern,
  ASTNode,
  PatternVisitor,
  Visitor,
} from "yukigo-ast";
import {
  VariableTerm,
  ConstantTerm,
  ListTerm,
  ConsTerm,
  WildcardTerm,
  CompoundTerm,
} from "./LogicTerm.js";
import { Evaluator } from "../../utils.js";
import { InterpreterError } from "../../errors.js";
import { RuntimeContext } from "../RuntimeContext.js";
import {
  ExecutionCommand,
  StepCommand,
  BindCommand,
} from "../kernel/commands.js";
import { YuValue } from "../../primitives/YuValue.js";
import { LogicTerm, YuNumber, YuString, YuBoolean, YuNil, isLogicTerm, isRuntimeObject, Substitution } from "../../primitives/index.js";

/**
 * Sync visitor to convert Patterns to LogicTerms.
 */
class PatternToTermVisitor implements PatternVisitor<LogicTerm> {
  constructor(
    private translator: LogicTranslator,
    private scope?: Map<string, VariableTerm>,
  ) {}

  visitVariablePattern(node: VariablePattern): LogicTerm {
    const name = node.name.value;
    if (this.scope) {
      let term = this.scope.get(name);
      if (!term) {
        term = new VariableTerm(this.translator.getNextId(name), name);
        this.scope.set(name, term);
      }
      return term;
    }
    return new VariableTerm(this.translator.getNextId(name), name);
  }
  visitLiteralPattern(node: LiteralPattern): LogicTerm {
    const raw = node.name.value;
    let wrapped: YuNumber | YuString | YuBoolean | YuNil;
    if (typeof raw === "number") wrapped = new YuNumber(raw);
    else if (typeof raw === "string") wrapped = new YuString(raw);
    else if (typeof raw === "boolean") wrapped = new YuBoolean(raw);
    else wrapped = YuNil.getInstance();
    
    return new ConstantTerm(wrapped);
  }
  visitListPattern(node: ListPattern): LogicTerm {
    return new ListTerm(node.elements.map((el) => el.accept(this)));
  }
  visitTuplePattern(node: TuplePattern): LogicTerm {
    return new ListTerm(node.elements.map((el) => el.accept(this)));
  }
  visitConsPattern(node: ConsPattern): LogicTerm {
    let curr: Pattern = node;
    const lefts: Pattern[] = [];
    while (curr instanceof ConsPattern) {
      lefts.push(curr.left);
      curr = curr.right;
    }
    let result = curr.accept(this);
    for (let i = lefts.length - 1; i >= 0; i--) {
      result = new ConsTerm(lefts[i].accept(this), result);
    }
    return result;
  }
  visitWildcardPattern(node: WildcardPattern): LogicTerm {
    return new WildcardTerm();
  }
  visitFunctorPattern(node: FunctorPattern): LogicTerm {
    return new CompoundTerm(
      node.identifier.value,
      node.args.map((a) => a.accept(this)),
    );
  }
  visitConstructorPattern(node: ConstructorPattern): LogicTerm {
    return new CompoundTerm(
      node.identifier.value,
      node.args.map((a) => a.accept(this)),
    );
  }
  visitAsPattern(node: any): LogicTerm {
    return node.right.accept(this);
  }
  visitUnionPattern(node: any): LogicTerm {
    throw new InterpreterError(
      "Logic",
      "UnionPattern not supported in logic engine yet",
    );
  }
  visitTypePattern(node: any): LogicTerm {
    throw new InterpreterError(
      "Logic",
      "TypePattern not supported in logic engine yet",
    );
  }
  visitApplicationPattern(node: any): LogicTerm {
    return new CompoundTerm(
      node.identifier.value,
      node.args.map((a: any) => a.accept(this)),
    );
  }

  public fallback(node: ASTNode): LogicTerm {
    throw new InterpreterError(
      "Logic",
      `Pattern ${node.constructor.name} translation not implemented`,
    );
  }
}

/**
 * Kernel-based visitor to convert Expressions to LogicTerms.
 */
class ExpressionToTermVisitor implements Visitor<ExecutionCommand> {
  constructor(
    private translator: LogicTranslator,
    private evaluator: Evaluator,
    private ctx: RuntimeContext,
    private scope?: Map<string, VariableTerm>,
  ) {}

  visitListPrimitive(node: ListPrimitive): ExecutionCommand {
    const terms: LogicTerm[] = [];
    const next = (index: number): ExecutionCommand => {
      if (index >= node.value.length)
        return new StepCommand(new ListTerm(terms));
      return new BindCommand(
        this.translator.expressionToTerm(
          node.value[index] as Expression,
          this.scope,
        ),
        (t) => {
          if (!isLogicTerm(t))
            throw new Error("expected LogicTerm in visitListPrimitive");
          terms.push(t);
          return next(index + 1);
        },
      );
    };
    return next(0);
  }

  visitConsExpression(node: ConsExpression): ExecutionCommand {
    return new BindCommand(
      this.translator.expressionToTerm(node.head, this.scope),
      (head) => {
        if (!isLogicTerm(head))
          throw new Error("expected LogicTerm in visitConsExpression");

        return new BindCommand(
          this.translator.expressionToTerm(node.tail, this.scope),
          (tail) => {
            if (!isLogicTerm(tail))
              throw new Error("expected LogicTerm in visitConsExpression");
            return new StepCommand(new ConsTerm(head, tail));
          },
        );
      },
    );
  }

  visitVariable(node: Variable): ExecutionCommand {
    const name = node.identifier.value;
    if (this.ctx.isDefined(name)) {
      return new BindCommand(this.evaluator.evaluate(node), (val) => {
        return new StepCommand(this.translator.primitiveToTerm(val));
      });
    }
    if (this.scope) {
      let term = this.scope.get(name);
      if (!term) {
        term = new VariableTerm(this.translator.getNextId(name), name);
        this.scope.set(name, term);
      }
      return new StepCommand(term);
    }
    return new StepCommand(
      new VariableTerm(this.translator.getNextId(name), name),
    );
  }

  visitSymbolPrimitive(node: SymbolPrimitive): ExecutionCommand {
    const name = node.value;
    if (this.ctx.isDefined(name)) {
      return new BindCommand(this.evaluator.evaluate(node), (val) => {
        return new StepCommand(this.translator.primitiveToTerm(val));
      });
    }
    if (this.scope) {
      let term = this.scope.get(name);
      if (!term) {
        term = new VariableTerm(this.translator.getNextId(name), name);
        this.scope.set(name, term);
      }
      return new StepCommand(term);
    }
    return new StepCommand(
      new VariableTerm(this.translator.getNextId(name), name),
    );
  }

  public fallback(node: ASTNode): ExecutionCommand {
    if (isPattern(node)) {
      return new StepCommand(this.translator.patternToTerm(node, this.scope));
    }
    return new BindCommand(
      this.evaluator.evaluate(node as Expression),
      (val) => {
        return new StepCommand(this.translator.primitiveToTerm(val));
      },
    );
  }
}

export class LogicTranslator {
  constructor(
    private evaluator: Evaluator,
    private ctx: RuntimeContext,
  ) {}

  public getNextId(name: string): number {
    const id = ++this.ctx.logicState.variableCounter;
    this.ctx.logicState.idToName.set(id, name);
    return id;
  }

  public getName(id: number): string | undefined {
    return this.ctx.logicState.idToName.get(id);
  }

  /**
   * Translates a Pattern (AST) into a LogicTerm (Runtime).
   */
  public patternToTerm(
    pat: Pattern,
    scope?: Map<string, VariableTerm>,
  ): LogicTerm {
    const visitor = new PatternToTermVisitor(this, scope);
    return pat.accept(visitor);
  }

  /**
   * Converts a PrimitiveValue to a LogicTerm.
   */
  public primitiveToTerm(val: YuValue): LogicTerm {
    if (val.asNumeric || val.asSummable instanceof YuString || val.asLogic || val instanceof YuNil) {
      return new ConstantTerm(val as any);
    }
    const seq = val.asSequence;
    if (seq) {
      return new ListTerm([...seq].map((v) => this.primitiveToTerm(v)));
    }
    if (isRuntimeObject(val)) {
      const args: LogicTerm[] = [];
      for (const [_, fieldVal] of val.fields) {
        args.push(this.primitiveToTerm(fieldVal));
      }
      return new CompoundTerm(val.className || val.identifier, args);
    }
    if (isLogicTerm(val)) return val;

    throw new InterpreterError(
      "primitiveToTerm",
      `Cannot convert value ${val} to Logic Term`,
    );
  }


  /**
   * Evaluates an expression and returns its LogicTerm representation via the Kernel.
   */
  public expressionToTerm(
    expr: Expression,
    scope?: Map<string, VariableTerm>,
  ): ExecutionCommand {
    const visitor = new ExpressionToTermVisitor(
      this,
      this.evaluator,
      this.ctx,
      scope,
    );
    return expr.accept(visitor);
  }

  /**
   * Instantiates an expression as a logic term, resolving logic variables.
   */
  public instantiateExpressionAsTerm(
    expr: Expression,
    substs: Substitution,
    scope?: Map<string, VariableTerm>,
  ): ExecutionCommand {
    return new BindCommand(this.expressionToTerm(expr, scope), (term) => {
      if (!isLogicTerm(term))
        throw new Error("expected LogicTerm in visitConsExpression");
      return new StepCommand(term.instantiate(substs));
    });
  }
}
