import { expect } from "chai";
import { YukigoKernel } from "../../src/interpreter/components/kernel/index.js";
import {
  BindCommand,
  EvalCommand,
  ExecutionCommand,
  FailCommand,
  StepCommand,
} from "../../src/interpreter/components/kernel/commands.js";
import {
  YuNil,
  YuNumber,
  YuString,
  YuValue,
} from "../../src/interpreter/primitives/index.js";
import { Evaluator } from "../../src/interpreter/components/evaluators/BaseEvaluator.js";

describe("YukigoKernel", () => {
  class MockEvaluator {
    evaluate(node: any): ExecutionCommand {
      return new StepCommand(node.mockValue);
    }
    getContext() {
      return {
        config: {
          outputMode: "first",
        },
      };
    }
  }

  let kernel: YukigoKernel;

  beforeEach(() => {
    kernel = new YukigoKernel(new MockEvaluator() as Evaluator);
  });

  it("must execute a StepCommand and end", () => {
    const command = new StepCommand(new YuNumber(42));
    const result = kernel.run(command) as YuNumber;

    expect(result).to.be.instanceOf(YuNumber);
    expect(result.value).to.equal(42);
    expect(kernel.getLogicalTrace().length).to.eq(1);
    expect(kernel.getLogicalTrace()[0].name).to.eq("STEP");
  });

  it("must chain multiple commands via BindCommand", () => {
    // Chain: (Step 10) -> (add 5) -> (multiply 2)
    const command = new BindCommand(
      new StepCommand(new YuNumber(10)),
      (a) =>
        new BindCommand(
          new StepCommand(new YuNumber(5)),
          (b) =>
            new BindCommand(
              a.asNumeric?.plus(b) || new StepCommand(YuNil.getInstance()),
              (sum) =>
                sum.asNumeric?.multiply(new YuNumber(2)) ||
                new StepCommand(YuNil.getInstance()),
            ),
        ),
    );

    const result = kernel.run(command) as YuNumber;

    expect(result).to.be.instanceOf(YuNumber);
    expect(result.value).to.equal(30);
  });

  it("must delegate EvalCommand to injected Evaluator", () => {
    const dummyNode = { type: "Dummy", mockValue: new YuNumber(99) } as any;

    const command = new BindCommand(
      new EvalCommand(dummyNode),
      (val) => (val as YuNumber).plus(new YuNumber(1)), // 99 + 1
    );

    const result = kernel.run(command) as YuNumber;

    expect(result).to.be.instanceOf(YuNumber);
    expect(result.value).to.equal(100);
  });

  it("must abort execution if FailCommand is raised", () => {
    const command = new BindCommand(
      new StepCommand(new YuNumber(1)),
      () => new FailCommand(new Error("Fallo simulado")),
    );

    expect(() => kernel.run(command)).to.throw(
      "[Yukigo VM Error] Fallo simulado",
    );
  });

  it("must not overflow with deep recursive steps (50000 iterations)", () => {
    const iteraciones = new YuNumber(50000);

    const recursiveStep = (count: YuNumber): ExecutionCommand => {
      if (count.equals(new YuNumber(0)))
        return new StepCommand(new YuString("fin"));
      return new BindCommand(new StepCommand(count), () =>
        recursiveStep(count.minus(new YuNumber(1)) as any),
      );
    };

    const result = kernel.run(recursiveStep(iteraciones)) as YuValue;

    expect(result).to.be.instanceOf(YuString);
    expect((result as YuString).value).to.equal("fin");
  });
});
