import {
  ASTNode,
  Equation,
  Expression,
  SourceLocation,
  SymbolPrimitive,
} from "../globals/generics.js";
import { Operator } from "../globals/operators.js";
import { Visitor } from "../visitor.js";

/**
 * Represents a method definition within a class or object.
 *
 * @example
 * method exhaust() {
 *    energy -= 5
 * }
 * @category OOP
 */
export class Method extends ASTNode {
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
    return visitor.visitMethod?.(this);
  }
  public toJSON() {
    return {
      type: "Method",
      identifier: this.identifier.toJSON(),
      equations: this.equations.map((eq) => eq.toJSON()),
    };
  }
}

/**
 * Represents an attribute or instance variable of an object.
 * @category OOP
 */
export class Attribute extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAttribute?.(this);
  }
  public toJSON() {
    return {
      type: "Attribute",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents an object definition or a singleton object.
 *
 * @example
 * object pepita { ... }
 * @category OOP
 */
export class Object extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitObject?.(this);
  }
  public toJSON() {
    return {
      type: "Object",
      identifier: this.identifier.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents a class definition, a blueprint for objects.
 *
 * @example
 * class Bird inherits Animal { ... }
 * @category OOP
 */
export class Class extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public implementsNode: Implement | undefined;
  /** @hidden */
  public extendsSymbol: SymbolPrimitive | undefined;
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    extendsSymbol: SymbolPrimitive | undefined,
    implementsNode: Implement | undefined,
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.extendsSymbol = extendsSymbol;
    this.implementsNode = implementsNode;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitClass?.(this);
  }
  public toJSON() {
    return {
      type: "Class",
      identifier: this.identifier.toJSON(),
      extends: this.extendsSymbol.toJSON(),
      implements: this.implementsNode.toJSON(),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents an interface or protocol definition.
 * @category OOP
 */
export class Interface extends ASTNode {
  /** @hidden */
  public expression: Expression;
  /** @hidden */
  public extendsSymbol: SymbolPrimitive[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    extendsSymbol: SymbolPrimitive[],
    expression: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.extendsSymbol = extendsSymbol;
    this.expression = expression;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInterface?.(this);
  }
  public toJSON() {
    return {
      type: "Interface",
      identifier: this.identifier.toJSON(),
      extends: this.extendsSymbol.map((symbol) => symbol.toJSON()),
      expression: this.expression.toJSON(),
    };
  }
}

/**
 * Represents a message send or method invocation on an object.
 *
 * @example
 * pepita.fly(10)
 * @category OOP
 */
export class Send extends ASTNode {
  /** @hidden */
  public args: Expression[];
  /** @hidden */
  public selector: Expression;
  /** @hidden */
  public receiver: Expression;

  constructor(
    receiver: Expression,
    selector: Expression,
    args: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.receiver = receiver;
    this.selector = selector;
    this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSend?.(this);
  }
  public toJSON() {
    return {
      type: "Send",
      receiver: this.receiver.toJSON(),
      selector: this.selector.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

/**
 * Represents the instantiation of a class.
 *
 * @example
 * new Bird()
 * @category OOP
 */
export class New extends ASTNode {
  /** @hidden */
  public args: Expression[];
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(
    identifier: SymbolPrimitive,
    args: Expression[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.identifier = identifier;
    this.args = args;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNew?.(this);
  }
  public toJSON() {
    return {
      type: "New",
      identifier: this.identifier.toJSON(),
      arguments: this.args.map((arg) => arg.toJSON()),
    };
  }
}

/**
 * Represents an implementation clause for an interface.
 * @category OOP
 */
export class Implement extends ASTNode {
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(identifier: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
    this.identifier = identifier;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitImplement?.(this);
  }
  public toJSON() {
    return {
      type: "Implement",
      identifier: this.identifier.toJSON(),
    };
  }
}

/**
 * Represents the inclusion of a module or mixin.
 * @category OOP
 */
export class Include extends ASTNode {
  /** @hidden */
  public identifier: SymbolPrimitive;

  constructor(identifier: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
    this.identifier = identifier;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInclude?.(this);
  }
  public toJSON() {
    return {
      type: "Include",
      identifier: this.identifier.toJSON(),
    };
  }
}
/**
 * Represents a reference to the current object instance (self/this).
 * @category OOP
 */
export class Self extends ASTNode {
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSelf?.(this);
  }
  public toJSON() {
    return {
      type: "Self",
    };
  }
}
/**
 * Represents a reference to the superclass or parent object.
 * @category OOP
 */
export class Super extends ASTNode {
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSuper?.(this);
  }
  public toJSON() {
    return {
      type: "Super",
    };
  }
}
/**
 * Declaration of custom primitive operators - also known as operator overriding.
 * @category OOP
 * @example
 * def ==(other)
 * end
 * def hash
 * end

 */
export class PrimitiveMethod extends ASTNode {
  public operator: Operator;
  public equations: Equation[];
  constructor(operator: Operator, equations: Equation[], loc: SourceLocation) {
    super(loc);
    this.operator = operator;
    this.equations = equations;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPrimitiveMethod?.(this);
  }
  public toJSON() {
    return {
      type: "PrimitiveMethod",
      operator: this.operator,
      equations: this.equations,
    };
  }
}
