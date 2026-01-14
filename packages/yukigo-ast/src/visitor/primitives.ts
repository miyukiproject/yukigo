import {
    BooleanPrimitive,
    CharPrimitive,
    ListPrimitive,
    NilPrimitive,
    NumberPrimitive,
    StringPrimitive,
    SymbolPrimitive,
} from "../globals/primitives.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface PrimitiveVisitor<TReturn> {
    visitNumberPrimitive(node: NumberPrimitive): TReturn;
    visitBooleanPrimitive(node: BooleanPrimitive): TReturn;
    visitStringPrimitive(node: StringPrimitive): TReturn;
    visitListPrimitive(node: ListPrimitive): TReturn;
    visitNilPrimitive(node: NilPrimitive): TReturn;
    visitSymbolPrimitive(node: SymbolPrimitive): TReturn;
    visitCharPrimitive(node: CharPrimitive): TReturn;
}

export function PrimitiveTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class PrimitiveTraverser extends Base implements PrimitiveVisitor<void> {
        visitNumberPrimitive(node: NumberPrimitive): void { }
        visitBooleanPrimitive(node: BooleanPrimitive): void { }
        visitStringPrimitive(node: StringPrimitive): void { }
        visitListPrimitive(node: ListPrimitive): void {
            this.traverseCollection(node.value);
        }
        visitNilPrimitive(node: NilPrimitive): void { }
        visitSymbolPrimitive(node: SymbolPrimitive): void { }
        visitCharPrimitive(node: CharPrimitive): void { }
    };
}
