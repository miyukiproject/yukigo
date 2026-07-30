import { ASTNode } from "yukigo-ast";
import { Evaluator } from "../../utils.js";
import { ExecutionCommand, FailCommand } from "../kernel/commands.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { UnexpectedNode } from "../../errors.js";

export type Constructor<T = {}> = new (...args: any[]) => T;

export abstract class EvaluatorBase implements Evaluator {
  constructor(public context: RuntimeContext) {}

  getContext(): RuntimeContext {
    return this.context;
  }

  evaluate(node: ASTNode): ExecutionCommand {
    return node.accept(this as any);
  }

  realizeList(val: any): ExecutionCommand {
    return this.context.lazyRuntime.realizeList(val);
  }

  fallback(node: ASTNode): ExecutionCommand {
    return new FailCommand(
      new UnexpectedNode(node.constructor.name, this.constructor.name),
    );
  }
}
