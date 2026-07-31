// scripts/migrate-fixtures.ts
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { MulangAdapter } from 'yukigo';
import { ExerciseFixtureSchema, type ExerciseFixture } from '../src/types';

const SOURCE_DIR = '../../exercises-tests/output'; // adjust if you've moved it
const TARGET_DIR = './fixtures';
const mulangAdapter = new MulangAdapter();

const LANGUAGE_BY_PREFIX: Record<string, ExerciseFixture['language']> = {
  funcional: 'haskell',
  logico: 'prolog',
  objetos: 'wollok',
};

function detectLanguage(filename: string): ExerciseFixture['language'] {
  const prefix = Object.keys(LANGUAGE_BY_PREFIX).find((p) => filename.includes(p));
  if (!prefix) throw new Error(`Cannot infer language from filename: ${filename}`);
  return LANGUAGE_BY_PREFIX[prefix];
}

// group by (language, guideId), preserving source order within each group
const byLanguageAndGuide = new Map<string, ExerciseFixture[]>();
const skipped: { id: number; reason: string }[] = [];

for (const file of readdirSync(SOURCE_DIR)) {
  if (!file.endsWith('.json')) continue;
  const language = detectLanguage(file);
  const raw = JSON.parse(readFileSync(join(SOURCE_DIR, file), 'utf-8'));

  for (const c of raw) {
    let expectations;
    try {
      expectations = mulangAdapter.translateMulangExpectations(c.expectations ?? '');
    } catch (err) {
      skipped.push({ id: c.id, reason: (err as Error).message });
      continue;
    }

    const fixture: ExerciseFixture = {
      id: c.id,
      guideId: c.guide_id,
      lesson: c.name,
      language,
      solution: c.solution,
      extra: c.extra ?? null,
      test: c.test ?? null,
      expectations,
    };
    ExerciseFixtureSchema.parse(fixture); // fail fast on malformed data

    const key = `${language}/guide-${fixture.guideId}`;
    if (!byLanguageAndGuide.has(key)) byLanguageAndGuide.set(key, []);
    byLanguageAndGuide.get(key)!.push(fixture); // push in source order — no sort
  }
}

if (skipped.length) {
  console.warn(`Skipped ${skipped.length} malformed expectation entries:`, skipped);
}

for (const [key, fixtures] of byLanguageAndGuide) {
  const outPath = join(TARGET_DIR, `${key}.json`);
  mkdirSync(join(outPath, '..'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(fixtures, null, 2));
  console.log(`wrote ${outPath} (${fixtures.length} cases)`);
}