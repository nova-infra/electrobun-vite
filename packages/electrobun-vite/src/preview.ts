import colors from "picocolors";
import {
  ensureElectrobunConfigFile,
  getRendererOutDir,
  loadUserConfig,
  type InlineConfig,
} from "./config";
import { build } from "./build";
import {
  createLogEnvironment,
  createToolLogger,
  LOG_SCOPE_LAUNCHER,
  pipeSubprocessLogs,
} from "./logger";

export async function preview(
  inlineConfig: InlineConfig = {},
  options: { skipBuild?: boolean } = {},
): Promise<void> {
  const resolved = await loadUserConfig(inlineConfig, "preview", "production");
  const logger = createToolLogger(resolved.logLevel);

  if (!options.skipBuild) {
    await build(inlineConfig);
  }

  const electrobunConfig = await ensureElectrobunConfigFile(resolved);

  logger.info("starting preview (electrobun dev)...", {
    scope: LOG_SCOPE_LAUNCHER,
  });

  try {
    const child = Bun.spawn(["bunx", "electrobun", "dev"], {
      cwd: resolved.cwd,
      env: {
        ...process.env,
        ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
        ...createLogEnvironment(resolved.logLevel),
      },
      stdin: "inherit",
      stdout: "pipe",
      stderr: "pipe",
    });
    const childLogs = pipeSubprocessLogs(child, logger, "electrobun-preview");

    const exitCode = await child.exited;
    await childLogs;
    if (exitCode !== 0) {
      logger.fatal(colors.red(`preview failed (exit ${exitCode})`), {
        scope: LOG_SCOPE_LAUNCHER,
      });
      process.exit(exitCode);
    }
  } finally {
    await electrobunConfig.cleanup();
  }
}
