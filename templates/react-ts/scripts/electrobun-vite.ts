import { existsSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build as viteBuild, createLogger, createServer as viteCreateServer, type UserConfig as ViteUserConfig } from "vite";

type Command = "serve" | "build" | "preview";

type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable | undefined };

type TemplateConfig = {
  renderer?: {
    vite?: ViteUserConfig;
  };
  electrobun?: {
    outDir?: string;
    config?:
      | { [key: string]: Serializable | undefined }
      | ((context: { outDir: string; command: Command; mode: string }) => { [key: string]: Serializable | undefined });
  };
};

const cwd = process.cwd();
const configPath = join(cwd, "electrobun.vite.config.ts");
const generatedElectrobunConfigPath = join(cwd, "electrobun.config.ts");

const serialize = (value: Serializable): string => {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => serialize(item)).join(", ")}]`;
  const entries = Object.entries(value)
    .filter(([, entryValue]) => entryValue !== undefined)
    .map(([key, entryValue]) => `${JSON.stringify(key)}: ${serialize(entryValue!)}`);
  return `\n{\n${entries.map((entry) => `  ${entry}`).join(",\n")}\n}`;
};

const loadConfig = async (): Promise<{ config: TemplateConfig; outDir: string }> => {
  if (!existsSync(configPath)) {
    throw new Error("Missing electrobun.vite.config.ts");
  }

  const loaded = await import(pathToFileURL(configPath).href);
  const config = (loaded.default ?? {}) as TemplateConfig;
  return {
    config,
    outDir: config.electrobun?.outDir ?? "dist",
  };
};

const ensureElectrobunConfig = async (command: Command, mode: string, outDir: string, config: TemplateConfig) => {
  const configValue = config.electrobun?.config;
  if (!configValue) {
    throw new Error("Missing electrobun.config in electrobun.vite.config.ts");
  }

  const resolved = typeof configValue === "function" ? configValue({ outDir, command, mode }) : configValue;
  const source = `// Generated at runtime by the template scripts.\nexport default ${serialize(resolved)};\n`;
  await writeFile(generatedElectrobunConfigPath, source, "utf8");

  return async () => {
    await rm(generatedElectrobunConfigPath, { force: true });
  };
};

export const runBuild = async () => {
  const logger = createLogger();
  const { config, outDir } = await loadConfig();
  await viteBuild(config.renderer?.vite);
  const cleanup = await ensureElectrobunConfig("build", "production", outDir, config);

  try {
    const child = Bun.spawn(["bunx", "electrobun", "build"], {
      cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_OUT_DIR: outDir,
      },
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await child.exited;
    if (exitCode !== 0) {
      logger.error(`[template] build failed with exit code ${exitCode}`);
      process.exit(exitCode);
    }
  } finally {
    await cleanup();
  }
};

export const runDev = async () => {
  const { config, outDir } = await loadConfig();
  const logger = createLogger();
  const server = await viteCreateServer(config.renderer?.vite);
  const cleanup = await ensureElectrobunConfig("serve", "development", outDir, config);

  const stop = async () => {
    await server.close();
    await cleanup();
  };

  try {
    await server.listen();
    const devServerUrl = server.resolvedUrls?.local[0] ?? "http://127.0.0.1:5173/";
    const child = Bun.spawn(["bunx", "electrobun", "dev", "--watch"], {
      cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_DEV_SERVER_URL: devServerUrl,
        ELECTROBUN_VITE_OUT_DIR: outDir,
      },
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const onSignal = async () => {
      if (child.exitCode === null) {
        child.kill();
        await child.exited;
      }
      await stop();
      process.exit(0);
    };

    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);

    const exitCode = await child.exited;
    await stop();
    if (exitCode !== 0) {
      logger.error(`[template] dev failed with exit code ${exitCode}`);
      process.exit(exitCode);
    }
  } catch (error) {
    await stop();
    throw error;
  }
};

export const runPreview = async () => {
  const logger = createLogger();
  const { config, outDir } = await loadConfig();
  const cleanup = await ensureElectrobunConfig("preview", "production", outDir, config);

  try {
    const child = Bun.spawn(["bunx", "electrobun", "dev"], {
      cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_OUT_DIR: outDir,
      },
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await child.exited;
    if (exitCode !== 0) {
      logger.error(`[template] preview failed with exit code ${exitCode}`);
      process.exit(exitCode);
    }
  } finally {
    await cleanup();
  }
};
