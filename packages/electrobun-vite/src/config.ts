import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { templatePackages } from "./metadata";
import { mergeConfig, type LogLevel, type UserConfig as ViteUserConfig } from "vite";

export type Command = "build" | "serve" | "preview";

export type InlineConfig = {
  root?: string;
  configFile?: string | false;
  mode?: string;
  logLevel?: LogLevel;
  clearScreen?: boolean;
  build?: {
    outDir?: string;
    watch?: boolean;
  };
  entry?: string;
};

export type RendererConfig = {
  configFile?: string | false;
  vite?: ViteUserConfig;
  dev?: {
    host?: string;
    port?: number;
    strictPort?: boolean;
  };
  build?: {
    outDir?: string;
  };
};

export type ElectrobunToolConfig = {
  configFile?: string | false;
  outDir?: string;
  config?: ElectrobunConfigInput;
};

export type ElectrobunViteUserConfig = {
  renderer?: RendererConfig;
  electrobun?: ElectrobunToolConfig;
  site?: {
    title?: string;
    base?: string;
  };
};

export type ConfigEnv = {
  command: Command;
  mode: string;
};

export type ElectrobunSerializableValue =
  | string
  | number
  | boolean
  | null
  | ElectrobunSerializableValue[]
  | { [key: string]: ElectrobunSerializableValue | undefined };

export type ElectrobunConfigContext = {
  cwd: string;
  outDir: string;
  command: Command;
  mode: string;
};

export type ElectrobunConfigInput =
  | { [key: string]: ElectrobunSerializableValue | undefined }
  | Promise<{ [key: string]: ElectrobunSerializableValue | undefined }>
  | ((
      context: ElectrobunConfigContext,
    ) =>
      | { [key: string]: ElectrobunSerializableValue | undefined }
      | Promise<{ [key: string]: ElectrobunSerializableValue | undefined }>);

export type UserConfigExport =
  | ElectrobunViteUserConfig
  | Promise<ElectrobunViteUserConfig>
  | ((env: ConfigEnv) => ElectrobunViteUserConfig | Promise<ElectrobunViteUserConfig>);

export type ResolvedRendererConfig = {
  configFile: string | false;
  vite: ViteUserConfig;
  dev: {
    host: string;
    port: number;
    strictPort: boolean;
  };
  build: {
    outDir: string;
  };
};

export type ResolvedElectrobunToolConfig = {
  configFile: string | false;
  outDir: string;
  config: { [key: string]: ElectrobunSerializableValue | undefined } | null;
};

export type ResolvedElectrobunViteConfig = {
  cwd: string;
  command: Command;
  mode: string;
  logLevel: LogLevel;
  clearScreen: boolean;
  configFile: string | null;
  config: Omit<ElectrobunViteUserConfig, "renderer" | "electrobun"> & {
    renderer: ResolvedRendererConfig;
    electrobun: ResolvedElectrobunToolConfig;
  };
};

export const defineConfig = (config: UserConfigExport) => config;

export const resolveConfigFile = (cwd = process.cwd(), configFile?: string | false) => {
  if (configFile === false) {
    return null;
  }

  const candidate = configFile ? resolve(cwd, configFile) : join(cwd, "electrobun.vite.config.ts");
  const configFilePath = candidate;
  if (!existsSync(configFilePath)) {
    return null;
  }

  return configFilePath;
};

const mergeConfigWithDefaults = (
  cwd: string,
  userConfig: ElectrobunViteUserConfig,
  inlineConfig: InlineConfig,
): ResolvedElectrobunViteConfig["config"] => {
  const outDir =
    inlineConfig.build?.outDir ?? userConfig.electrobun?.outDir ?? userConfig.renderer?.build?.outDir ?? "dist";
  const rendererUsesInlineConfig =
    userConfig.renderer?.configFile === false || Boolean(userConfig.renderer?.vite);
  const rendererOutDir = resolve(cwd, outDir);
  const rendererConfigFileName =
    typeof userConfig.renderer?.configFile === "string" ? userConfig.renderer.configFile : "vite.config.ts";
  const rendererConfigFile = rendererUsesInlineConfig
    ? false
    : resolve(cwd, rendererConfigFileName);
  const defaultInlineRendererConfig: ViteUserConfig = {
    root: resolve(cwd, "src/ui"),
    base: "./",
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: rendererOutDir,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name][extname]",
        },
      },
    },
  };
  const rendererViteConfig = mergeConfig(
    rendererUsesInlineConfig ? defaultInlineRendererConfig : {},
    userConfig.renderer?.vite ?? {},
  );
  const resolvedElectrobunConfigFile =
    userConfig.electrobun?.configFile === false
      ? false
      : resolve(
          cwd,
          typeof userConfig.electrobun?.configFile === "string"
            ? userConfig.electrobun.configFile
            : "electrobun.config.ts",
        );

  return {
    ...userConfig,
    renderer: {
      configFile: rendererConfigFile,
      vite: mergeConfig(rendererViteConfig, {
        server: {
          host: userConfig.renderer?.dev?.host ?? "127.0.0.1",
          port: userConfig.renderer?.dev?.port ?? 5173,
          strictPort: userConfig.renderer?.dev?.strictPort ?? true,
        },
        build: {
          outDir: rendererOutDir,
        },
      }),
      dev: {
        host: userConfig.renderer?.dev?.host ?? "127.0.0.1",
        port: userConfig.renderer?.dev?.port ?? 5173,
        strictPort: userConfig.renderer?.dev?.strictPort ?? true,
      },
      build: {
        outDir,
      },
    },
    electrobun: {
      configFile: resolvedElectrobunConfigFile,
      outDir,
      config: null,
    },
  };
};

