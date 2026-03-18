import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import colors from "picocolors";
import { PACKAGE_VERSION, starterDependencyVersions } from "./metadata";
import { createToolLogger } from "./logger";

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type ManagedDependency = {
  name: string;
  version: string;
  section: "dependencies" | "devDependencies";
};

const managedDependencies: ManagedDependency[] = [
  { name: "@nova-infra/electrobun-vite", version: PACKAGE_VERSION, section: "devDependencies" },
  { name: "electrobun", version: starterDependencyVersions.electrobun, section: "dependencies" },
  { name: "react", version: starterDependencyVersions.react, section: "dependencies" },
  { name: "react-dom", version: starterDependencyVersions["react-dom"], section: "dependencies" },
  { name: "vite", version: starterDependencyVersions.vite, section: "devDependencies" },
  { name: "@vitejs/plugin-react", version: starterDependencyVersions["@vitejs/plugin-react"], section: "devDependencies" },
  { name: "typescript", version: starterDependencyVersions.typescript, section: "devDependencies" },
  { name: "@types/bun", version: starterDependencyVersions["@types/bun"], section: "devDependencies" },
  { name: "@types/react", version: starterDependencyVersions["@types/react"], section: "devDependencies" },
  { name: "@types/react-dom", version: starterDependencyVersions["@types/react-dom"], section: "devDependencies" },
];

const ensureManagedDependency = (
  packageJson: PackageJson,
  { name, version, section }: ManagedDependency,
) => {
  const dependencies = packageJson.dependencies ?? {};
  const devDependencies = packageJson.devDependencies ?? {};
  const targetSection = section === "dependencies" ? dependencies : devDependencies;
  const otherSection = section === "dependencies" ? devDependencies : dependencies;
  const currentVersion = targetSection[name] ?? otherSection[name];

  if (currentVersion === version && targetSection[name] === version && !(name in otherSection)) {
    return null;
  }

  delete otherSection[name];
  targetSection[name] = version;
  packageJson.dependencies = dependencies;
  packageJson.devDependencies = devDependencies;

  return currentVersion ? { name, from: currentVersion, to: version } : { name, from: "(missing)", to: version };
};

const updateDependencySections = (packageJson: PackageJson) => {
  const changed: Array<{ name: string; from: string; to: string }> = [];

  for (const dependency of managedDependencies) {
    const change = ensureManagedDependency(packageJson, dependency);
    if (change) {
      changed.push(change);
    }
  }

  return changed;
};

const desiredScripts = {
  dev: "electrobun-vite",
  build: "electrobun-vite build",
  preview: "electrobun-vite preview",
  update: "electrobun-vite update",
};

export type UpdateProjectOptions = {
  cwd?: string;
};

export const updateProject = async ({ cwd = process.cwd() }: UpdateProjectOptions = {}) => {
  const logger = createToolLogger("info");
  const packageJsonPath = resolve(cwd, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error("Could not find package.json in the current directory.");
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as PackageJson;
  const dependencyChanges = updateDependencySections(packageJson);
  const scripts = packageJson.scripts ?? {};
  const scriptChanges: Array<{ name: string; from: string; to: string }> = [];

  for (const [name, command] of Object.entries(desiredScripts)) {
    if (scripts[name] !== command) {
      scriptChanges.push({
        name: `scripts.${name}`,
        from: scripts[name] ?? "(missing)",
        to: command,
      });
      scripts[name] = command;
    }
  }

  packageJson.scripts = scripts;

  const gitignorePath = resolve(cwd, ".gitignore");
  const gitignoreEntries = ["electrobun.config.ts", "icon.iconset"];
  const gitignoreChanges: Array<{ name: string; from: string; to: string }> = [];

  if (existsSync(gitignorePath)) {
    const currentGitignore = await readFile(gitignorePath, "utf8");
    const gitignoreLines = currentGitignore.split(/\r?\n/);
    const missingEntries = gitignoreEntries.filter(
      (entry) => !gitignoreLines.includes(entry),
    );

    if (missingEntries.length > 0) {
      const nextGitignore = [
        ...gitignoreLines.filter((line) => line.length > 0),
        ...missingEntries,
        "",
      ].join("\n");
      await writeFile(gitignorePath, nextGitignore);
      for (const entry of missingEntries) {
        gitignoreChanges.push({
          name: `.gitignore`,
          from: "(missing entry)",
          to: entry,
        });
      }
    }
  }

  const allChanges = [...dependencyChanges, ...scriptChanges, ...gitignoreChanges];

  if (allChanges.length === 0) {
    logger.info("No template project updates were needed.");
    return { changed: false, changes: [] as Array<{ name: string; from: string; to: string }> };
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  for (const helperFile of [
    "scripts/dev.ts",
    "scripts/build.ts",
    "scripts/preview.ts",
    "scripts/electrobun-vite.ts",
  ]) {
    const helperPath = resolve(cwd, helperFile);
    if (existsSync(helperPath)) {
      await rm(helperPath, { force: true });
    }
  }

  logger.output(colors.cyan("updated template project files:"));
  for (const change of allChanges) {
    logger.output(colors.dim(`  ${change.name}: ${change.from} -> ${change.to}`));
  }

  if (dependencyChanges.length > 0) {
    logger.output(colors.cyan("running bun install to refresh the lockfile..."));
    const install = Bun.spawn(["bun", "install"], {
      cwd,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const exitCode = await install.exited;
    if (exitCode !== 0) {
      throw new Error(`bun install failed with exit code ${exitCode}`);
    }
  }

  return { changed: true, changes: allChanges };
};
