import {
  Assignment,
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
    if (node.condition instanceof Assignment)
      throw new StopTraversalException();
  }
  visitWhile(node: While): void {
    if (node.condition instanceof Assignment)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasAssignmentReturn extends ScopedVisitor {
  visitReturn(node: Return): void {
    if (node.body && node.body instanceof Assignment)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasEmptyRepeat extends ScopedVisitor {
  visitRepeat(node: Repeat): void {
    if (node.body instanceof Sequence && node.body.statements.length === 0)
      throw new StopTraversalException();
  }
}

@AutoScoped
export class HasRedundantRepeat extends ScopedVisitor {
  visitRepeat(node: Repeat): void {
    if (node.count instanceof NumberPrimitive && node.count.value === 1)
      throw new StopTraversalException();
  }
}

export const imperativeSmells: Record<string, VisitorConstructor> = {
  HasAssignmentCondition: HasAssignmentCondition,
  HasAssignmentReturn: HasAssignmentReturn,
  HasEmptyRepeat: HasEmptyRepeat,
  HasRedundantRepeat: HasRedundantRepeat,
};
