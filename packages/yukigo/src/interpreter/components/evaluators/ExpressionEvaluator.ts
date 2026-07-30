import {
  Application,
  Call,
  CompositionExpression,
  ConsExpression,
  DataExpression,
  Exist,
  ExpressionVisitor,
  FieldExpression,
  Findall,
  Forall,
  Goal,
  GuardedExpression,
  Lambda,
  LetInExpression,
  ListComprehension,
  NamedArgument,
  New,
  Not,
  Generator as YuGenerator,
  Otherwise,
  RangeExpression,
  Send,
  SymbolPrimitive,
  TupleExpression,
  Expression,
  Return,
  Sequence,
  Super,
  UnguardedBody,
  VariablePattern,
  TypeCast,
} from "yukigo-ast";
import {
  BindCommand,
  ExecutionCommand,
  FailCommand,
  RaiseCommand,
  StepCommand,
} from "../kernel/commands.js";
import { Constructor, EvaluatorBase } from "./BaseEvaluator.js";
import { InterpreterError } from "../../errors.js";
import {
  YuArray,
  YuValue,
  EquationRuntime,
  RuntimeClass,
  RuntimeFunction,
} from "../../primitives/index.js";
import { boolean, EnvStack, error, isTrue, raise } from "../../utils.js";
import { EnvBuilderVisitor } from "../EnvBuilder.js";
import {
  getClassFields,
  getClassInitializers,
  getLogicEngine,
} from "./utils.js";

