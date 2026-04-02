import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import colors from "picocolors";
import { build as viteBuild } from "vite";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type ElectrobunSerializableValue,
  type InlineConfig,
  type ResolvedElectrobunViteConfig,
} from "./config";
import { loadEnv } from "./env";
import {
  createLogEnvironment,
  createToolLogger,
  createViteLogger,
  LOG_SCOPE_BUILD,
  LOG_SCOPE_VITE,
  pipeSubprocessLogs,
} from "./logger";

type ElectrobunRecord = { [key: string]: ElectrobunSerializableValue | undefined };

const ELECTROBUN_EXTERNALS = ["electrobun", "electrobun/bun", "electrobun/view"];

const extractBunEntryConfig = (
  inlineConfig: ElectrobunRecord,
): { entrypoint: string | null; externals: string[] } => {
  const build = inlineConfig.build as ElectrobunRecord | undefined;
  const bun = build?.bun as ElectrobunRecord | undefined;
  const entrypoint = typeof bun?.entrypoint === "string" ? bun.entrypoint : null;
  const externals = Array.isArray(bun?.external) ? (bun.external as string[]) : [];
  return { entrypoint, externals };
};

const preBundleEntrypoint = async (
  inlineConfig: ElectrobunRecord,
  cwd: string,
  logger: ReturnType<typeof createToolLogger>,
): Promise<{ config: ElectrobunRecord; cleanup: () => Promise<void> }> => {
  const { entrypoint, externals } = extractBunEntryConfig(inlineConfig);

  if (!entrypoint) {
    return { config: inlineConfig, cleanup: async () => {} };
  }

  const tmpDir = join(tmpdir(), `electrobun-vite-${process.pid}-prebundle`);
  const absoluteEntrypoint = resolve(cwd, entrypoint);

  logger.info(
    `pre-bundling ${entrypoint} (external: ${[...ELECTROBUN_EXTERNALS, ...externals].join(", ")})...`,
    { scope: LOG_SCOPE_BUILD },
  );

  const result = await Bun.build({
    entrypoints: [absoluteEntrypoint],
    outdir: tmpDir,
    target: "bun",
    external: [...ELECTROBUN_EXTERNALS, ...externals],
    minify: false,
  });

  if (!result.success) {
    const errorLines = result.logs.map((l) => l.message).join("\n");
    throw new Error(`pre-bundle failed for ${entrypoint}:\n${errorLines}`);
  }

  const outputName = basename(entrypoint).replace(/\.(ts|tsx|mts)$/, ".js");
  const bundledPath = join(tmpDir, outputName);

  const build = inlineConfig.build as ElectrobunRecord | undefined;
  const bun = build?.bun as ElectrobunRecord | undefined;
  const newConfig: ElectrobunRecord = {
    ...inlineConfig,
    build: {
      ...(build ?? {}),
      bun: {
        ...(bun ?? {}),
        entrypoint: bundledPath,
      },
    },
  };

  logger.success(`pre-bundled -> ${bundledPath}`, { scope: LOG_SCOPE_BUILD });

  return {
    config: newConfig,
    cleanup: async () => {
      await rm(tmpDir, { recursive: true, force: true });
    },
  };
};

export const withPreBundle = async (
  resolved: ResolvedElectrobunViteConfig,
  logger: ReturnType<typeof createToolLogger>,
): Promise<{
  resolved: ResolvedElectrobunViteConfig;
  cleanup: () => Promise<void>;
}> => {
  const inlineConfig = resolved.config.electrobun.config;
  if (!inlineConfig) {
    return { resolved, cleanup: async () => {} };
  }

  const { externals } = extractBunEntryConfig(inlineConfig as ElectrobunRecord);
  if (externals.length === 0) {
    return { resolved, cleanup: async () => {} };
  }

  const { config: preBundledConfig, cleanup } = await preBundleEntrypoint(
    inlineConfig as ElectrobunRecord,
    resolved.cwd,
    logger,
  );

  return {
    resolved: {
      ...resolved,
      config: {
        ...resolved.config,
        electrobun: {
          ...resolved.config.electrobun,
          config: preBundledConfig,
        },
      },
    },
    cleanup,
  };
};

export async function build(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTROBUN_VITE = "production";
  const resolved = await loadUserConfig(inlineConfig, "build", "production");
  const logger = createToolLogger(resolved.logLevel);
  const viteLogger = createViteLogger(resolved.logLevel);

  logger.info("building renderer...", { scope: LOG_SCOPE_VITE });
  await viteBuild({
    ...resolved.config.renderer.vite,
    configFile: resolved.config.renderer.configFile,
    mode: resolved.mode,
    logLevel: resolved.logLevel,
    clearScreen: resolved.clearScreen,
    customLogger: viteLogger,
  });
  logger.success(`renderer built -> ${getRendererOutDir(resolved)}`, {
    scope: LOG_SCOPE_VITE,
  });

  const { resolved: resolvedForBuild, cleanup: preBundleCleanup } = await withPreBundle(
    resolved,
    logger,
  );

  const electrobunConfig = await ensureElectrobunConfigFile(resolvedForBuild);
  logger.info("building electrobun app...", { scope: LOG_SCOPE_BUILD });

  try {
    const child = Bun.spawn(["bunx", "electrobun", "build"], {
      cwd: resolved.cwd,
      env: {
        ...process.env,
        ...loadEnv(resolved.mode, resolved.cwd, ["BUN_VITE_", "VITE_"]),
        ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
        ...createLogEnvironment(resolved.logLevel),
      },
      stdin: "inherit",
      stdout: "pipe",
      stderr: "pipe",
    });
    const childLogs = pipeSubprocessLogs(child, logger, "electrobun-build");

    const exitCode = await child.exited;
    await childLogs;
    if (exitCode !== 0) {
      logger.fatal(colors.red(`electrobun build failed (exit ${exitCode})`), {
        scope: LOG_SCOPE_BUILD,
      });
      logger.info(
        colors.dim(
          "hint: if the bun entrypoint imports npm packages with native bindings or complex dependency trees, " +
            "add them to electrobun.config → build.bun.external (e.g. external: [\"grammy\", \"zod\"])",
        ),
        { scope: LOG_SCOPE_BUILD },
      );
      process.exit(exitCode);
    }
    logger.success("build complete.", { scope: LOG_SCOPE_BUILD });
  } finally {
    await electrobunConfig.cleanup();
    await preBundleCleanup();
  }
}
