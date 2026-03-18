import { cac } from "cac";
import colors from "picocolors";
import type { LogLevel } from "vite";
import {
  getDefaultTemplateName,
  loadUserConfig,
  type InlineConfig,
} from "./config";
import { scaffoldProject } from "./create";
import {
  PACKAGE_VERSION,
  starterVersions,
  templatePackages,
  workspaceModules,
} from "./metadata";
import { build } from "./build";
import { createToolLogger } from "./logger";
import { createServer } from "./server";
import { preview } from "./preview";

type GlobalCLIOptions = {
  config?: string;
  logLevel?: LogLevel;
  clearScreen?: boolean;
  mode?: string;
  watch?: boolean;
  outDir?: string;
  entry?: string;
  sourcemap?: boolean;
};

type DevCLIOptions = GlobalCLIOptions & {
  rendererOnly?: boolean;
};

type PreviewCLIOptions = GlobalCLIOptions & {
  skipBuild?: boolean;
};

const createInlineConfig = (root: string | undefined, options: GlobalCLIOptions): InlineConfig => ({
  root,
  mode: options.mode,
  configFile: typeof options.config === "string" ? options.config : undefined,
  logLevel: options.logLevel,
  clearScreen: options.clearScreen,
  build: {
    outDir: options.outDir,
    watch: options.watch,
  },
  entry: options.entry,
});

const handleError = (logLevel: LogLevel | undefined, label: string, error: unknown) => {
  const logger = createToolLogger(logLevel);
  const message = error instanceof Error ? error.message : String(error);
  logger.fatal(colors.red(colors.bold(label)));
  logger.fatal(colors.dim(message));
  process.exit(1);
};

export const runCLI = async (argv = process.argv) => {
  const cli = cac("electrobun-vite");

  cli
    .option("-c, --config <file>", "[string] use a specific electrobun.vite.config.ts file")
    .option("-l, --logLevel <level>", "[string] control log verbosity: info | warn | error | silent")
    .option("--clearScreen", "[boolean] clear previous logs between updates when supported")
    .option("-m, --mode <mode>", "[string] set mode for env loading and config resolution")
    .option("-w, --watch", "[boolean] watch files and rebuild or restart when supported")
    .option("--outDir <dir>", "[string] override the generated asset directory (default: dist)")
    .option("--sourcemap", "[boolean] emit source maps when the active command supports them")
    .option("--entry <file>", "[string] reserved for future bun entry overrides");

  cli
    .command("[root]", "start the Vite dev server and Electrobun app from [root]")
    .alias("serve")
    .alias("dev")
    .option("--rendererOnly", "[boolean] start only the renderer dev server")
    .action(async (root: string, options: DevCLIOptions) => {
      try {
        await createServer(createInlineConfig(root, options), {
          watch: options.watch,
          rendererOnly: options.rendererOnly,
        });
      } catch (error) {
        handleError(options.logLevel, "error during start dev server and electrobun app:", error);
      }
    });

  cli.command("build [root]", "build renderer and desktop output for production").action(async (root: string, options: GlobalCLIOptions) => {
    try {
      await build(createInlineConfig(root, options));
    } catch (error) {
      handleError(options.logLevel, "error during build:", error);
    }
  });

  cli
    .command("preview [root]", "start the desktop app against the production build")
    .option("--skipBuild", "[boolean] preview the existing build without rebuilding first")
    .action(async (root: string, options: PreviewCLIOptions) => {
      try {
        await preview(createInlineConfig(root, options), {
          skipBuild: options.skipBuild,
        });
      } catch (error) {
        handleError(options.logLevel, "error during preview electrobun app:", error);
      }
    });

  cli.command("info [root]", "print resolved config, versions, and template metadata").action(async (root: string, options: GlobalCLIOptions) => {
    const logger = createToolLogger(options.logLevel);
    const resolved = await loadUserConfig(createInlineConfig(root, options), "serve", "development");
    const out = {
      configFile: resolved.configFile,
      defaultTemplate: getDefaultTemplateName(),
      versions: starterVersions,
      modules: workspaceModules,
      templates: templatePackages,
    };
    logger.output(colors.cyan("resolved config:"));
    logger.output(JSON.stringify(out, null, 2));
  });

  cli
    .command("create <projectName>", "scaffold a new react-ts project into <projectName>")
    .option("-t, --template <template>", "[string] choose scaffold template; currently only react-ts is supported")
    .action(async (projectName: string, options: { template?: string }) => {
      const logger = createToolLogger("info");
      try {
        const result = await scaffoldProject({
          projectName,
          template: options.template ?? "react-ts",
        });

        logger.output(
          `${colors.green(colors.bold("✓"))} created ${projectName} from template ${result.template.directory}`,
        );
        logger.output(colors.dim(`  ${result.targetDir}`));
        logger.output("");
        logger.output(colors.dim("next steps:"));
        logger.output(colors.cyan(`  cd ${projectName}`));
        logger.output(colors.cyan("  bun install"));
        logger.output(colors.cyan("  bun run dev"));
      } catch (error) {
        handleError("error", "error during scaffold:", error);
      }
    });

  cli.help();
  cli.version(PACKAGE_VERSION);
  cli.parse(argv, { run: false });
  await cli.runMatchedCommand();
};
