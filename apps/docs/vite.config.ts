import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const normalizeBase = (value: string) => {
  if (!value.startsWith("/")) {
    return `/${value.replace(/^\/+/, "")}`;
  }

  return value.endsWith("/") ? value : `${value}/`;
};

const defaultPagesBase = () => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  return normalizeBase(repositoryName ? `/${repositoryName}/` : "/electrobun-vite/");
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  base: mode === "production" ? normalizeBase(process.env.DOCS_BASE_PATH ?? defaultPagesBase()) : "/",
}));
