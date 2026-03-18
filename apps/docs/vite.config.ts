import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const normalizeBase = (value: string) => {
  if (!value.startsWith("/")) {
    return `/${value.replace(/^\/+/, "")}`;
  }

  return value.endsWith("/") ? value : `${value}/`;
};

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    mode === "production"
      ? normalizeBase(process.env.DOCS_BASE_PATH ?? "/electrobun-vite/")
      : "/",
}));
