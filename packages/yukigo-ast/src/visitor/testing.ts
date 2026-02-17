import {
  Assert,
  Equality,
  Failure,
  Test,
  TestGroup,
  Truth,
} from "../globals/testing.js";
import { TraverseBase, GConstructor } from "./base.js";

export interface TestingVisitor<TReturn> {
  visitTestGroup(node: TestGroup): TReturn;
  visitTest(node: Test): TReturn;
  visitAssert(node: Assert): TReturn;
  visitTruth(node: Truth): TReturn;
  visitEquality(node: Equality): TReturn;
  visitFailure(node: Failure): TReturn;
}

export function TestingTraverser<TBase extends GConstructor<TraverseBase>>(
  Base: TBase,
) {
  return class TestingTraverser extends Base implements TestingVisitor<void> {
    visitTestGroup(node: TestGroup): void {
      node.name.accept(this);
      node.group.accept(this);
    }
    visitTest(node: Test): void {
      node.name.accept(this);
      this.traverseCollection(node.args);
      node.body.accept(this);
    }
    visitAssert(node: Assert): void {
      node.negated.accept(this);
      node.body.accept(this);
    }
    visitTruth(node: Truth): void {
      node.body.accept(this);
    }
    visitEquality(node: Equality): void {
      node.expected.accept(this);
      node.value.accept(this);
    }
    visitFailure(node: Failure): void {
      node.func.accept(this);
      node.message.accept(this);
    }
  };
}
