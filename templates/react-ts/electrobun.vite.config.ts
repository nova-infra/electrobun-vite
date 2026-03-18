import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

const rootDir = import.meta.dir;

export default {
  renderer: {
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
      server: {
        host: "127.0.0.1",
        port: 5173,
        strictPort: true,
      },
    },
  },
  electrobun: {
    outDir: "dist",
    config: ({ outDir }: { outDir: string }) => ({
      app: {
        name: "Electrobun React Vite Starter",
        identifier: "sh.blackboard.examples.electrobun-vite",
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
};
