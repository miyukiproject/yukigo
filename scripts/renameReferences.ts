import * as fs from "fs";
import * as path from "path";

const AST_DIR = path.resolve(
  __dirname,
  "../apps/yukigo-docs/docs/ast"
);

function processDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      // rename the file
      let currentFilePath = fullPath;
      if (entry.name.startsWith("index.") && entry.name !== "index.md") {
        const newName = entry.name.replace(/^index\./, "");
        const newPath = path.join(dir, newName);

        fs.renameSync(fullPath, newPath);
        currentFilePath = newPath; // Update path for Step 2
        console.log(`Renamed: ${entry.name} -> ${newName}`);
      }

      // fix dead links inside the files
      let content = fs.readFileSync(currentFilePath, "utf-8");
      const fixedContent = content.replace(/index\.([A-Z])/g, "$1");

      if (content !== fixedContent) {
        fs.writeFileSync(currentFilePath, fixedContent, "utf-8");
      }
    }
  }
}

console.log("Cleaning TypeDoc filenames and links...");
processDirectory(AST_DIR);
console.log("Done!");
