import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import colors from "picocolors";
import { starterDependencyVersions } from "./metadata";
import { createToolLogger } from "./logger";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const updateDependencySection = (section: Record<string, string> | undefined) => {
  const changed: Array<{ name: string; from: string; to: string }> = [];
  if (!section) {
    return changed;
  }

  for (const [name, version] of Object.entries(starterDependencyVersions)) {
    const currentVersion = section[name];
    if (currentVersion && currentVersion !== version) {
      section[name] = version;
      changed.push({ name, from: currentVersion, to: version });
    }
  }

  return changed;
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
  const dependencyChanges = updateDependencySection(packageJson.dependencies);
  const devDependencyChanges = updateDependencySection(packageJson.devDependencies);
  const allChanges = [...dependencyChanges, ...devDependencyChanges];

  if (allChanges.length === 0) {
    logger.info("No template dependency updates were needed.");
    return { changed: false, changes: [] as Array<{ name: string; from: string; to: string }> };
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  logger.output(colors.cyan("updated dependency versions:"));
  for (const change of allChanges) {
    logger.output(colors.dim(`  ${change.name}: ${change.from} -> ${change.to}`));
  }

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

  return { changed: true, changes: allChanges };
};
