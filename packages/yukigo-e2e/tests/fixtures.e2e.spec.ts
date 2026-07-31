// tests/fixtures.e2e.spec.ts
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { Analyzer, DefaultInspectionSet, DefaultSmellsSet } from "yukigo";
import { guideConfigs } from "../src/guides";
import { matches, filterFromEnv } from "../src/filter";
import { runFixture } from "../src/runFixture";
import type { ExerciseFixture } from "../src/types";

const FIXTURES_ROOT = join(__dirname, "../fixtures");
const filter = filterFromEnv();
const analyzer = new Analyzer({ ...DefaultInspectionSet, ...DefaultSmellsSet });

const buildMessage = (content: unknown) => JSON.stringify(content, null, 2);

for (const language of readdirSync(FIXTURES_ROOT)) {
  if (filter.language && language !== filter.language) continue;
  const guideConfig = guideConfigs[language];

  describe(language, () => {
    for (const file of readdirSync(join(FIXTURES_ROOT, language))) {
      const guideFixtures: ExerciseFixture[] = JSON.parse(
        readFileSync(join(FIXTURES_ROOT, language, file), "utf-8"),
      );

      describe(file.replace(".json", ""), () => {
        guideFixtures.forEach((fixture, index) => {
          if (!matches(fixture, filter)) return;

          it(`#${fixture.id} [${fixture.lesson}]`, () => {
            const { analysis, testReports } = runFixture(
              fixture,
              guideFixtures,
              index,
              guideConfig,
              analyzer,
            );

            const analysisFailures = analysis.filter((r) => !r.passed);
            expect(
              analysisFailures,
              buildMessage(analysisFailures),
            ).toHaveLength(0);

            const testFailures = testReports.filter(
              (r) => r.status !== "passed",
            );
            expect(testFailures, buildMessage(testFailures)).toHaveLength(0);
          });
        });
      });
    }
  });
}
