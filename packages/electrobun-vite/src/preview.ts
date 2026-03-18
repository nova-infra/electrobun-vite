import { createLogger } from "vite";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type InlineConfig,
} from "./config";
import { build } from "./build";

export async function preview(
  inlineConfig: InlineConfig = {},
  options: { skipBuild?: boolean } = {},
): Promise<void> {
  const resolved = await loadUserConfig(inlineConfig, "preview", "production");
  const logger = createLogger(resolved.logLevel, {
    allowClearScreen: resolved.clearScreen,
  });

  if (!options.skipBuild) {
    await build(inlineConfig);
  }

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);

  try {
    const child = Bun.spawn(["bunx", "electrobun", "dev"], {
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
      logger.error(`[electrobun-vite] preview failed with exit code ${exitCode}`);
      process.exit(exitCode);
    }
  } finally {
    await electrobunConfig.cleanup();
  }
}
