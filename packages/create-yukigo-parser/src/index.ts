#! /usr/bin/env node
import { program } from "commander";
import { input } from "@inquirer/prompts";
import { createProject } from "./utils.js";

program
  .version("1.0.0")
  .description("An initializer for new yukigo parser projects.");

const name = await input({ message: `Project Name:` });
const projectName = `yukigo-${name}-parser`;

console.log("Template: Nearley (default)");
console.log(
  "Tip: the generated README explains how to adapt the scaffold to Chevrotain or Ohm.js."
);

createProject(projectName);
