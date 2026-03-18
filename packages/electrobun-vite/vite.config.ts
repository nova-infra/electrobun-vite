import { builtinModules } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

const packageExternals = ["cac", "picocolors", "vite"];
const nodeExternals = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
]);

const isExternal = (id: string) =>
  nodeExternals.has(id) ||
  packageExternals.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));

export default defineConfig({
  build: {
    target: "node18",
    outDir: resolve(rootDir, "dist"),
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    lib: {
      entry: {
        index: resolve(rootDir, "src/index.ts"),
        "bin/electrobun-vite": resolve(rootDir, "src/bin/electrobun-vite.ts"),
        "bin/create-electrobun": resolve(rootDir, "src/bin/create-electrobun.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
