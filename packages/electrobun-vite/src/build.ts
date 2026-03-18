import { build as viteBuild, createLogger } from "vite";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type InlineConfig,
} from "./config";

export async function build(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTROBUN_VITE = "production";
  const resolved = await loadUserConfig(inlineConfig, "build", "production");
  const logger = createLogger(resolved.logLevel, {
    allowClearScreen: resolved.clearScreen,
  });

  await viteBuild({
    ...resolved.config.renderer.vite,
    configFile: resolved.config.renderer.configFile,
    mode: resolved.mode,
    logLevel: resolved.logLevel,
    clearScreen: resolved.clearScreen,
  });

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);

  try {
    const child = Bun.spawn(["bunx", "electrobun", "build"], {
      cwd: resolved.cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
      },
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await child.exited;
    if (exitCode !== 0) {
      logger.error(`[electrobun-vite] build failed with exit code ${exitCode}`);
      process.exit(exitCode);
    }
  } finally {
    await electrobunConfig.cleanup();
  }
}
