import { RuntimeClass, YuValue } from "../../primitives/index.js";
import { LogicEngine } from "../logic/LogicEngine.js";
import { RuntimeContext } from "../RuntimeContext.js";
import { EvaluatorBase } from "./BaseEvaluator.js";

export const getLogicEngine = (
  evaluator: EvaluatorBase,
  ctx: RuntimeContext,
): LogicEngine => new LogicEngine(evaluator, ctx);

export const getClassInitializers = (
  classDef: RuntimeClass,
  ctx: RuntimeContext,
): Map<string, any> => {
  const initializers = new Map<string, any>();
  const collect = (c: RuntimeClass) => {
    if (c.superclass) {
      const superDef = ctx.lookup(c.superclass);
      if (superDef && superDef instanceof RuntimeClass) {
        collect(superDef);
      }
    }
    for (const mixin of c.mixins) {
      const mixinDef = ctx.lookup(mixin);
      if (mixinDef && mixinDef instanceof RuntimeClass) {
        collect(mixinDef);
      }
    }
    const cInitializers = c.fieldInitializers;
    if (cInitializers) {
      for (const [k, v] of cInitializers.entries()) {
        initializers.set(k, v);
      }
    }
  };
  collect(classDef);
  return initializers;
};

export const getClassFields = (
  classDef: RuntimeClass,
  ctx: RuntimeContext,
): Map<string, YuValue> => {
  const fields = new Map<string, YuValue>();
  const collect = (c: RuntimeClass) => {
    if (c.superclass) {
      const superDef = ctx.lookup(c.superclass);
      if (superDef && superDef instanceof RuntimeClass) {
        collect(superDef);
      }
    }
    for (const mixin of c.mixins) {
      const mixinDef = ctx.lookup(mixin);
      if (mixinDef && mixinDef instanceof RuntimeClass) {
        collect(mixinDef);
      }
    }
    for (const [k, v] of c.fields.entries()) {
      fields.set(k, v);
    }
  };
  collect(classDef);
  return fields;
};