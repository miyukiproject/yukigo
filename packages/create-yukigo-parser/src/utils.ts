import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import fse from "fs-extra";
import path from "path";

const __dirname = import.meta.dirname;
const TEMPLATE_DIR = path.join(__dirname, "..", "template");
const INDEX_TEMPLATE_PATH = path.join("src", "index.ts");
const TEST_TEMPLATE_PATH = path.join("tests", "parser.spec.ts");
const CLASS_PLACEHOLDER = "YukigoParserPlaceholder";

export const runCommand = (
  command: string,
  cwd: string,
  loadingMessage: string
) => {
  console.log(loadingMessage);
  try {
    execSync(command, { stdio: "inherit", cwd });
  } catch (error) {
    console.error(`\nFailed to execute command: ${command}`);
    // Exit process immediately on critical failure
    process.exit(1);
  }
};

export function isEmpty(path: string) {
  return readdirSync(path).length === 0;
}

const toPascalCase = (str: string): string => {
  // First, replace non-alphanumeric separators (like hyphens, underscores) with a capitalized letter.
  let pascal = str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());

  // Then, ensure the very first letter is also capitalized.
  return pascal.charAt(0).toUpperCase() + pascal.slice(1);
};

export async function replaceInFile(
  path: string,
  search: string,
  replace: string
) {
  let content = await fse.readFile(path, "utf-8");
  const regex = new RegExp(`${search}`, "g");
  content = content.replace(regex, replace);
  await fse.writeFile(path, content);
}

export const createProject = async (projectName: string) => {
  const targetDir = path.resolve(projectName);

  console.log(
    `\n✨ Starting project setup for: ${chalk.bold.blue(projectName)}`
  );

  // Directory Validation
  if (fse.existsSync(targetDir)) {
    console.error(`\n❌ Error: Directory '${projectName}' already exists.`);
    process.exit(1);
  }

  // Copy Template Files
  console.log(`\n📁 Setting up project in ${targetDir}...`);
  try {
    await fse.copy(TEMPLATE_DIR, targetDir);
  } catch (error) {
    console.error("\n❌ Failed to copy template files:", error);
    process.exit(1);
  }

  // Update package.json
  const packageJsonPath = path.join(targetDir, "package.json");
  try {
    const packageJson = await fse.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fse.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  } catch (error) {
    console.error("\n❌ Failed to update package.json:", error);
    process.exit(1);
  }

  const projectNamePascal = toPascalCase(projectName);
  const templateIndexPath = path.join(targetDir, INDEX_TEMPLATE_PATH);
  const templateTestPath = path.join(targetDir, TEST_TEMPLATE_PATH);

  try {
    await replaceInFile(
      templateIndexPath,
      CLASS_PLACEHOLDER,
      projectNamePascal
    );
    await replaceInFile(templateTestPath, CLASS_PLACEHOLDER, projectNamePascal);
  } catch (error) {
    console.error("\n❌ Failed to update class name:", error);
    process.exit(1);
  }

  console.log("✅ Initial project setted up correctly.");

  // Initialize git if confirmed
  const initGitRepo = await confirm({
    message: `Do you want to initialize a git repository with the name '${projectName}'?`,
  });
  if (initGitRepo) {
    runCommand("git init", targetDir, "\n🌱 Initializing Git repository...");
    console.log("✅ Git repository initialized.");
  }

  const runInstall = await confirm({
    message: `Do you want to install dependencies automatically?`,
  });
  // install deps if confirmed
  if (runInstall) {
    runCommand(
      "npm install",
      targetDir,
      "\n📦 Installing dependencies (this may take a minute)..."
    );
    console.log("✅ Dependencies installed.");
  }

  // 6. Success Message
  const successMsg = `${chalk.bold.green("Success!")} Project ${chalk.bold.blue(
    projectName
  )} is ready.`;

  console.log("\n" + "-".repeat(successMsg.length));
  console.log(successMsg);
  console.log("-".repeat(successMsg.length));
  console.log("\nNext steps:");
  console.log(`1. ${chalk.bold(`cd ${projectName}`)}`);
  console.log(
    `2. Start coding: ${chalk.bold("npm start")} (or ${chalk.bold(
      "npm run build"
    )})`
  );
  console.log("\nHappy parsing! :)");
};
