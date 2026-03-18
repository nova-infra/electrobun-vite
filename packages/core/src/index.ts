import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { templatePackages } from "@electrobun-vite/shared";

export type ElectrobunViteUserConfig = {
  template?: string;
  site?: {
    title?: string;
    base?: string;
  };
};

export type ResolvedElectrobunViteConfig = {
  cwd: string;
  configFile: string | null;
  userConfig: ElectrobunViteUserConfig;
};

export const defineConfig = <T extends ElectrobunViteUserConfig>(config: T) => config;

export const resolveConfigFile = (cwd = process.cwd()) => {
  const configFile = join(cwd, "electrobun.vite.config.ts");
  return existsSync(configFile) ? configFile : null;
};

export const loadUserConfig = async (
  cwd = process.cwd(),
): Promise<ResolvedElectrobunViteConfig> => {
  const configFile = resolveConfigFile(cwd);

  if (!configFile) {
    return {
      cwd,
      configFile: null,
      userConfig: {},
    };
  }

  const loaded = await import(pathToFileURL(configFile).href);
  const userConfig = (loaded.default ?? {}) as ElectrobunViteUserConfig;

  return {
    cwd,
    configFile,
    userConfig,
  };
};

export const getDefaultTemplateName = () => templatePackages[0]?.name ?? "react-ts";

export const getTemplateDirectory = (name = "react-ts") => {
  const template = templatePackages.find(
    (item) => item.directory === name || item.name === name || item.name.endsWith(name),
  );

  if (!template) {
    throw new Error(`Unknown template: ${name}`);
  }

  return template.directory;
};
