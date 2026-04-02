import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const defaultPrefixes = ["BUN_VITE_", "RENDERER_VITE_", "VITE_"];

function parseDotenv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!key) continue;

    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted) value = value.slice(1, -1);
    else {
      const commentIdx = value.search(/\s#/);
      if (commentIdx >= 0) value = value.slice(0, commentIdx).trimEnd();
    }
    out[key] = value;
  }
  return out;
}

export function loadEnv(
  mode: string,
  root: string,
  prefixes: string[] = defaultPrefixes,
): Record<string, string> {
  const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const merged: Record<string, string> = {};

  for (const file of files) {
    const fullPath = resolve(root, file);
    if (!existsSync(fullPath)) continue;
    Object.assign(merged, parseDotenv(readFileSync(fullPath, "utf8")));
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    if (prefixes.some((p) => key.startsWith(p))) out[key] = value;
  }
  return out;
}

