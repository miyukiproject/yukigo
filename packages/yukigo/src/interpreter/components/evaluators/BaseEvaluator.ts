import { ASTNode } from "yukigo-ast";
import { ExecutionCommand, FailCommand } from "../kernel/commands.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { UnexpectedNode } from "../../errors.js";
import { YuValue } from "../../primitives/index.js";

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface Evaluator {
  evaluate(node: ASTNode): ExecutionCommand;
  realizeList(val: YuValue): ExecutionCommand;
  fallback(node: ASTNode): ExecutionCommand;
  getContext(): RuntimeContext;
}

export class EvaluatorBase implements Evaluator {
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
