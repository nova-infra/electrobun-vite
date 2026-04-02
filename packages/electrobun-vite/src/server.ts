import colors from "picocolors";
import { createServer as viteCreateServer } from "vite";
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
  LOG_SCOPE_LAUNCHER,
  LOG_SCOPE_VITE,
  pipeSubprocessLogs,
} from "./logger";

const waitForTermination = async (cleanup: () => Promise<void>) => {
  await new Promise<void>((resolve, reject) => {
    const onSignal = async () => {
      try {
        await cleanup();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);
  });
};

export async function createServer(
  inlineConfig: InlineConfig = {},
  options: { watch?: boolean; rendererOnly?: boolean } = {},
): Promise<void> {
  process.env.NODE_ENV_ELECTROBUN_VITE = "development";
  const resolved = await loadUserConfig(inlineConfig, "serve", "development");
  const logger = createToolLogger(resolved.logLevel);
  const viteLogger = createViteLogger(resolved.logLevel);

  const server = await viteCreateServer({
    ...resolved.config.renderer.vite,
    configFile: resolved.config.renderer.configFile,
    mode: resolved.mode,
    logLevel: resolved.logLevel,
    clearScreen: resolved.clearScreen,
    customLogger: viteLogger,
  });

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);

  try {
    await server.listen();

    const devServerUrl =
      server.resolvedUrls?.local[0] ??
      `http://${resolved.config.renderer.dev.host}:${resolved.config.renderer.dev.port}`;

    if (options.rendererOnly) {
      logger.info(`renderer dev server -> ${devServerUrl}`, {
        scope: LOG_SCOPE_VITE,
      });
      await waitForTermination(async () => {
        await server.close();
        await electrobunConfig.cleanup();
      });
      return;
    }

    logger.info(`renderer -> ${devServerUrl}`, { scope: LOG_SCOPE_VITE });
    logger.info("starting electrobun dev process...", {
      scope: LOG_SCOPE_LAUNCHER,
    });

    const child = Bun.spawn(["bunx", "electrobun", "dev", ...(options.watch ? ["--watch"] : [])], {
      cwd: resolved.cwd,
      env: {
        ...process.env,
        ...loadEnv(resolved.mode, resolved.cwd, ["BUN_VITE_", "VITE_"]),
        ELECTROBUN_VITE_DEV_SERVER_URL: devServerUrl,
        ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
        ...createLogEnvironment(resolved.logLevel),
      },
      stdin: "inherit",
      stdout: "pipe",
      stderr: "pipe",
    });
    const childLogs = pipeSubprocessLogs(child, logger, "electrobun-dev");

    await Promise.race([
      child.exited.then(async (exitCode) => {
        await childLogs;
        await server.close();
        await electrobunConfig.cleanup();
        if (exitCode !== 0) {
          logger.fatal(colors.red(`electrobun dev failed (exit ${exitCode})`), {
            scope: LOG_SCOPE_LAUNCHER,
          });
          process.exit(exitCode);
        }
      }),
      waitForTermination(async () => {
        if (child.exitCode === null) {
          child.kill();
          await child.exited;
        }
        await childLogs;
        await server.close();
        await electrobunConfig.cleanup();
      }),
    ]);
  } catch (error) {
    await server.close();
    await electrobunConfig.cleanup();
    throw error;
  }
}
