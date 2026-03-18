import { getDefaultTemplateName, loadUserConfig } from "@electrobun-vite/core";
import { workspacePackages } from "@electrobun-vite/shared";

const main = async () => {
  const [, , command = "help"] = process.argv;
  const resolved = await loadUserConfig(process.cwd());

  if (command === "help") {
    console.log("electrobun-vite");
    console.log("Commands: dev, build, preview, info");
    return;
  }

  if (command === "info") {
    console.log(
      JSON.stringify(
        {
          configFile: resolved.configFile,
          defaultTemplate: getDefaultTemplateName(),
          packages: workspacePackages,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === "dev" || command === "build" || command === "preview") {
    console.log(
      `[electrobun-vite] ${command} is scaffolded. Config file: ${
        resolved.configFile ?? "not found"
      }`,
    );
    return;
  }

  console.error(`[electrobun-vite] Unknown command: ${command}`);
  process.exitCode = 1;
};

void main();
