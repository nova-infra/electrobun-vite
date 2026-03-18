import { existsSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
      throw new Error("Could not locate workspace root containing templates/react-ts.");
    }

    currentDir = parentDir;
  }
};

const repoRoot = findWorkspaceRoot(dirname(fileURLToPath(import.meta.url)));

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
}: ScaffoldProjectOptions) => {
  const templateDir = getTemplateDirectory(template);
  const sourceDir = resolve(repoRoot, "templates", templateDir);
  const targetDir = resolve(cwd, projectName);

  await mkdir(targetDir, { recursive: false });

  await cp(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => !ignoredDirectories.has(basename(source)),
  });

  await patchTemplateFiles(targetDir, projectName);

  return {
    targetDir,
    template: resolveTemplate(template),
  };
};
