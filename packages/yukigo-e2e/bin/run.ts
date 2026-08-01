import { spawnSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('language', { alias: 'l', type: 'string', choices: ['haskell', 'prolog', 'wollok'] })
  .option('guide', { alias: 'g', type: 'number' })
  .option('lesson', { type: 'string' })
  .option('exercise', { alias: 'e', type: 'number' })
  .help()
  .parseSync();

const env = { ...process.env };
if (argv.language) env.YUKIGO_E2E_LANGUAGE = argv.language;
if (argv.guide !== undefined) env.YUKIGO_E2E_GUIDE = String(argv.guide);
if (argv.lesson) env.YUKIGO_E2E_LESSON = argv.lesson;
if (argv.exercise !== undefined) env.YUKIGO_E2E_EXERCISE = String(argv.exercise);

const result = spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', env, shell: true });

if (result.error) {
  console.error('Failed to spawn vitest:', result.error);
}

process.exit(result.status ?? 1);