import { Visitor } from "../visitor/index.js";
import { Expression } from "./expressions.js";
import { ASTNode, SerializeNode, SourceLocation } from "./generics.js";

export type YukigoPrimitive =
  | "YuNumber"
  | "YuSymbol"
  | "YuList"
  | "YuString"
  | "YuChar"
  | "YuNil"
  | "YuBoolean";

/**
 * Abstract base class for all Primitives to reduce boilerplate.
 * @template T The type of the raw value (number, string, boolean, etc.)
 */
abstract class BasePrimitive<T> extends ASTNode {
  public value: T;

  constructor(value: T, loc?: SourceLocation) {
    super(loc);
    this.value = value;
  }

  /** The string identifier for JSON serialization (ex: "YuNumber") */
  protected abstract get jsonType(): YukigoPrimitive;

  public abstract accept<R>(visitor: Visitor<R>): R;

  /**
   * Generic equality check.
   */
  public equals(other: Primitive): boolean {
    if (this.constructor !== other.constructor) return false;
    return this.value === (other as any).value;
  }

  public toJSON(): SerializeNode {
    return {
      type: this.jsonType,
      value: this.value,
    };
  }
}

/**
 * Generic number primitive
 * @category Literals
 */
export class NumberPrimitive extends BasePrimitive<number> {
  protected get jsonType(): YukigoPrimitive {
    return "YuNumber";
  }

  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitNumberPrimitive);
  }
}

/**
 * Generic boolean primitive
 * @category Literals
 */
export class BooleanPrimitive extends BasePrimitive<boolean> {
  protected get jsonType(): YukigoPrimitive {
    return "YuBoolean";
  }

  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitBooleanPrimitive);
  }
}

/**
 * Generic char primitive
 * @category Literals
 */
export class CharPrimitive extends BasePrimitive<string> {
  protected get jsonType(): YukigoPrimitive {
    return "YuChar";
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitCharPrimitive);
  }
}

/**
 * Generic string primitive
 * @category Literals
 */
export class StringPrimitive extends BasePrimitive<string> {
  protected get jsonType(): YukigoPrimitive {
    return "YuString";
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitStringPrimitive);
  }
}

/**
 * Generic null/undefined primitive
 * @category Literals
 */
export class NilPrimitive extends BasePrimitive<undefined | null> {
  protected get jsonType(): YukigoPrimitive {
    return "YuNil";
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitNilPrimitive);
  }
}

/**
 * Generic symbol primitive
 * @category Literals
 */
export class SymbolPrimitive extends BasePrimitive<string> {
  protected get jsonType(): YukigoPrimitive {
    return "YuSymbol";
  }
  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitSymbolPrimitive);
  }
}

/**
 * Represent lists - generic uniform variable-size collection of elements. Lists typically map to arrays, lists or sequence-like structures.
 * @category Literals
 */
export class ListPrimitive extends BasePrimitive<Expression[]> {
  protected get jsonType(): YukigoPrimitive {
    return "YuList";
  }

  public accept<R>(visitor: Visitor<R>): R {
    return this.dispatchVisit(visitor, visitor.visitListPrimitive);
  }

  public override equals(other: Primitive): boolean {
    if (!(other instanceof ListPrimitive)) return false;
    if (this.value.length !== other.value.length) return false;

    return this.value.every((elem, i) => {
      const otherElem = other.value[i];
      if (!isYukigoPrimitive(otherElem)) return false;
      if ("equals" in elem && typeof elem.equals === "function")
        return elem.equals(otherElem);

      return elem === otherElem;
    });
  }
}

export type Primitive =
  | NumberPrimitive
  | BooleanPrimitive
  | CharPrimitive
  | StringPrimitive
  | NilPrimitive
  | SymbolPrimitive
  | ListPrimitive;

/**
 * Checks if a node is a Primitive.
 */
export function isYukigoPrimitive(node: ASTNode): node is Primitive {
  return node instanceof BasePrimitive;
}
