#! /usr/bin/env node
import { program } from "commander";
import { input } from "@inquirer/prompts";
import { createProject } from "./utils.js";

program
  .version("1.0.0")
  .description("An initializer for new yukigo parser projects.");

const name = await input({ message: `Project Name:` });
const projectName = `yukigo-${name}-parser`;

createProject(projectName);
