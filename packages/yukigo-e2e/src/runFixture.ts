import { Analyzer, Tester, MulangAdapter, type AnalysisResult, type TestReport } from "yukigo";
import { ExerciseFixture } from "./types.js";
import { GuideConfig } from "./guides.js";
import {
  extractIndividualTests,
  prepareSubjectCode,
  prepareTestCode,
} from "./prepareCode.js";
import { createWollokTestConfig } from "yukigo-wollok-parser";

const mulangAdapter = new MulangAdapter();

export interface ExecutionResult {
  analysis: AnalysisResult[];
  testReports: TestReport[];
}

export function runFixture(
  fixture: ExerciseFixture,
  guideFixtures: ExerciseFixture[],
  index: number,
  guideConfig: GuideConfig,
  analyzer: Analyzer,
): ExecutionResult {
  if (!fixture.solution) return { analysis: [], testReports: [] };
  // Step 1: static analysis — student solution alone, no extras
  const studentAst = guideConfig.studentParser.parse(fixture.solution);
  const expectations = Array.isArray(fixture.expectations)
    ? (fixture.expectations as any[])
    : typeof fixture.expectations === "string"
    ? mulangAdapter.translateMulangExpectations(fixture.expectations)
    : [];

  const analysis = analyzer.analyze(studentAst as any, expectations);

  // Step 2: dynamic tests — full code (guide extras + resolved templates + solution)
  const subjectCode = prepareSubjectCode(
    fixture,
    guideFixtures,
    index,
    guideConfig,
  );
  const subjectAst = guideConfig.parser.parse(subjectCode);

  const testCode = prepareTestCode(fixture, guideFixtures, index, guideConfig);
  const testReports: TestReport[] = [];

  if (testCode.trim()) {
    const testsAst = guideConfig.studentParser.parse(testCode);
    const testNodes = extractIndividualTests(testsAst);
    const testsHooks =
      fixture.language === "wollok" ? createWollokTestConfig(testsAst) : null;
    const config = {
      ...guideConfig.interpreterConfig,
      hooks:
        guideConfig.interpreterConfig.hooks && testsHooks
          ? [
              {
                ...guideConfig.interpreterConfig.hooks[0],
                beforeEachTest: testsHooks.beforeEachTest,
              },
            ]
          : [],
    };

    for (const node of testNodes) {
      const tester = new Tester([...subjectAst, ...testsAst], config);
      testReports.push(...tester.test([node] as any));
    }
  }

  return { analysis, testReports };
}
