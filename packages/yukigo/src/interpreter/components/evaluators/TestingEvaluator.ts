import { Assert, Test, TestGroup, TestingVisitor } from "yukigo-ast";
import { ExecutionCommand } from "../kernel/commands.js";
import { Constructor, EvaluatorBase } from "./BaseEvaluator.js";
import { TestRunner } from "../TestRunner.js";

export function TestingEvaluator<TBase extends Constructor<EvaluatorBase>>(
  Base: TBase,
) {
  return class
    extends Base
    implements Partial<TestingVisitor<ExecutionCommand>>
  {
    visitTestGroup(node: TestGroup): ExecutionCommand {
      return new TestRunner(this, this.context.lazyRuntime).visitTestGroup(
        node,
      );
    }
    visitTest(node: Test): ExecutionCommand {
      return new TestRunner(this, this.context.lazyRuntime).visitTest(node);
    }

    visitAssert(node: Assert): ExecutionCommand {
      return new TestRunner(this, this.context.lazyRuntime).visitAssert(node);
    }
  };
}
