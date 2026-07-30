import {
  Assignment,
  Attribute,
  Function,
  If,
  LogicConstraint,
  NamedArgument,
  Object,
  Print,
  Query,
  Raise,
  Return,
  Self,
  Sequence,
  StatementVisitor,
  Super,
  Try,
  Variable,
} from "yukigo-ast";
import {
  Constructor as EvaluatorConstructor,
  EvaluatorBase,
} from "./BaseEvaluator.js";
import {
  BacktrackCommand,
  BindCommand,
  CatchCommand,
  CatchHandler,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
  RaiseCommand,
  StepCommand,
} from "../kernel/commands.js";
import {
  LogicAnswer,
  LogicResult,
  RuntimeClass,
  RuntimeObject,
  YuBoolean,
  YuNil,
  YuString,
  YuValue,
} from "../../primitives/index.js";
import { InterpreterError } from "../../errors.js";
import { boolean, Environment, isTrue } from "../../utils.js";
import { OOPCollector } from "../EnvBuilder.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { getClassFields, getClassInitializers, getLogicEngine } from "./utils.js";

export function StatementEvaluator<
  TBase extends EvaluatorConstructor<EvaluatorBase>,
>(Base: TBase) {
  return class
    extends Base
    implements Partial<StatementVisitor<ExecutionCommand>>
  {
    visitSequence(node: Sequence): ExecutionCommand {
      if (node.statements.length === 0)
        return new StepCommand(YuNil.getInstance());

      const evaluateNext = (
        index: number,
        lastResult: YuValue,
      ): ExecutionCommand => {
        if (index >= node.statements.length) return new StepCommand(lastResult);

        const stmt = node.statements[index];
        return new BindCommand(this.evaluate(stmt), (result) => {
          if (stmt instanceof Return) return new StepCommand(result);
          return evaluateNext(index + 1, result);
        });
      };

      return evaluateNext(0, YuNil.getInstance());
    }
    visitSelf(node: Self): ExecutionCommand {
      try {
        return new StepCommand(this.context.lookup("self"));
      } catch {
        return new FailCommand(
          new InterpreterError("Self", "'self' is not defined in this context"),
        );
      }
    }
    visitSuper(node: Super): ExecutionCommand {
      let methodName: YuString;
      try {
        methodName = this.context.lookup("__METHOD_NAME__") as YuString;
      } catch (e) {
        return new FailCommand(
          new InterpreterError(
            "Super",
            "'super' keyword used outside of a method context",
          ),
        );
      }

      const args: YuValue[] = [];
      const evaluateNextArg = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          return this.context.objRuntime.dispatchSuper(
            methodName.toJSON(),
            args,
          );
        }
        return new BindCommand(this.evaluate(node.args[index]), (val) => {
          args.push(val);
          return evaluateNextArg(index + 1);
        });
      };
      return evaluateNextArg(0);
    }
    visitIf(node: If): ExecutionCommand {
      return new BindCommand(this.evaluate(node.condition), (condition) => {
        if (!(condition instanceof YuBoolean))
          return new FailCommand(
            new InterpreterError(
              "If",
              `Expected boolean in condition and got ${condition.getType()}`,
            ),
          );
        const isTrue = condition.value;
        return isTrue ? this.evaluate(node.then) : this.evaluate(node.elseExpr);
      });
    }
    visitReturn(node: Return): ExecutionCommand {
      if (!node.body) return new StepCommand(YuNil.getInstance());
      return this.evaluate(node.body);
    }
    visitFunction(node: Function): ExecutionCommand {
      return new StepCommand(YuNil.getInstance());
    }
    visitTry(node: Try): ExecutionCommand {
      const tryStartEnv = this.context.env;

      // Comando que evaluará el cuerpo del Try (ej: block.apply())
      const bodyCommand = new EvalCommand(node.body);

      // Este handler es el que el Kernel llamará cuando reciba el RaiseCommand
      const catchHandler: CatchHandler = (errorObj) => {
        this.context.env = tryStartEnv; // Restauramos entorno

        // 1. Reificamos la excepción para Wollok
        let exceptionObj: YuValue | undefined;

        if (errorObj instanceof InterpreterError) {
          const mappedErrors = this.context.dispatchHook(
            "onInterpreterError",
            errorObj,
            this.context,
          );
          exceptionObj = mappedErrors.find(
            (res: any) => res !== undefined && res !== null,
          ) as YuValue;
        }

        if (!exceptionObj) {
          if (errorObj instanceof InterpreterError) {
            exceptionObj = new YuString(errorObj.message);
          } else {
            exceptionObj = errorObj as YuValue;
          }
        }

        // 2. Buscamos si el Try tiene bloques catch
        const catches = node.catchExpr;

        if (catches.length > 0) {
          const catchBlock = catches[0];
          const pattern = catchBlock.patterns[0] as any;
          const paramName =
            pattern.name?.value ?? pattern.identifier?.value ?? String(pattern);

          // Inyectamos la variable 'e' (excepción) en el scope
          this.context.pushEnv();
          this.context.define(paramName, exceptionObj);

          // Retornamos la evaluación del catchBlock
          return new BindCommand(
            new EvalCommand(catchBlock.body),
            (catchRes) => {
              this.context.env = tryStartEnv;

              // Si había bloque finally, podrías evaluarlo acá antes del StepCommand
              if (node.finallyExpr) {
                return new BindCommand(
                  new EvalCommand(node.finallyExpr),
                  () => new StepCommand(catchRes),
                );
              }
              return new StepCommand(catchRes);
            },
          );
        }

        // Si no había bloque catch (solo finally), relanzamos al Kernel superior
        if (node.finallyExpr) {
          return new BindCommand(
            new EvalCommand(node.finallyExpr),
            () => new RaiseCommand(errorObj),
          );
        }
        return new RaiseCommand(errorObj);
      };

      // Le entregamos el CatchCommand al Kernel para que lo apile ANTES de ejecutar el cuerpo
      return new CatchCommand(catchHandler, bodyCommand);
    }

    visitRaise(node: Raise): ExecutionCommand {
      return new BindCommand(this.evaluate(node.body), (msg) => {
        if (msg instanceof RuntimeObject) return new RaiseCommand(msg);

        const msgStr = msg.toJSON();
        if (typeof msgStr !== "string") {
          return new RaiseCommand(
            new InterpreterError("Raise", msg.toString()),
          );
        }
        return new RaiseCommand(new InterpreterError("Raise", msgStr));
      });
    }
    visitPrint(node: Print): ExecutionCommand {
      return new BindCommand(this.evaluate(node.expression), (res) => {
        console.log(res);
        return new StepCommand(YuNil.getInstance());
      });
    }
    visitVariable(node: Variable): ExecutionCommand {
      const name = node.identifier.value;
      return new BindCommand(this.evaluate(node.expression), (value) => {
        this.context.define(name, value);
        return boolean(true);
      });
    }
    visitAssignment(node: Assignment): ExecutionCommand {
      if (!this.context.config.mutability) {
        return new FailCommand(
          new InterpreterError(
            "Assignment",
            `Cannot reassign variable '${node.identifier.value}': mutability is disabled`,
          ),
        );
      }

      const name = node.identifier.value;
      return new BindCommand(this.evaluate(node.expression), (value) => {
        const onReplace = (scope: Environment) => {
          if (scope.has("self")) {
            const self = scope.get("self");
            if (self instanceof RuntimeObject && self.fields.has(name))
              self.fields.set(name, value);
          }
        };

        if (!this.context.replace(name, value, onReplace))
          return new FailCommand(
            new InterpreterError(
              "Assignment",
              `Cannot assign to undefined variable: ${name}`,
            ),
          );

        return new StepCommand(value);
      });
    }

    visitQuery(node: Query): ExecutionCommand {
      return getLogicEngine(this, this.context).solveQuery(node);
    }
    visitAttribute(node: Attribute): ExecutionCommand {
      const name = node.identifier.value;
      return new BindCommand(this.evaluate(node.expression), (value) => {
        this.context.define(name, value);
        return boolean(true);
      });
    }
    visitObject(node: Object): ExecutionCommand {
      const identifier = node.identifier.value;
      const collector = new OOPCollector(this.context);
      node.expression.accept(collector);

      const fields = collector.collectedFields;
      const methods = collector.collectedMethods;

      const extendsSymbol = (node as any).extendsSymbol?.value;
      if (extendsSymbol) {
        const classDef = this.context.lookup(extendsSymbol);
        if (classDef && classDef instanceof RuntimeClass) {
          const classFields = getClassFields(classDef, this.context);
          for (const [k, v] of classFields.entries()) {
            if (!fields.has(k)) {
              fields.set(k, v);
            }
          }
        }
      }

      const runtimeObject = new RuntimeObject(
        identifier,
        extendsSymbol || "",
        fields,
        methods,
      );

      const extendsArgs = (node as any).extendsArgs || [];
      const evaluateArgs = (index: number): ExecutionCommand => {
        if (index >= extendsArgs.length) {
          this.context.define(identifier, runtimeObject);
          return new StepCommand(runtimeObject);
        }
        const arg = extendsArgs[index];
        if (
          arg instanceof NamedArgument ||
          arg.constructor.name === "NamedArgument"
        ) {
          const fieldName = (arg as any).identifier.value;
          return new BindCommand(
            this.evaluate((arg as any).expression),
            (val) => {
              runtimeObject.setField(fieldName, val);
              return evaluateArgs(index + 1);
            },
          );
        }
        return evaluateArgs(index + 1);
      };

      const evaluateClassInitializers = (
        classDef: RuntimeClass,
        keys: string[],
        keyIndex: number,
      ): ExecutionCommand => {
        if (keyIndex >= keys.length) {
          return evaluateArgs(0);
        }
        const key = keys[keyIndex];
        if (collector.fieldInitializers.has(key)) {
          return evaluateClassInitializers(classDef, keys, keyIndex + 1);
        }
        const expr = classInitializers.get(key);
        return new BindCommand(this.evaluate(expr), (val) => {
          runtimeObject.setField(key, val);
          return evaluateClassInitializers(classDef, keys, keyIndex + 1);
        });
      };

      let classInitializers: Map<string, any> = new Map();
      let classInitializerKeys: string[] = [];
      if (extendsSymbol) {
        const classDef = this.context.lookup(extendsSymbol);
        if (classDef && classDef instanceof RuntimeClass) {
          classInitializers = getClassInitializers(classDef, this.context);
          classInitializerKeys = Array.from(classInitializers.keys());
          return evaluateClassInitializers(classDef, classInitializerKeys, 0);
        }
      }

      return evaluateArgs(0);
    }
    visitLogicConstraint(node: LogicConstraint): ExecutionCommand {
      return new BindCommand(this.evaluate(node.expression), (val) => {
        if (isTrue(val))
          return new StepCommand(
            new LogicResult([new LogicAnswer(true, new Map())]),
          );
        return new BacktrackCommand();
      });
    }
  };
}
