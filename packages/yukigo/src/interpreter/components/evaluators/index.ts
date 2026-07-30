import { ASTNode, Visitor } from "yukigo-ast";
import { EvaluatorBase } from "./BaseEvaluator.js";
import { ExpressionEvaluator } from "./ExpressionEvaluator.js";
import { OperationEvaluator } from "./OperationEvaluator.js";
import { PrimitiveEvaluator } from "./PrimitiveEvaluator.js";
import { StatementEvaluator } from "./StatementEvaluator.js";
import { TestingEvaluator } from "./TestingEvaluator.js";
import { EvalCommand, ExecutionCommand } from "../kernel/commands.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { YuValue } from "../../primitives/index.js";
import { YukigoKernel } from "../kernel/index.js";

export class InterpreterVisitor
  extends TestingEvaluator(
    StatementEvaluator(
      ExpressionEvaluator(
        OperationEvaluator(PrimitiveEvaluator(EvaluatorBase)),
      ),
    ),
  )
  implements Visitor<ExecutionCommand>
{
  constructor(context: RuntimeContext) {
    super(context);
    this.context.evaluatorFactory = (ctx) => new InterpreterVisitor(ctx);
  }

  static evaluateLiteral(node: ASTNode, ctx?: RuntimeContext): YuValue {
    const targetCtx = ctx ?? new RuntimeContext();
    const visitor = new InterpreterVisitor(targetCtx);
    const kernel = new YukigoKernel(visitor);
    return kernel.run(new EvalCommand(node));
  }
}
