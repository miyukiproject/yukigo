import {
  Assignment,
  Expression,
  If,
  NumberPrimitive,
  Repeat,
  Return,
  Sequence,
  StopTraversalException,
  While,
} from "yukigo-ast";
import { AutoScoped, ScopedVisitor, VisitorConstructor } from "../../utils.js";

@AutoScoped
export class HasAssignmentCondition extends ScopedVisitor {
  visitIf(node: If): void {
    if (this.isConditionAssignment(node.condition))
      throw new StopTraversalException();
  }
  visitWhile(node: While): void {
    if (this.isConditionAssignment(node.condition))
      throw new StopTraversalException();
  }
  private isConditionAssignment(node: Expression) {
    return node.is(Assignment);
  }
}

@AutoScoped
export class HasAssignmentReturn extends ScopedVisitor {
  visitReturn(node: Return): void {
    if (node.body && node.body.is(Assignment))
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasEmptyRepeat extends ScopedVisitor {
  visitRepeat(node: Repeat): void {
    if (node.body.is(Sequence) && node.body.statements.length === 0)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantRepeat extends ScopedVisitor {
  visitRepeat(node: Repeat): void {
    if (node.count.is(NumberPrimitive) && node.count.value === 1)
      throw new StopTraversalException();
  }
}

export const imperativeSmells: Record<string, VisitorConstructor> = {
  HasAssignmentCondition: HasAssignmentCondition,
  HasAssignmentReturn: HasAssignmentReturn,
  HasEmptyRepeat: HasEmptyRepeat,
  HasRedundantRepeat: HasRedundantRepeat,
};
