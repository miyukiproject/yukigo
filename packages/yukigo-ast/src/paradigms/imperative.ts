import {
  ASTNode,
  Equation,
  Expression,
  Sequence,
  SourceLocation,
  SymbolPrimitive,
  Variable,
} from "../globals/generics.js";
import { Visitor } from "../visitor.js";

/**
 * Represents the main entry point of a program.
 * @category Declarations
 */
export class EntryPoint extends ASTNode {
  /** @hidden */
  public expression: Sequence;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    expression: Sequence,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEntryPoint?.(this);
  }
  public toJSON() {
    return {
      type: "EntryPoint",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents a procedure definition, typically a function without a return value.
 * @category Declarations
 */
export class Procedure extends ASTNode {
  /** @hidden */
  public equations: Equation[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    equations: Equation[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.equations = equations;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitProcedure?.(this);
  }
  public toJSON() {
    return {
      type: "Procedure",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((eq) => eq.toJSON()),
    };
  }
}

/**
 * Represents a definition of a structured data type (struct).
 * @category Declarations
 */
export class Structure extends ASTNode {
  /** @hidden */
  public elements: (Variable | Structure)[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    elements: (Variable | Structure)[],
    loc?: SourceLocation
  ) {
    super();
    this.identifier = identifier;
    this.elements = elements;
    this.loc = loc;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitStructure?.(this);
  }
  public toJSON() {
    return {
      type: "Structure",
      identifier: this.identifier.toJSON(),
      expressions: this.elements.map((elem) => elem.toJSON()),
    };
  }
}

/**
 * Represents an enumeration type definition.
 * @category Declarations
 */
export class Enumeration extends ASTNode {
  /** @hidden */
  public contents: SymbolPrimitive[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    contents: SymbolPrimitive[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.contents = contents;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitEnumeration?.(this);
  }
  public toJSON() {
    return {
      type: "Enumeration",
      identifier: this.identifier.toJSON(),
      expressions: this.contents.map((c) => c.toJSON()),
    };
  }
}

/**
 * Represents a while loop control structure.
 *
 * @example
 * while (x > 0) { ... }
 * @category Statements
 */
export class While extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public condition: Expression;

  constructor(condition: Expression, body: Expression, loc?: SourceLocation) {
    super(loc);
    this.condition = condition;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWhile?.(this);
  }
  public toJSON() {
    return {
      type: "While",
      condition: this.condition.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
/**
 * Represents a repeat-until loop control structure.
 * @category Statements
 */
export class Repeat extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public count: Expression;

  constructor(count: Expression, body: Expression, loc?: SourceLocation) {
    super(loc);
    this.count = count;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRepeat?.(this);
  }
  public toJSON() {
    return {
      type: "Repeat",
      count: this.count.toJSON(),
      body: this.body.toJSON(),
    };
  }
}

/**
 * Represents a C-style or range-based for loop.
 * @category Statements
 */
export class ForLoop extends ASTNode {
  /** @hidden */
  public body: Expression;
  /** @hidden */
  public update: Expression;
  /** @hidden */
  public condition: Expression;
  /** @hidden */
  public initialization: Expression;

  constructor(
    initialization: Expression,
    condition: Expression,
    update: Expression,
    body: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.initialization = initialization;
    this.condition = condition;
    this.update = update;
    this.body = body;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitForLoop?.(this);
  }
  public toJSON() {
    return {
      type: "ForLoop",
      initialization: this.initialization.toJSON(),
      condition: this.condition.toJSON(),
      update: this.update.toJSON(),
      body: this.body.toJSON(),
    };
  }
}
