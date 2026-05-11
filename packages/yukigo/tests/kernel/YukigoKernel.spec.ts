import { expect } from "chai";
import { YukigoKernel } from "../../src/interpreter/components/kernel";
import { EvalCommand, ExecutionCommand, FailCommand, StepCommand } from "../../src/interpreter/components/kernel/commands";

describe("YukigoKernel", () => {
  class MockEvaluator {
    evaluate(node: any, cont: any): ExecutionCommand {
      return new StepCommand(node.mockValue, cont);
    }
  }

  let kernel: YukigoKernel;

  beforeEach(() => {
    kernel = new YukigoKernel(new MockEvaluator());
  });

  it("must execute a StepCommand and end", () => {
    const command = new StepCommand(42);
    const result = kernel.run(command);

    expect(result).to.eq(42);
    expect(kernel.getLogicalTrace().length).to.eq(1);
    expect(kernel.getLogicalTrace()[0].name).to.eq("STEP");
  });

  it("must chain multiple commands via Continuations", () => {
    const command = new StepCommand(10, (a) => {
      return new StepCommand(5, (b) => {
        return new StepCommand((a as number) + (b as number), (sum) => {
          return new StepCommand((sum as number) * 2);
        });
      });
    });

    const result = kernel.run(command);

    expect(result).to.eq(30);
    expect(kernel.getLogicalTrace().length).to.eq(4);
  });

  it("must delegate EvalCommand to injected Evaluator", () => {
    const dummyNode = { type: "Dummy", mockValue: 99 } as any;

    const command = new EvalCommand(dummyNode, (val) => {
      return new StepCommand((val as number) + 1); // 99 + 1
    });

    const result = kernel.run(command);

    expect(result).to.eq(100);
    expect(kernel.getLogicalTrace().length).to.eq(3);
  });

  it("must abort execution if FailCommand is raised", () => {
    const command = new StepCommand(1, () => {
      return new FailCommand(new Error("Fallo simulado"));
    });

    expect(() => kernel.run(command)).to.throw(
      "[Yukigo VM Error] Fallo simulado",
    );
  });

  it("must not overflow with deep recursive steps (50000 iterations)", () => {
    const iteraciones = 50000;

    const recursiveStep = (count: number): ExecutionCommand => {
      if (count === 0) return new StepCommand("fin");
      return new StepCommand(count, () => recursiveStep(count - 1));
    };

    const result = kernel.run(recursiveStep(iteraciones));

    expect(result).to.eq("fin");
    expect(kernel.getLogicalTrace().length).to.eq(iteraciones + 1);
  });
});
