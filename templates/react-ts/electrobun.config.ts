import type { ElectrobunConfig } from "electrobun";

const config = {
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
      "dist/index.html": "views/app/index.html",
      "dist/assets/index.css": "views/app/assets/index.css",
      "dist/assets/index.js": "views/app/assets/index.js",
    },
  },
} satisfies ElectrobunConfig;

export default config;
