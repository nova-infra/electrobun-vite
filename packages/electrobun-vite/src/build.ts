import colors from "picocolors";
import { build as viteBuild } from "vite";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type InlineConfig,
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

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);
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
      process.exit(exitCode);
    }
    logger.success("build complete.", { scope: LOG_SCOPE_BUILD });
  } finally {
    await electrobunConfig.cleanup();
  }
}
