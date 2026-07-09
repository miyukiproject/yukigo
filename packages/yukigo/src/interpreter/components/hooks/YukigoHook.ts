import { InterpreterError } from "../../errors.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { ASTNode } from "yukigo-ast";
import { YuValue } from "../../primitives/YuValue.js";

export interface YukigoHook {
  /** 
   * Ejecutado cuando ocurre un InterpreterError, permitiendo a los lenguajes transformarlo en un YuValue (excepción de usuario).
   */
  onInterpreterError?: (error: InterpreterError, ctx: RuntimeContext) => Error | YuValue | void;

  /**
   * Ejecutado antes de evaluar un nodo del AST.
   */
  beforeNodeEvaluate?: (node: ASTNode, ctx: RuntimeContext) => void;

  /**
   * Ejecutado después de evaluar un nodo del AST.
   */
  afterNodeEvaluate?: (node: ASTNode, result: YuValue, ctx: RuntimeContext) => void;

  /**
   * Ejecutado antes de realizar el dispatch de un mensaje.
   */
  onMessageDispatch?: (receiver: YuValue, message: string, args: YuValue[], ctx: RuntimeContext) => void;
}
