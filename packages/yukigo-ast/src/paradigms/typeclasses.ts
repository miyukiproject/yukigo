import {
  ASTNode,
  SourceLocation,
} from "../globals/generics.js";
import { Visitor } from "../visitor/index.js";
import { SymbolPrimitive } from "../globals/primitives.js";
import { TypeSignature, Type } from "../globals/types.js";
import { Function } from "../globals/statements.js";

/**
 * Represents a type class declaration.
 *
 * @example
 * class Eq a where
 *   (==) :: a -> a -> Bool
 *   (/=) :: a -> a -> Bool
 * @category Declarations
 */
export class TypeClass extends ASTNode {
  /** @hidden */
  public name: SymbolPrimitive;
  /** @hidden */
  public variable: SymbolPrimitive;
  /** @hidden */
  public signatures: TypeSignature[];

  constructor(
    name: SymbolPrimitive,
    variable: SymbolPrimitive,
    signatures: TypeSignature[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.variable = variable;
    this.signatures = signatures;
  }

  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTypeClass?.(this);
  }

  public toJSON() {
    return {
      type: "TypeClass",
      name: this.name.toJSON(),
      variable: this.variable.toJSON(),
      signatures: this.signatures.map((sig) => sig.toJSON()),
    };
  }
}

/**
 * Represents an instance declaration for a type class.
 *
 * @example
 * instance Eq Bool where
 *   True == True = True
 *   False == False = True
 *   _ == _ = False
 * @category Declarations
 */
export class Instance extends ASTNode {
  /** @hidden */
  public className: SymbolPrimitive;
  /** @hidden */
  public type: Type;
  /** @hidden */
  public functions: Function[];

  constructor(
    className: SymbolPrimitive,
    type: Type,
    functions: Function[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.className = className;
    this.type = type;
    this.functions = functions;
  }

  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInstance?.(this);
  }

  public toJSON() {
    return {
      type: "Instance",
      className: this.className.toJSON(),
      targetType: this.type.toJSON(),
      functions: this.functions.map((func) => func.toJSON()),
    };
  }
}
