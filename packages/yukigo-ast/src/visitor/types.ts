import {
    SimpleType,
    TypeVar,
    TypeApplication,
    ListType,
    TupleType,
    Constraint,
    ParameterizedType,
    ConstrainedType,
    TypeAlias,
    TypeSignature,
    TypeCast,
} from "../globals/types.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface TypeVisitor<TReturn> {
    visitSimpleType(node: SimpleType): TReturn;
    visitTypeVar(node: TypeVar): TReturn;
    visitTypeApplication(node: TypeApplication): TReturn;
    visitListType(node: ListType): TReturn;
    visitTupleType(node: TupleType): TReturn;
    visitConstraint(node: Constraint): TReturn;
    visitParameterizedType(node: ParameterizedType): TReturn;
    visitConstrainedType(node: ConstrainedType): TReturn;
    visitTypeAlias(node: TypeAlias): TReturn;
    visitTypeSignature(node: TypeSignature): TReturn;
    visitTypeCast(node: TypeCast): TReturn;
}

export function TypeTraverser<TBase extends GConstructor<TraverseBase>>(
    Base: TBase
) {
    return class TypeTraverser extends Base implements TypeVisitor<void> {
        visitSimpleType(node: SimpleType): void {
            this.traverseCollection(node.constraints);
        }
        visitTypeVar(node: TypeVar): void {
            this.traverseCollection(node.constraints);
        }
        visitTypeApplication(node: TypeApplication): void {
            node.functionType.accept(this);
            node.argument.accept(this);
        }
        visitListType(node: ListType): void {
            this.traverseCollection(node.constraints);
        }
        visitTupleType(node: TupleType): void {
            this.traverseCollection(node.constraints);
            this.traverseCollection(node.values);
        }
        visitConstraint(node: Constraint): void {
            this.traverseCollection(node.parameters);
        }
        visitParameterizedType(node: ParameterizedType): void {
            this.traverseCollection(node.inputs);
            this.traverseCollection(node.constraints);
            node.returnType.accept(this);
        }
        visitConstrainedType(node: ConstrainedType): void {
            this.traverseCollection(node.constraints);
        }
        visitTypeAlias(node: TypeAlias): void {
            node.identifier.accept(this);
            node.value.accept(this);
        }
        visitTypeSignature(node: TypeSignature): void {
            node.body.accept(this);
            node.identifier.accept(this);
        }
        visitTypeCast(node: TypeCast): void {
            node.body.accept(this);
            node.expression.accept(this);
        }
    };
}
