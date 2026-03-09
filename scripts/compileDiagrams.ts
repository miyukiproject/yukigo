import { readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function findD2Files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = join(dir, entry.name);
      return entry.isDirectory() ? findD2Files(res) : res;
    })
  );
  return files.flat().filter((file) => file.endsWith('.d2'));
}

async function main() {
  // Targets the specific docs folder in your monorepo
  const targetDir = join(process.cwd(), 'apps/yukigo-docs/docs');

  try {
    const files = await findD2Files(targetDir);

    if (files.length === 0) {
      console.log('No .d2 files found. Skipping diagram compilation.');
      return;
    }

    console.log(`Compiling ${files.length} D2 diagrams...`);

    await Promise.all(
      files.map(async (file) => {
        const { dir, name } = parse(file);
        const outputPath = join(dir, `${name}.svg`);
        
        // Executes the native CLI command for each file
        await execAsync(`d2 "${file}" "${outputPath}"`);
        console.log(`✔ Generated: ${name}.svg`);
      })
    );

    console.log('Diagrams compiled successfully.');
  } catch (error) {
    console.error('\nError compiling diagrams. Ensure D2 CLI is installed and in your PATH.');
    console.error(error.message);
    process.exit(1);
  }
}

main();