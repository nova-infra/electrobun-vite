import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Mock the icon module so ensureElectrobunConfigFile tests do not invoke sips
// or rely on import.meta.dir from within icon.ts.
// ---------------------------------------------------------------------------
mock.module("../icon", () => ({
  ensureIconIconset: async (_appRoot: string): Promise<boolean> => false,
  findLogoSource: (_cwd: string): string => "",
}));

// Imports must come after mock.module registrations so Bun's module registry
// serves the mocked version.
import { resolveConfigFile, ensureElectrobunConfigFile, type ResolvedElectrobunViteConfig } from "../config";
import { loadEnv } from "../env";
import { createInlineConfig as _createInlineConfig } from "../cli";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a unique temp directory for each test and return its path along with
 * a cleanup function.
 */
function makeTempDir(prefix: string): { dir: string; cleanup: () => void } {
  const dir = join(tmpdir(), `${prefix}-${process.pid}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return {
    dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/**
 * Build a minimal ResolvedElectrobunViteConfig sufficient for the
 * ensureElectrobunConfigFile tests.
 */
function makeResolvedConfig(
  cwd: string,
  overrides: Partial<ResolvedElectrobunViteConfig["config"]["electrobun"]> = {},
): ResolvedElectrobunViteConfig {
  return {
    cwd,
    command: "build",
    mode: "production",
    logLevel: "info",
    clearScreen: true,
    configFile: null,
    config: {
      renderer: {
        configFile: false,
        vite: {},
        dev: { host: "127.0.0.1", port: 5173, strictPort: true },
        build: { outDir: "dist" },
      },
      electrobun: {
        configFile: false,
        outDir: "dist",
        config: null,
        ...overrides,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// resolveConfigFile — multi-format config resolution
// ---------------------------------------------------------------------------

describe("resolveConfigFile", () => {
  let dir: string;
  let cleanup: () => void;

  beforeEach(() => {
    const tmp = makeTempDir("resolve-config");
    dir = tmp.dir;
    cleanup = tmp.cleanup;
  });

  afterEach(() => cleanup());

  test("returns null when no config file exists in cwd", () => {
    const result = resolveConfigFile(dir);
    expect(result).toBeNull();
  });

  test("returns null when configFile is explicitly false", () => {
    const result = resolveConfigFile(dir, false);
    expect(result).toBeNull();
  });

  test("resolves electrobun.vite.config.ts when present", () => {
    const filePath = join(dir, "electrobun.vite.config.ts");
    writeFileSync(filePath, "export default {};");
    const result = resolveConfigFile(dir);
    expect(result).toBe(filePath);
  });

  test("resolves electrobun.vite.config.mts when .ts is absent", () => {
    const filePath = join(dir, "electrobun.vite.config.mts");
    writeFileSync(filePath, "export default {};");
    const result = resolveConfigFile(dir);
    expect(result).toBe(filePath);
  });

  test("resolves electrobun.vite.config.js when .ts/.mts are absent", () => {
    const filePath = join(dir, "electrobun.vite.config.js");
    writeFileSync(filePath, "export default {};");
    const result = resolveConfigFile(dir);
    expect(result).toBe(filePath);
  });

  test("resolves electrobun.vite.config.mjs when all other extensions are absent", () => {
    const filePath = join(dir, "electrobun.vite.config.mjs");
    writeFileSync(filePath, "export default {};");
    const result = resolveConfigFile(dir);
    expect(result).toBe(filePath);
  });

  test("prefers .ts over .mts when both exist", () => {
    const tsPath = join(dir, "electrobun.vite.config.ts");
    const mtsPath = join(dir, "electrobun.vite.config.mts");
    writeFileSync(tsPath, "export default {};");
    writeFileSync(mtsPath, "export default {};");
    const result = resolveConfigFile(dir);
    expect(result).toBe(tsPath);
  });

  test("resolves an explicit configFile string relative to cwd", () => {
    const custom = join(dir, "my.config.ts");
    writeFileSync(custom, "export default {};");
    const result = resolveConfigFile(dir, "my.config.ts");
    expect(result).toBe(custom);
  });

  test("returns null for an explicit configFile string that does not exist", () => {
    const result = resolveConfigFile(dir, "nonexistent.config.ts");
    expect(result).toBeNull();
  });

  test("resolves an explicit absolute configFile path", () => {
    const custom = join(dir, "abs.config.ts");
    writeFileSync(custom, "export default {};");
    const result = resolveConfigFile(dir, custom);
    expect(result).toBe(custom);
  });
});

// ---------------------------------------------------------------------------
// loadEnv — .env file parsing and prefix filtering
// ---------------------------------------------------------------------------

describe("loadEnv", () => {
  let dir: string;
  let cleanup: () => void;

  beforeEach(() => {
    const tmp = makeTempDir("load-env");
    dir = tmp.dir;
    cleanup = tmp.cleanup;
  });

  afterEach(() => cleanup());

  test("returns empty object when no .env files exist", () => {
    const result = loadEnv("development", dir);
    expect(result).toEqual({});
  });

  test("reads variables from .env and filters by default prefixes", () => {
    writeFileSync(
      join(dir, ".env"),
      [
        "VITE_APP_TITLE=Hello",
        "RENDERER_VITE_KEY=renderer-val",
        "BUN_VITE_SECRET=bun-val",
        "UNRELATED_VAR=ignored",
        "ANOTHER=also-ignored",
      ].join("\n"),
    );
    const result = loadEnv("development", dir);
    expect(result).toEqual({
      VITE_APP_TITLE: "Hello",
      RENDERER_VITE_KEY: "renderer-val",
      BUN_VITE_SECRET: "bun-val",
    });
  });

  test("mode-specific .env file overrides base .env values", () => {
    writeFileSync(join(dir, ".env"), "VITE_MODE=base\nVITE_BASE_ONLY=yes");
    writeFileSync(join(dir, ".env.production"), "VITE_MODE=production");
    const result = loadEnv("production", dir);
    expect(result.VITE_MODE).toBe("production");
    expect(result.VITE_BASE_ONLY).toBe("yes");
  });

  test(".env.local overrides base .env", () => {
    writeFileSync(join(dir, ".env"), "VITE_FOO=original");
    writeFileSync(join(dir, ".env.local"), "VITE_FOO=local-override");
    const result = loadEnv("development", dir);
    expect(result.VITE_FOO).toBe("local-override");
  });

  test(".env.<mode>.local overrides .env.<mode>", () => {
    writeFileSync(join(dir, ".env.staging"), "VITE_STAGE=stage-val");
    writeFileSync(join(dir, ".env.staging.local"), "VITE_STAGE=stage-local");
    const result = loadEnv("staging", dir);
    expect(result.VITE_STAGE).toBe("stage-local");
  });

  test("strips double-quoted values", () => {
    writeFileSync(join(dir, ".env"), 'VITE_QUOTED="quoted value"');
    const result = loadEnv("development", dir);
    expect(result.VITE_QUOTED).toBe("quoted value");
  });

  test("strips single-quoted values", () => {
    writeFileSync(join(dir, ".env"), "VITE_SINGLE='single value'");
    const result = loadEnv("development", dir);
    expect(result.VITE_SINGLE).toBe("single value");
  });

  test("strips inline comments from unquoted values", () => {
    writeFileSync(join(dir, ".env"), "VITE_WITH_COMMENT=hello # this is a comment");
    const result = loadEnv("development", dir);
    expect(result.VITE_WITH_COMMENT).toBe("hello");
  });

  test("ignores comment lines starting with #", () => {
    writeFileSync(join(dir, ".env"), "# VITE_COMMENTED=should-not-appear\nVITE_REAL=yes");
    const result = loadEnv("development", dir);
    expect(result).not.toHaveProperty("VITE_COMMENTED");
    expect(result.VITE_REAL).toBe("yes");
  });

  test("ignores blank lines", () => {
    writeFileSync(join(dir, ".env"), "\n\nVITE_BLANK=ok\n\n");
    const result = loadEnv("development", dir);
    expect(result.VITE_BLANK).toBe("ok");
  });

  test("accepts a custom prefix array", () => {
    writeFileSync(
      join(dir, ".env"),
      ["MY_APP_TITLE=custom", "VITE_IGNORED=yes", "MY_APP_OTHER=other"].join("\n"),
    );
    const result = loadEnv("development", dir, ["MY_APP_"]);
    expect(result).toEqual({
      MY_APP_TITLE: "custom",
      MY_APP_OTHER: "other",
    });
  });

  test("returns all keys when an empty prefix array is supplied", () => {
    writeFileSync(join(dir, ".env"), "ANY_KEY=val");
    const result = loadEnv("development", dir, []);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// ensureElectrobunConfigFile — writes to tmpdir and cleans up
// ---------------------------------------------------------------------------

describe("ensureElectrobunConfigFile", () => {
  let dir: string;
  let cleanup: () => void;

  beforeEach(() => {
    const tmp = makeTempDir("ensure-config");
    dir = tmp.dir;
    cleanup = tmp.cleanup;
  });

  afterEach(() => cleanup());

  test("throws when no electrobun config is available", async () => {
    const resolved = makeResolvedConfig(dir, { config: null, configFile: false });
    await expect(ensureElectrobunConfigFile(resolved)).rejects.toThrow(
      /No Electrobun config found/,
    );
  });

  test("writes generated config file to tmpdir", async () => {
    const resolved = makeResolvedConfig(dir, {
      config: { appId: "com.test.app", name: "TestApp" },
      configFile: false,
    });
    const result = await ensureElectrobunConfigFile(resolved);

    try {
      expect(result.path).toStartWith(tmpdir());
      expect(existsSync(result.path)).toBe(true);
    } finally {
      await result.cleanup();
    }
  });

  test("generated config file contains the expected export", async () => {
    const resolved = makeResolvedConfig(dir, {
      config: { appId: "com.example.test", version: "1.2.3" },
      configFile: false,
    });
    const result = await ensureElectrobunConfigFile(resolved);

    try {
      const contents = await Bun.file(result.path).text();
      expect(contents).toContain("export default");
      expect(contents).toContain('"com.example.test"');
      expect(contents).toContain('"1.2.3"');
      expect(contents).toContain("// Generated by @nova-infra/electrobun-vite");
    } finally {
      await result.cleanup();
    }
  });

  test("cleanup() removes the generated file", async () => {
    const resolved = makeResolvedConfig(dir, {
      config: { appId: "com.cleanup.test" },
      configFile: false,
    });
    const result = await ensureElectrobunConfigFile(resolved);
    const { path } = result;

    expect(existsSync(path)).toBe(true);
    await result.cleanup();
    expect(existsSync(path)).toBe(false);
  });

  test("generated file name includes the process pid", async () => {
    const resolved = makeResolvedConfig(dir, {
      config: { appId: "com.pid.test" },
      configFile: false,
    });
    const result = await ensureElectrobunConfigFile(resolved);

    try {
      expect(result.path).toContain(String(process.pid));
    } finally {
      await result.cleanup();
    }
  });

  test("returns existing electrobun.config.ts when it is present on disk", async () => {
    const existingConfigFile = join(dir, "electrobun.config.ts");
    writeFileSync(existingConfigFile, "export default {};");

    // Point the resolved config at the real existing file (not false).
    const resolved = makeResolvedConfig(dir, {
      config: null,
      configFile: existingConfigFile,
    });

    const result = await ensureElectrobunConfigFile(resolved);
    // cleanup is a no-op for the pre-existing file path.
    expect(result.path).toBe(existingConfigFile);
    await result.cleanup();
  });
});

// ---------------------------------------------------------------------------
// createInlineConfig — CLI --config flag parsing
// ---------------------------------------------------------------------------

describe("createInlineConfig", () => {
  test("maps options.config string to configFile", () => {
    const result = _createInlineConfig("/my/root", { config: "my.config.ts" });
    expect(result.configFile).toBe("my.config.ts");
  });

  test("leaves configFile undefined when options.config is absent", () => {
    const result = _createInlineConfig("/my/root", {});
    expect(result.configFile).toBeUndefined();
  });

  test("sets root from first positional argument", () => {
    const result = _createInlineConfig("/project", {});
    expect(result.root).toBe("/project");
  });

  test("root is undefined when not provided", () => {
    const result = _createInlineConfig(undefined, {});
    expect(result.root).toBeUndefined();
  });

  test("maps logLevel from options", () => {
    const result = _createInlineConfig(undefined, { logLevel: "warn" });
    expect(result.logLevel).toBe("warn");
  });

  test("maps clearScreen from options", () => {
    const result = _createInlineConfig(undefined, { clearScreen: false });
    expect(result.clearScreen).toBe(false);
  });

  test("maps mode from options", () => {
    const result = _createInlineConfig(undefined, { mode: "staging" });
    expect(result.mode).toBe("staging");
  });

  test("maps build.outDir from options.outDir", () => {
    const result = _createInlineConfig(undefined, { outDir: "out" });
    expect(result.build?.outDir).toBe("out");
  });

  test("maps build.watch from options.watch", () => {
    const result = _createInlineConfig(undefined, { watch: true });
    expect(result.build?.watch).toBe(true);
  });

  test("maps entry from options.entry", () => {
    const result = _createInlineConfig(undefined, { entry: "src/main.ts" });
    expect(result.entry).toBe("src/main.ts");
  });
});