export function ExpressionEvaluator<TBase extends Constructor<EvaluatorBase>>(
  Base: TBase,
) {
  return class
    extends Base
    implements Partial<ExpressionVisitor<ExecutionCommand>>
  {
    visitTupleExpr(node: TupleExpression): ExecutionCommand {
      const results: YuValue[] = [];
      const evaluateNext = (index: number): ExecutionCommand => {
        if (index >= node.elements.length)
          return new StepCommand(new YuArray(results));
        return new BindCommand(this.evaluate(node.elements[index]), (val) => {
          results.push(val);
          return evaluateNext(index + 1);
        });
      };
      return evaluateNext(0);
    }
    visitFieldExpression(node: FieldExpression): ExecutionCommand {
      return new BindCommand(this.evaluate(node.name), (obj) => {
        return new StepCommand(
          this.context.objRuntime.getField(obj, node.name.value),
        );
      });
    }
    visitDataExpr(node: DataExpression): ExecutionCommand {
      const fieldValues = new Map<string, YuValue>();

      const evaluateFields = (index: number): ExecutionCommand => {
        if (index >= node.contents.length) {
          const identifier = node.name.value;
          const classDef = new RuntimeClass(
            identifier,
            fieldValues,
            new Map(),
            [],
          );
          return new StepCommand(classDef.instantiate(identifier));
        }
        const field = node.contents[index];
        return new BindCommand(this.evaluate(field.expression), (value) => {
          fieldValues.set(field.name.value, value);
          return evaluateFields(index + 1);
        });
      };

      return evaluateFields(0);
    }
    visitConsExpr(node: ConsExpression): ExecutionCommand {
      return this.context.lazyRuntime.evaluateCons(node, this);
    }
    visitLetInExpr(node: LetInExpression): ExecutionCommand {
      const oldEnv = this.context.env;
      this.context.pushEnv();
      const envBuilder = new EnvBuilderVisitor(this.context);
      node.declarations.accept(envBuilder);
      return new BindCommand(this.evaluate(node.expression), (result) => {
        this.context.env = oldEnv;
        return new StepCommand(result);
      });
    }
    visitCall(node: Call): ExecutionCommand {
      return new BindCommand(this.evaluate(node.callee), (callee) => {
        const args: YuValue[] = [];
        const evaluateArgs = (index: number): ExecutionCommand => {
          if (index < node.args.length)
            return new BindCommand(this.evaluate(node.args[index]), (val) => {
              args.push(val);
              return evaluateArgs(index + 1);
            });

          if (!(callee instanceof RuntimeFunction))
            return new FailCommand(
              new InterpreterError("Call", "Target is not a function"),
            );

          return this.context.funcRuntime.apply(callee, args);
        };
        return evaluateArgs(0);
      });
    }
    visitOtherwise(node: Otherwise): ExecutionCommand {
      return boolean(true);
    }
    visitCompositionExpression(node: CompositionExpression): ExecutionCommand {
      return new BindCommand(this.evaluate(node.left), (f) => {
        return new BindCommand(this.evaluate(node.right), (g) => {
          if (
            !(f instanceof RuntimeFunction) ||
            !(g instanceof RuntimeFunction)
          ) {
            return new FailCommand(
              new InterpreterError(
                "Composition",
                "Both operands of (.) must be functions",
              ),
            );
          }

          const F_REF = "__internal_f";
          const G_REF = "__internal_g";
          const PARAM_NAME = "__x";

          const compositionBody = new Application(
            new SymbolPrimitive(F_REF),
            new Application(
              new SymbolPrimitive(G_REF),
              new SymbolPrimitive(PARAM_NAME),
            ),
          );

          const patterns = [
            new VariablePattern(new SymbolPrimitive(PARAM_NAME)),
          ];
          const equation: EquationRuntime = {
            patterns,
            body: new UnguardedBody(
              new Sequence([new Return(compositionBody)]),
            ),
          };

          const privateScope = new Map<string, YuValue>();
          privateScope.set(F_REF, f);
          privateScope.set(G_REF, g);

          const capturedEnv: EnvStack = {
            head: privateScope,
            tail: this.context.env,
          };
          const func = new RuntimeFunction(
            1,
            [equation],
            `<(${f.identifier} . ${g.identifier})>`,
            [],
            capturedEnv,
          );
          return new StepCommand(func);
        });
      });
    }

    visitLambda(node: Lambda): ExecutionCommand {
      const patterns = node.parameters;
      const equation: EquationRuntime = {
        patterns,
        body: new UnguardedBody(new Sequence([new Return(node.body)])),
      };
      const func = new RuntimeFunction(
        patterns.length,
        [equation],
        "<lambda>",
        [],
        this.context.env,
      );
      return new StepCommand(func);
    }
    public visitGuardedExpression(expr: GuardedExpression): ExecutionCommand {
      const tryNextGuard = (guardIndex: number): ExecutionCommand => {
        if (guardIndex >= expr.guards.length) {
          return new RaiseCommand(
            new InterpreterError(
              "PatternMatch",
              "Non-exhaustive guards in equation: the pattern matched but no guard succeeded.",
            ),
          );
        }

        const guard = expr.guards[guardIndex];
        return new BindCommand(this.evaluate(guard.condition), (cond) => {
          if (!isTrue(cond)) return tryNextGuard(guardIndex + 1);
          return this.evaluate(guard.body);
        });
      };

      return tryNextGuard(0);
    }
    visitApplication(node: Application): ExecutionCommand {
      const { funcRuntime } = this.context;
      return new BindCommand(this.evaluate(node.functionExpr), (func) => {
        if (!(func instanceof RuntimeFunction)) {
          return new FailCommand(
            new InterpreterError("Application", "Cannot apply non-function"),
          );
        }

        const applyFuncToNode = (func: RuntimeFunction): ExecutionCommand =>
          new BindCommand(this.evaluate(node.parameter), (arg) => {
            return funcRuntime.applyArguments(func, [() => arg]);
          });

        if (func.arity === 0) {
          return new BindCommand(
            funcRuntime.applyArguments(func),
            (resultOfFunc) => {
              if (!(resultOfFunc instanceof RuntimeFunction))
                return new FailCommand(
                  new InterpreterError(
                    "Application",
                    "Cannot apply non-function result of arity-0 function",
                  ),
                );
              return applyFuncToNode(resultOfFunc);
            },
          );
        }

        return applyFuncToNode(func);
      });
    }
    visitExist(node: Exist): ExecutionCommand {
      return getLogicEngine(this, this.context).solveGoalLike(node);
    }

    visitNot(node: Not): ExecutionCommand {
      return getLogicEngine(this, this.context).solveNot(node);
    }
    visitFindall(node: Findall): ExecutionCommand {
      return getLogicEngine(this, this.context).solveFindall(node);
    }
    visitForall(node: Forall): ExecutionCommand {
      return getLogicEngine(this, this.context).solveForall(node);
    }

    visitGoal(node: Goal): ExecutionCommand {
      return getLogicEngine(this, this.context).solveGoalLike(node);
    }
    visitSend(node: Send): ExecutionCommand {
      if (node.receiver instanceof Super) {
        const methodName = node.selector.value;
        const args: YuValue[] = [];
        const evaluateNextArg = (index: number): ExecutionCommand => {
          if (index >= node.args.length) {
            try {
              return this.context.objRuntime.dispatchSuper(methodName, args);
            } catch (error: any) {
              if (error instanceof InterpreterError) {
                const mappedErrors = this.context.dispatchHook(
                  "onInterpreterError",
                  error,
                  this.context,
                );
                const userException = mappedErrors.find(
                  (res: any) => res !== undefined && res !== null,
                );
                return new RaiseCommand((userException as any) || error);
              }
              return new RaiseCommand(
                new InterpreterError("RuntimeError", String(error)),
              );
            }
          }
          return new BindCommand(this.evaluate(node.args[index]), (val) => {
            args.push(val);
            return evaluateNextArg(index + 1);
          });
        };
        return evaluateNextArg(0);
      }

      return new BindCommand(this.evaluate(node.receiver), (receiver) => {
        const methodName = node.selector.value;
        const args: YuValue[] = [];
        const evaluateNextArg = (index: number): ExecutionCommand => {
          if (index >= node.args.length) {
            try {
              return this.context.objRuntime.dispatch(
                receiver,
                methodName,
                args,
              );
            } catch (error: any) {
              if (error instanceof InterpreterError) {
                const mappedErrors = this.context.dispatchHook(
                  "onInterpreterError",
                  error,
                  this.context,
                );
                const userException = mappedErrors.find(
                  (res) => res !== undefined && res !== null,
                );
                return new RaiseCommand((userException as any) || error);
              }
              return new RaiseCommand(
                new InterpreterError("RuntimeError", String(error)),
              );
            }
          }
          return new BindCommand(this.evaluate(node.args[index]), (val) => {
            args.push(val);
            return evaluateNextArg(index + 1);
          });
        };
        return evaluateNextArg(0);
      });
    }

    visitNew(node: New): ExecutionCommand {
      const className = node.identifier.value;
      const classDef = this.context.lookup(className);
      if (!(classDef instanceof RuntimeClass))
        return new FailCommand(
          new InterpreterError("New", `${className} is not a class.`),
        );

      const instance = classDef.instantiate(node.identifier.value);
      instance.fields = getClassFields(classDef, this.context);

      const evaluateArgs = (index: number): ExecutionCommand => {
        if (index >= node.args.length) {
          return new StepCommand(instance);
        }
        const arg = node.args[index];
        if (
          arg instanceof NamedArgument ||
          arg.constructor.name === "NamedArgument"
        ) {
          const fieldName = (arg as any).identifier.value;
          return new BindCommand(
            this.evaluate((arg as any).expression),
            (val) => {
              instance.setField(fieldName, val);
              return evaluateArgs(index + 1);
            },
          );
        }
        return evaluateArgs(index + 1);
      };

      const initializers = getClassInitializers(classDef, this.context);
      const initializerKeys = Array.from(initializers.keys());

      const evaluateInitializers = (keyIndex: number): ExecutionCommand => {
        if (keyIndex >= initializerKeys.length) {
          return evaluateArgs(0);
        }
        const key = initializerKeys[keyIndex];
        const expr = initializers.get(key);
        return new BindCommand(this.evaluate(expr), (val) => {
          instance.setField(key, val);
          return evaluateInitializers(keyIndex + 1);
        });
      };

      return evaluateInitializers(0);
    }

    visitListComprehension(node: ListComprehension): ExecutionCommand {
      const results: YuValue[] = [];

      const process = (index: number): ExecutionCommand => {
        if (index >= node.generators.length) {
          return new BindCommand(this.evaluate(node.projection), (proj) => {
            results.push(proj);
            return new StepCommand(new YuArray(results));
          });
        }

        const current = node.generators[index];

        if (current instanceof YuGenerator) {
          return new BindCommand(
            this.evaluate(current.expression),
            (exprResult) => {
              return new BindCommand(
                this.context.lazyRuntime.realizeList(exprResult),
                (sourceListVal) => {
                  const sourceList = sourceListVal.asSequence;
                  if (!(sourceList instanceof YuArray))
                    return raise(
                      error(
                        "visitListComprehension",
                        `Error expected YuArray and got ${sourceListVal.getType()}`,
                      ),
                    );
                  const iterateSource = (
                    sourceIndex: number,
                  ): ExecutionCommand => {
                    if (sourceIndex >= sourceList.items.length)
                      return new StepCommand(new YuArray(results));

                    const item = sourceList.at(sourceIndex);
                    const varName = current.variable.value;
                    this.context.define(varName, item);

                    return process(index + 1);
                  };
                  return iterateSource(0);
                },
              );
            },
          );
        } else {
          return new BindCommand(
            this.evaluate(current as Expression),
            (condition) => {
              return isTrue(condition)
                ? process(index + 1)
                : new StepCommand(new YuArray(results));
            },
          );
        }
      };

      this.context.pushEnv();
      return process(0);
    }
    visitGenerator(node: YuGenerator): ExecutionCommand {
      return this.evaluate(node.expression);
    }
    visitRangeExpression(node: RangeExpression): ExecutionCommand {
      return this.context.lazyRuntime.evaluateRange(node, this);
    }
    visitTypeCast(node: TypeCast): ExecutionCommand {
      return node.expression.accept(this);
    }
  };
}
