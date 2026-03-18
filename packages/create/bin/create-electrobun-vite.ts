#!/usr/bin/env bun
import { listTemplates, scaffoldProject } from "../src/index";

const printUsage = () => {
  console.log("create-electrobun-vite <project-name> [--template react-ts]");
};

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

if (args.length === 0) {
  console.log("create-electrobun-vite");
  console.log("Available templates:");

  for (const template of listTemplates()) {
    console.log(`- ${template.name}: ${template.description}`);
  }

  process.exit(0);
}

const projectName = args[0];
const templateFlagIndex = args.findIndex((item) => item === "--template" || item === "-t");
const template =
  templateFlagIndex >= 0 && args[templateFlagIndex + 1]
    ? args[templateFlagIndex + 1]
    : "react-ts";

try {
  const result = await scaffoldProject({
    projectName,
    template,
  });

  console.log(`Created ${projectName} from ${result.template.name}`);
  console.log(`Location: ${result.targetDir}`);
  console.log("Next steps:");
  console.log(`  cd ${projectName}`);
  console.log("  bun install");
  console.log("  bun run dev");
} catch (error) {
  console.error(
    error instanceof Error ? `[create-electrobun-vite] ${error.message}` : error,
  );
  process.exit(1);
}
