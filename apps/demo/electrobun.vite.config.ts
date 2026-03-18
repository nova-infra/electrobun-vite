import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "@nova-infra/electrobun-vite";

const rootDir = import.meta.dir;

export default defineConfig({
  template: "react-ts",
  renderer: {
    configFile: false,
    vite: {
      root: resolve(rootDir, "src/ui"),
      base: "./",
      plugins: [react()],
      build: {
        outDir: resolve(rootDir, "dist"),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
          output: {
            entryFileNames: "assets/[name].js",
            chunkFileNames: "assets/[name].js",
            assetFileNames: "assets/[name][extname]",
          },
        },
      },
    },
  },
  electrobun: {
    configFile: false,
    outDir: "dist",
    config: ({ outDir }) => ({
      app: {
        name: "Nova Infra Demo",
        identifier: "dev.electrobun.novainfrademo",
        version: "0.0.1",
      },
      runtime: {
        exitOnLastWindowClosed: true,
      },
      build: {
        bun: {
          entrypoint: "src/bun/index.ts",
        },
        copy: {
          [`${outDir}/index.html`]: "views/app/index.html",
          [`${outDir}/assets/index.css`]: "views/app/assets/index.css",
          [`${outDir}/assets/index.js`]: "views/app/assets/index.js",
        },
      },
    }),
  },
});
