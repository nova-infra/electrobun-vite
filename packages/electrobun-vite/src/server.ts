import { createServer as viteCreateServer, createLogger } from "vite";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type InlineConfig,
} from "./config";

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
  const logger = createLogger(resolved.logLevel, {
    allowClearScreen: resolved.clearScreen,
  });

  const server = await viteCreateServer({
    ...resolved.config.renderer.vite,
    configFile: resolved.config.renderer.configFile,
    mode: resolved.mode,
    logLevel: resolved.logLevel,
    clearScreen: resolved.clearScreen,
  });

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);

  try {
    await server.listen();

    const devServerUrl =
      server.resolvedUrls?.local[0] ??
      `http://${resolved.config.renderer.dev.host}:${resolved.config.renderer.dev.port}`;

    if (options.rendererOnly) {
      logger.info(`renderer dev server running at ${devServerUrl}`);
      await waitForTermination(async () => {
        await server.close();
        await electrobunConfig.cleanup();
      });
      return;
    }

    const child = Bun.spawn(["bunx", "electrobun", "dev", ...(options.watch ? ["--watch"] : [])], {
      cwd: resolved.cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_DEV_SERVER_URL: devServerUrl,
        ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
      },
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    await Promise.race([
      child.exited.then(async (exitCode) => {
        await server.close();
        await electrobunConfig.cleanup();
        if (exitCode !== 0) {
          process.exit(exitCode);
        }
      }),
      waitForTermination(async () => {
        if (child.exitCode === null) {
          child.kill();
          await child.exited;
        }
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