export const resolveElectrobunConfigFile = (
  resolved: ResolvedElectrobunViteConfig,
) => {
  const configFile = resolved.config.electrobun.configFile;
  return configFile && existsSync(configFile) ? configFile : null;
};

const resolveUserConfigExport = async (
  configExport: UserConfigExport | undefined,
  env: ConfigEnv,
): Promise<ElectrobunViteUserConfig> => {
  if (!configExport) {
    return {};
  }

  if (typeof configExport === "function") {
    return (await configExport(env)) ?? {};
  }

  return (await configExport) ?? {};
};

const resolveElectrobunConfigInput = async (
  configInput: ElectrobunConfigInput | undefined,
  context: ElectrobunConfigContext,
): Promise<{ [key: string]: ElectrobunSerializableValue | undefined } | null> => {
  if (!configInput) {
    return null;
  }

  if (typeof configInput === "function") {
    return (await configInput(context)) ?? null;
  }

  return (await configInput) ?? null;
};

export const loadUserConfig = async (
  inlineConfig: InlineConfig = {},
  command: Command = "serve",
  defaultMode = "development",
): Promise<ResolvedElectrobunViteConfig> => {
  const cwd = resolve(inlineConfig.root ?? process.cwd());
  const mode = inlineConfig.mode ?? defaultMode;
  const configFile = resolveConfigFile(cwd, inlineConfig.configFile);
  let userConfig: ElectrobunViteUserConfig = {};

  if (configFile) {
    const loaded = await import(pathToFileURL(configFile).href);
    userConfig = await resolveUserConfigExport(loaded.default as UserConfigExport | undefined, {
      command,
      mode,
    });
  }

  const mergedConfig = mergeConfigWithDefaults(cwd, userConfig, inlineConfig);
  mergedConfig.electrobun.config = await resolveElectrobunConfigInput(userConfig.electrobun?.config, {
    cwd,
    outDir: mergedConfig.electrobun.outDir,
    command,
    mode,
  });

  return {
    cwd,
    command,
    mode,
    logLevel: inlineConfig.logLevel ?? "info",
    clearScreen: inlineConfig.clearScreen ?? true,
    configFile,
    config: mergedConfig,
  };
};

export const getRendererOutDir = (resolved: ResolvedElectrobunViteConfig) =>
  resolved.config.renderer.build.outDir;

export const getDefaultTemplateName = () => templatePackages[0]?.directory ?? "react-ts";

const serializeElectrobunValue = (value: ElectrobunSerializableValue): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeElectrobunValue(item)).join(", ")}]`;
  }

  const entries = Object.entries(value)
    .filter(([, entryValue]) => entryValue !== undefined)
    .map(([key, entryValue]) => `${JSON.stringify(key)}: ${serializeElectrobunValue(entryValue!)}`);

  return `{\n${entries.map((entry) => `  ${entry}`).join(",\n")}\n}`;
};

export const ensureElectrobunConfigFile = async (resolved: ResolvedElectrobunViteConfig) => {
  const existingConfigFile = resolveElectrobunConfigFile(resolved);

  if (existingConfigFile) {
    return {
      path: existingConfigFile,
      cleanup: async () => {},
    };
  }

  const inlineConfig = resolved.config.electrobun.config;
  if (!inlineConfig) {
    throw new Error(
      "No Electrobun config found. Add electrobun.config.ts or define electrobun.config inside electrobun.vite.config.ts.",
    );
  }

  const generatedConfigPath = join(resolved.cwd, "electrobun.config.ts");
  const generatedFileContents = [
    "// Generated by @nova-infra/electrobun-vite. Do not edit.",
    `export default ${serializeElectrobunValue(inlineConfig)};`,
    "",
  ].join("\n");

  await mkdir(resolved.cwd, { recursive: true });
  await writeFile(generatedConfigPath, generatedFileContents, "utf8");

  return {
    path: generatedConfigPath,
    cleanup: async () => {
      await rm(generatedConfigPath, { force: true });
    },
  };
};

export const getTemplateDirectory = (name = "react-ts") => {
  if (name !== "react-ts" && !name.endsWith("react-ts")) {
    throw new Error("Only the react-ts template is currently supported.");
  }

  const template = templatePackages.find(
    (item) =>
      item.directory === name ||
      item.name === name ||
      item.packageName === name ||
      item.packageName.endsWith(name),
  );

  if (!template) {
    throw new Error(`Unknown template: ${name}`);
  }

  return template.directory;
};
