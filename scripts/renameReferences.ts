import * as fs from "fs";
import * as path from "path";

const AST_DIR = path.resolve(__dirname, "../apps/yukigo-docs/docs/ast");
function cleanFilenames(dir: string) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanFilenames(fullPath);
    } else if (
      entry.isFile() &&
      entry.name.startsWith("index.") &&
      entry.name.endsWith(".md")
    ) {
      if (entry.name === "index.md") continue;

      const newName = entry.name.replace(/^index\./, "");
      const newPath = path.join(dir, newName);

      fs.renameSync(fullPath, newPath);
    }
  }
}

console.log("Cleaning TypeDoc filenames...");
cleanFilenames(AST_DIR);
console.log("Fixed filenames!");
