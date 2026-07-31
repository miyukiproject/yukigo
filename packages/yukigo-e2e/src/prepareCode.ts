import { GuideConfig } from "./guides.js";
import { ExerciseFixture } from "./types.js";

function resolveTemplates(
  template: string,
  guideFixtures: ExerciseFixture[],
  index: number,
): string {
  return template
    .replace(
      /\/\*\.\.\.previousSolution\.\.\.\*\//g,
      guideFixtures[index - 1]?.solution ?? "",
    )
    .replace(
      /\/\*\.\.\.solution\[([+-]?\d+)\]\.\.\.\*\//g,
      (_match, val: string) => {
        const n = parseInt(val, 10);
        const targetIdx =
          val.startsWith("-") || val.startsWith("+") ? index + n : n - 1;
        return guideFixtures[targetIdx]?.solution ?? "";
      },
    );
}

export function prepareSubjectCode(
  fixture: ExerciseFixture,
  guideFixtures: ExerciseFixture[],
  index: number,
  guideConfig: GuideConfig,
): string {
  const resolvedExtra = resolveTemplates(
    fixture.extra ?? "",
    guideFixtures,
    index,
  );
  const base = resolvedExtra
    ? `${resolvedExtra}\n${fixture.solution}`
    : fixture.solution;
  const guideExtras = guideConfig.extrasByGuide?.[fixture.guideId];
  const withGuideExtras = guideExtras ? `${guideExtras}\n${base}` : base;
  return (
    guideConfig.postProcessSubject?.(withGuideExtras, fixture.guideId) ??
    withGuideExtras
  );
}

export function prepareTestCode(
  fixture: ExerciseFixture,
  guideFixtures: ExerciseFixture[],
  index: number,
  guideConfig: GuideConfig,
): string {
  if (!fixture.test) return "";
  const rawExtra = resolveTemplates(fixture.extra ?? "", guideFixtures, index);

  let testCode = fixture.test
    .replaceAll("/*...extra...*/", rawExtra)
    .replaceAll("//...extra...", rawExtra);

  testCode = fixture.solution
    ? testCode
        .replaceAll("/*...content...*/", fixture.solution)
        .replaceAll("//...content...", fixture.solution)
    : testCode;

  const guideExtras = guideConfig.extrasByGuide?.[fixture.guideId];
  testCode = guideExtras ? `${guideExtras}\n${testCode}` : testCode;

  return guideConfig.postProcessTest?.(testCode, fixture.guideId) ?? testCode;
}

export function extractIndividualTests(testsAst: unknown): unknown[] {
  if (Array.isArray(testsAst)) return testsAst;
  if (testsAst && typeof testsAst === "object") {
    if ("members" in testsAst)
      return (testsAst as { members: unknown[] }).members; // TestGroup
    if ("statements" in testsAst)
      return (testsAst as { statements: unknown[] }).statements; // Sequence
  }
  return [testsAst];
}
