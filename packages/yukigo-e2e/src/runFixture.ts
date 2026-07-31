// src/runFixture.ts
import { Analyzer, Tester, type AnalysisResult, type TestReport } from "yukigo";
import { ExerciseFixture } from "./types.js";
import { GuideConfig } from "./guides.js";
import {
  extractIndividualTests,
  prepareSubjectCode,
  prepareTestCode,
} from "./prepareCode.js";
import { createWollokTestConfig } from "yukigo-wollok-parser";

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
  const analysis = analyzer.analyze(studentAst as any, fixture.expectations);

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
      const tester = new Tester(subjectAst, config);
      testReports.push(...tester.test([node] as any));
    }
  }

  return { analysis, testReports };
}
