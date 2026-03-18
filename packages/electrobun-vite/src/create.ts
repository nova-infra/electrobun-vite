import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getTemplateDirectory } from "./config";
import { templatePackages } from "./metadata";

export const listTemplates = () => templatePackages;

export const resolveTemplate = (name = "react-ts") => {
  if (name !== "react-ts" && !name.endsWith("react-ts")) {
    throw new Error("Only the react-ts template is currently supported.");
  }

  const template = templatePackages[0];

  if (!template) {
    throw new Error(`Unknown template: ${name}`);
  }

  return template;
};

export type ScaffoldProjectOptions = {
  cwd?: string;
  projectName: string;
  template?: string;
  force?: boolean;
};

const ignoredDirectories = new Set(["node_modules", "dist", "build"]);
const findWorkspaceRoot = (startDir: string) => {
  let currentDir = startDir;

  while (true) {
    if (existsSync(resolve(currentDir, "templates", "react-ts"))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
};

const findTemplateSourceDir = (templateDir: string) => {
  const localWorkspaceRoot = findWorkspaceRoot(import.meta.dir);
  const localTemplateDir = localWorkspaceRoot
    ? resolve(localWorkspaceRoot, "templates", templateDir)
    : null;

  if (localTemplateDir && existsSync(localTemplateDir)) {
    return localTemplateDir;
  }

  const packagedTemplateDirs = [
    resolve(import.meta.dir, "..", "assets", "templates", templateDir),
    resolve(import.meta.dir, "..", "..", "assets", "templates", templateDir),
  ];

  for (const packagedTemplateDir of packagedTemplateDirs) {
    if (existsSync(packagedTemplateDir)) {
      return packagedTemplateDir;
    }
  }

  throw new Error(`Could not locate template files for ${templateDir}.`);
};

const isDirectoryEmpty = async (dir: string) => {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.length === 0;
};

const confirmCurrentDirectoryScaffold = async (targetDir: string) => {
  if (await isDirectoryEmpty(targetDir)) {
    return true;
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      "Current directory is not empty. Run this command in an interactive terminal to confirm scaffolding into .",
    );
  }

  const terminal = createInterface({ input, output });
  try {
    const answer = await terminal.question(
      "Current directory is not empty. Continue scaffolding here? [y/N] ",
    );
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    terminal.close();
  }
};

const ensureTargetDirectory = async (targetDir: string, force = false) => {
  if (force) {
    await mkdir(targetDir, { recursive: true });
    return;
  }

  await mkdir(targetDir, { recursive: false });
};

const sanitizePackageName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "electrobun-app";

const toDisplayName = (value: string) =>
  sanitizePackageName(value)
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");

const toBundleIdentifier = (value: string) =>
  `dev.electrobun.${sanitizePackageName(value).replace(/-/g, "")}`;

const patchTemplateFiles = async (targetDir: string, projectName: string) => {
  const projectSlug = basename(projectName);
  const packageName = sanitizePackageName(projectSlug);
  const displayName = toDisplayName(projectSlug);
  const bundleIdentifier = toBundleIdentifier(projectSlug);

  const packageJsonPath = join(targetDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    name: string;
  };
  packageJson.name = packageName;
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const electrobunConfigPath = join(targetDir, "electrobun.vite.config.ts");
  const electrobunConfig = await readFile(electrobunConfigPath, "utf8");
  await writeFile(
    electrobunConfigPath,
    electrobunConfig
        .replace('name: "Electrobun React Vite Starter"', `name: "${displayName}"`)
      .replace(
        'identifier: "sh.blackboard.examples.electrobun-vite"',
        `identifier: "${bundleIdentifier}"`,
      ),
  );

  const rpcPath = join(targetDir, "src/shared/rpc.ts");
  const rpcSource = await readFile(rpcPath, "utf8");
  await writeFile(
    rpcPath,
    rpcSource.replace(
      'export const APP_NAME = "Electrobun React Vite Starter";',
      `export const APP_NAME = "${displayName}";`,
    ),
  );
};

export const scaffoldProject = async ({
  cwd = process.cwd(),
  projectName,
  template = "react-ts",
  force = false,
}: ScaffoldProjectOptions) => {
  const templateDir = getTemplateDirectory(template);
  const sourceDir = findTemplateSourceDir(templateDir);
  const targetDir = resolve(cwd, projectName);
  const isCurrentDirectory = projectName === "." || projectName === "";
  const projectSlug = isCurrentDirectory ? basename(cwd) : basename(projectName);

  if (isCurrentDirectory) {
    const confirmed = force || (await confirmCurrentDirectoryScaffold(targetDir));
    if (!confirmed) {
      throw new Error("Aborted.");
    }
  } else {
    await ensureTargetDirectory(targetDir, force);
  }

  await cp(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => !ignoredDirectories.has(basename(source)),
  });

  await patchTemplateFiles(targetDir, projectSlug);

  return {
    targetDir,
    template: resolveTemplate(template),
  };
};
