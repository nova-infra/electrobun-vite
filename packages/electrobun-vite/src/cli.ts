import { cac } from "cac";
import colors from "picocolors";
import { createLogger, type LogLevel } from "vite";
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
  const logger = createLogger(logLevel);
  const message = error instanceof Error ? error.message : String(error);
  logger.error(colors.red(`${label}\n${message}`));
  process.exit(1);
};

export const runCLI = async (argv = process.argv) => {
  const cli = cac("electrobun-vite");

  cli
    .option("-c, --config <file>", "[string] use specified config file")
    .option("-l, --logLevel <level>", "[string] info | warn | error | silent")
    .option("--clearScreen", "[boolean] allow/disable clear screen when logging")
    .option("-m, --mode <mode>", "[string] set env mode")
    .option("-w, --watch", "[boolean] rebuild or restart when supported files change")
    .option("--outDir <dir>", "[string] output directory (default: dist)")
    .option("--sourcemap", "[boolean] enable source maps when supported")
    .option("--entry <file>", "[string] reserved for future bun entry overrides");

  cli
    .command("[root]", "start dev server and electrobun app")
    .alias("serve")
    .alias("dev")
    .option("--rendererOnly", "[boolean] only start renderer dev server")
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

  cli.command("build [root]", "build for production").action(async (root: string, options: GlobalCLIOptions) => {
    try {
      await build(createInlineConfig(root, options));
    } catch (error) {
      handleError(options.logLevel, "error during build:", error);
    }
  });

  cli
    .command("preview [root]", "start electrobun app to preview production build")
    .option("--skipBuild", "[boolean] skip build")
    .action(async (root: string, options: PreviewCLIOptions) => {
      try {
        await preview(createInlineConfig(root, options), {
          skipBuild: options.skipBuild,
        });
      } catch (error) {
        handleError(options.logLevel, "error during preview electrobun app:", error);
      }
    });

  cli.command("info [root]", "print resolved package metadata").action(async (root: string, options: GlobalCLIOptions) => {
    const resolved = await loadUserConfig(createInlineConfig(root, options), "serve", "development");
    console.log(
      JSON.stringify(
        {
          configFile: resolved.configFile,
          defaultTemplate: getDefaultTemplateName(),
          versions: starterVersions,
          modules: workspaceModules,
          templates: templatePackages,
        },
        null,
        2,
      ),
    );
  });

  cli
    .command("create <projectName>", "scaffold a react-ts project")
    .option("-t, --template <template>", "[string] currently only react-ts is supported")
    .action(async (projectName: string, options: { template?: string }) => {
      try {
        const result = await scaffoldProject({
          projectName,
          template: options.template ?? "react-ts",
        });

        console.log(`Created ${projectName} from ${result.template.directory}`);
        console.log(`Location: ${result.targetDir}`);
        console.log("Next steps:");
        console.log(`  cd ${projectName}`);
        console.log("  bun install");
        console.log("  bun run dev");
      } catch (error) {
        handleError("error", "error during scaffold:", error);
      }
    });

  cli.help();
  cli.version(PACKAGE_VERSION);
  cli.parse(argv, { run: false });
  await cli.runMatchedCommand();
};
