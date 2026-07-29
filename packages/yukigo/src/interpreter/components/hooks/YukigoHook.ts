import { InterpreterError } from "../../errors.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { ASTNode, Test } from "yukigo-ast";
import { YuValue } from "../../primitives/YuValue.js";
import { Interpreter } from "../../index.js";

export interface YukigoHook {
  /**
   * Executed when an InterpreterError is raised, allows languages to extends error handling.
   */
  onInterpreterError?: (
    error: InterpreterError,
    ctx: RuntimeContext,
  ) => Error | YuValue | void;

  /**
   * Executed before evaluating a node.
   */
  beforeNodeEvaluate?: (node: ASTNode, ctx: RuntimeContext) => void;

  /**
   * Executed after evaluating a nove.
   */
  afterNodeEvaluate?: (
    node: ASTNode,
    result: YuValue,
    ctx: RuntimeContext,
  ) => void;

  /**
   * Executed before dispatching a message to an object.
   */
  onMessageDispatch?: (
    receiver: YuValue,
    message: string,
    args: YuValue[],
    ctx: RuntimeContext,
  ) => void;

  /** Executed before each individual Test */
  beforeEachTest?: (interpreter: Interpreter, testNode: Test) => void;

  /** Executed after each individual Test */
  afterEachTest?: (interpreter: Interpreter, testNode: Test) => void;
}
