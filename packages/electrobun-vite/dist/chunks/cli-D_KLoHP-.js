import { a as workspaceModules, i as templatePackages, n as starterDependencyVersions, r as starterVersions, t as PACKAGE_VERSION } from "./metadata-D1UUA67U.js";
import colors from "picocolors";
import { build, createServer, mergeConfig } from "vite";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cac } from "cac";
import { createRequire } from "node:module";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
//#region src/icon.ts
/** Electrobun 官方要求的 icon.iconset 尺寸与文件名（见 Application Icons 文档） */
var ICONSET_ENTRIES = [
	{
		size: 16,
		name: "icon_16x16.png"
	},
	{
		size: 32,
		name: "icon_16x16@2x.png"
	},
	{
		size: 32,
		name: "icon_32x32.png"
	},
	{
		size: 64,
		name: "icon_32x32@2x.png"
	},
	{
		size: 128,
		name: "icon_128x128.png"
	},
	{
		size: 256,
		name: "icon_128x128@2x.png"
	},
	{
		size: 256,
		name: "icon_256x256.png"
	},
	{
		size: 512,
		name: "icon_256x256@2x.png"
	},
	{
		size: 512,
		name: "icon_512x512.png"
	},
	{
		size: 1024,
		name: "icon_512x512@2x.png"
	}
];
var SOURCE_FILENAME = "logo.png";
/** 包内默认图标路径（当项目根没有 logo.png 时使用） */
var defaultIconPath = join(import.meta.dir, "..", SOURCE_FILENAME);
/**
* 查找项目根的 logo.png，并返回其路径；否则返回包内默认 logo.png。
*/
function findLogoSource(cwd) {
	const inCwd = join(cwd, SOURCE_FILENAME);
	if (existsSync(inCwd)) return inCwd;
	return defaultIconPath;
}
/**
* 检查 appRoot/icon.iconset 是否已存在且包含所需文件。
*/
function hasValidIconIconset(appRoot) {
	const dir = join(appRoot, "icon.iconset");
	if (!existsSync(dir)) return false;
	for (const { name } of ICONSET_ENTRIES) if (!existsSync(join(dir, name))) return false;
	return true;
}
/**
* 使用 macOS sips 从一张 PNG 生成 icon.iconset 中所有尺寸。
* 仅在 darwin 上执行；其他平台跳过。
*/
async function generateIconIconsetFromPng(sourcePngPath, outDir) {
	if (process.platform !== "darwin") return false;
	await mkdir(outDir, { recursive: true });
	for (const { size, name } of ICONSET_ENTRIES) {
		const outPath = join(outDir, name);
		const proc = Bun.spawn([
			"sips",
			"-z",
			String(size),
			String(size),
			sourcePngPath,
			"--out",
			outPath
		], {
			stdout: "ignore",
			stderr: "pipe"
		});
		if (await proc.exited !== 0) {
			const err = await new Response(proc.stderr).text();
			throw new Error(`sips failed for ${name}: ${err}`);
		}
	}
	return true;
}
/**
* 确保 appRoot 下存在符合 Electrobun 约定的 icon.iconset。
* 优先使用项目根目录的 logo.png，否则使用包内默认图标。
* 返回是否已确保 icon.iconset 可用（可用于决定是否写入 build.mac.icons）。
*/
async function ensureIconIconset(appRoot) {
	if (hasValidIconIconset(appRoot)) return true;
	const sourcePng = findLogoSource(appRoot);
	if (!existsSync(sourcePng)) return false;
	await generateIconIconsetFromPng(sourcePng, join(appRoot, "icon.iconset"));
	return true;
}
//#endregion
//#region src/config.ts
var defineConfig = (config) => config;
var resolveConfigFile = (cwd = process.cwd(), configFile) => {
	if (configFile === false) return null;
	if (typeof configFile === "string") {
		const resolvedConfigFile = resolve(cwd, configFile);
		return existsSync(resolvedConfigFile) ? resolvedConfigFile : null;
	}
	const candidates = [
		join(cwd, "electrobun.vite.config.ts"),
		join(cwd, "electrobun.vite.config.mts"),
		join(cwd, "electrobun.vite.config.js"),
		join(cwd, "electrobun.vite.config.mjs")
	];
	for (const candidate of candidates) if (existsSync(candidate)) return candidate;
	return null;
};
var mergeConfigWithDefaults = (cwd, userConfig, inlineConfig) => {
	const outDir = inlineConfig.build?.outDir ?? userConfig.electrobun?.outDir ?? userConfig.renderer?.build?.outDir ?? "dist";
	const rendererUsesInlineConfig = userConfig.renderer?.configFile === false || Boolean(userConfig.renderer?.vite);
	const rendererOutDir = resolve(cwd, outDir);
	const rendererPublicDir = userConfig.renderer?.publicDir ?? "resources";
	const rendererConfigFileName = typeof userConfig.renderer?.configFile === "string" ? userConfig.renderer.configFile : "vite.config.ts";
	const rendererConfigFile = rendererUsesInlineConfig ? false : resolve(cwd, rendererConfigFileName);
	const defaultInlineRendererConfig = {
		root: resolve(cwd, "src/ui"),
		base: "./",
		server: {
			host: "127.0.0.1",
			port: 5173,
			strictPort: true
		},
		build: {
			outDir: rendererOutDir,
			emptyOutDir: true,
			sourcemap: true,
			rollupOptions: { output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name][extname]"
			} }
		}
	};
	const rendererViteConfig = mergeConfig(rendererUsesInlineConfig ? defaultInlineRendererConfig : {}, userConfig.renderer?.vite ?? {});
	const rendererVitePublicDir = rendererViteConfig.publicDir ?? resolve(cwd, rendererPublicDir);
	const resolvedElectrobunConfigFile = userConfig.electrobun?.configFile === false ? false : resolve(cwd, typeof userConfig.electrobun?.configFile === "string" ? userConfig.electrobun.configFile : "electrobun.config.ts");
	return {
		...userConfig,
		renderer: {
			configFile: rendererConfigFile,
			vite: mergeConfig(rendererViteConfig, {
				publicDir: rendererVitePublicDir,
				server: {
					host: userConfig.renderer?.dev?.host ?? "127.0.0.1",
					port: userConfig.renderer?.dev?.port ?? 5173,
					strictPort: userConfig.renderer?.dev?.strictPort ?? true
				},
				build: { outDir: rendererOutDir }
			}),
			dev: {
				host: userConfig.renderer?.dev?.host ?? "127.0.0.1",
				port: userConfig.renderer?.dev?.port ?? 5173,
				strictPort: userConfig.renderer?.dev?.strictPort ?? true
			},
			build: { outDir }
		},
		electrobun: {
			configFile: resolvedElectrobunConfigFile,
			outDir,
			config: null
		}
	};
};
var resolveElectrobunConfigFile = (resolved) => {
	const configFile = resolved.config.electrobun.configFile;
	return configFile && existsSync(configFile) ? configFile : null;
};
var resolveUserConfigExport = async (configExport, env) => {
	if (!configExport) return {};
	if (typeof configExport === "function") return await configExport(env) ?? {};
	return await configExport ?? {};
};
var resolveElectrobunConfigInput = async (configInput, context) => {
	if (!configInput) return null;
	if (typeof configInput === "function") return await configInput(context) ?? null;
	return await configInput ?? null;
};
var loadUserConfig = async (inlineConfig = {}, command = "serve", defaultMode = "development") => {
	const cwd = resolve(inlineConfig.root ?? process.cwd());
	const mode = inlineConfig.mode ?? defaultMode;
	const configFile = resolveConfigFile(cwd, inlineConfig.configFile);
	let userConfig = {};
	if (configFile) userConfig = await resolveUserConfigExport((await import(pathToFileURL(configFile).href)).default, {
		command,
		mode
	});
	const mergedConfig = mergeConfigWithDefaults(cwd, userConfig, inlineConfig);
	mergedConfig.electrobun.config = await resolveElectrobunConfigInput(userConfig.electrobun?.config, {
		cwd,
		outDir: mergedConfig.electrobun.outDir,
		command,
		mode
	});
	return {
		cwd,
		command,
		mode,
		logLevel: inlineConfig.logLevel ?? "info",
		clearScreen: inlineConfig.clearScreen ?? true,
		configFile,
		config: mergedConfig
	};
};
var getRendererOutDir = (resolved) => resolved.config.renderer.build.outDir;
var getDefaultTemplateName = () => templatePackages[0]?.directory ?? "react-ts";
var serializeElectrobunValue = (value) => {
	if (value === null) return "null";
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) return `[${value.map((item) => serializeElectrobunValue(item)).join(", ")}]`;
	return `{\n${Object.entries(value).filter(([, entryValue]) => entryValue !== void 0).map(([key, entryValue]) => `${JSON.stringify(key)}: ${serializeElectrobunValue(entryValue)}`).map((entry) => `  ${entry}`).join(",\n")}\n}`;
};
var exitCleanupPaths = /* @__PURE__ */ new Set();
var hasRegisteredExitCleanup = false;
var registerExitCleanup = (path) => {
	exitCleanupPaths.add(path);
	if (hasRegisteredExitCleanup) return;
	hasRegisteredExitCleanup = true;
	process.on("exit", () => {
		for (const candidate of exitCleanupPaths) try {
			rmSync(candidate, { force: true });
		} catch {}
	});
};
var ensureElectrobunConfigFile = async (resolved) => {
	await ensureIconIconset(resolved.cwd);
	const existingConfigFile = resolveElectrobunConfigFile(resolved);
	if (existingConfigFile) return {
		path: existingConfigFile,
		cleanup: async () => {}
	};
	let inlineConfig = resolved.config.electrobun.config;
	if (!inlineConfig) throw new Error("No Electrobun config found. Add electrobun.config.ts or define electrobun.config inside electrobun.vite.config.ts.");
	if (await ensureIconIconset(resolved.cwd)) {
		const build = inlineConfig.build;
		inlineConfig = {
			...inlineConfig,
			build: {
				...build,
				mac: {
					...build?.mac,
					icons: "icon.iconset"
				}
			}
		};
	}
	const generatedConfigPath = join(resolved.cwd, "electrobun.config.ts");
	const generatedFileContents = [
		"// Generated by @nova-infra/electrobun-vite. Do not edit.",
		`export default ${serializeElectrobunValue(inlineConfig)};`,
		""
	].join("\n");
	registerExitCleanup(generatedConfigPath);
	await writeFile(generatedConfigPath, generatedFileContents, "utf8");
	return {
		path: generatedConfigPath,
		cleanup: async () => {
			await rm(generatedConfigPath, { force: true });
			exitCleanupPaths.delete(generatedConfigPath);
		}
	};
};
var getTemplateDirectory = (name = "react-ts") => {
	if (name !== "react-ts" && !name.endsWith("react-ts")) throw new Error("Only the react-ts template is currently supported.");
	const template = templatePackages.find((item) => item.directory === name || item.name === name || item.packageName === name || item.packageName.endsWith(name));
	if (!template) throw new Error(`Unknown template: ${name}`);
	return template.directory;
};
//#endregion
//#region src/env.ts
var defaultPrefixes = [
	"BUN_VITE_",
	"RENDERER_VITE_",
	"VITE_"
];
function parseDotenv(contents) {
	const out = {};
	for (const rawLine of contents.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq <= 0) continue;
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if (!key) continue;
		if (value.startsWith("\"") && value.endsWith("\"") || value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
		else {
			const commentIdx = value.search(/\s#/);
			if (commentIdx >= 0) value = value.slice(0, commentIdx).trimEnd();
		}
		out[key] = value;
	}
	return out;
}
function loadEnv(mode, root, prefixes = defaultPrefixes) {
	const files = [
		".env",
		".env.local",
		`.env.${mode}`,
		`.env.${mode}.local`
	];
	const merged = {};
	for (const file of files) {
		const fullPath = resolve(root, file);
		if (!existsSync(fullPath)) continue;
		Object.assign(merged, parseDotenv(readFileSync(fullPath, "utf8")));
	}
	const out = {};
	for (const [key, value] of Object.entries(merged)) if (prefixes.some((p) => key.startsWith(p))) out[key] = value;
	return out;
}
//#endregion
//#region src/logger.ts
var LOG_LEVEL_ORDER = {
	info: 0,
	warn: 1,
	error: 2,
	silent: 3
};
var normalizeLogLevel = (logLevel) => logLevel ?? "info";
var shouldEmit = (configuredLevel, level) => configuredLevel !== "silent" && LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[configuredLevel];
var LOG_SCOPE_ELECTROBUN = "electrobun";
var LOG_SCOPE_VITE = "vite";
var LOG_SCOPE_LAUNCHER = "electrobun";
var LOG_SCOPE_BUILD = "build";
var LOG_SCOPE_MAIN = "main";
var LOG_SCOPE_RENDERER = "renderer";
var LOG_SCOPE_CONFIG = "config";
var LOG_SCOPE_WATCH = "watch";
var LOG_SCOPE_BUN_BUILD = "bun.build";
var normalizeScope = (scope) => scope.trim().toLowerCase();
var normalizeTaggedScope = (scope) => {
	const normalized = normalizeScope(scope);
	if (normalized === "electrobun") return LOG_SCOPE_LAUNCHER;
	if (normalized.startsWith("launcher")) return LOG_SCOPE_LAUNCHER;
	if (normalized.startsWith("bun.build")) return normalized;
	if (normalized === "ui" || normalized === "renderer" || normalized === "webview") return LOG_SCOPE_RENDERER;
	if (normalized === "electrobun dev --watch") return LOG_SCOPE_WATCH;
	return normalized;
};
var formatScope = (scope) => {
	const normalizedScope = normalizeScope(scope);
	if (normalizedScope === "electrobun" || normalizedScope === "electrobun") return colors.bold(colors.yellow(scope));
	if (normalizedScope === "vite") return colors.bold(colors.cyan(scope));
	if (normalizedScope === "build" || normalizedScope.startsWith("bun.build")) return colors.bold(colors.magenta(scope));
	if (normalizedScope === "main") return colors.bold(colors.green(scope));
	if (normalizedScope === "renderer") return colors.bold(colors.magentaBright(scope));
	if (normalizedScope === "config") return colors.bold(colors.blue(scope));
	if (normalizedScope === "watch") return colors.bold(colors.cyan(scope));
	return colors.bold(scope);
};
var formatPrefix = (scope) => scope ? `${formatScope(scope)} ` : "";
var writeLines = (writer, prefix, message) => {
	for (const line of message.split(/\r?\n/g)) {
		if (line.length === 0) {
			writer("");
			continue;
		}
		writer(prefix + line);
	}
};
var readStreamLines = async (stream, onLine) => {
	if (!stream) return;
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let newlineIndex = buffer.indexOf("\n");
			while (newlineIndex >= 0) {
				const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
				if (line.length > 0) onLine(line);
				buffer = buffer.slice(newlineIndex + 1);
				newlineIndex = buffer.indexOf("\n");
			}
		}
		buffer += decoder.decode();
		const trailingLine = buffer.replace(/\r$/, "");
		if (trailingLine.length > 0) onLine(trailingLine);
	} finally {
		reader.releaseLock();
	}
};
var writeToConsole = (writer, level, text) => {
	if (level === "error") {
		writer.error(text);
		return;
	}
	if (level === "warn") {
		writer.warn(text);
		return;
	}
	writer.log(text);
};
var ELECTROBUN_VITE_LOG_LEVEL_ENV = "ELECTROBUN_VITE_LOG_LEVEL";
var createLogEnvironment = (logLevel) => ({ [ELECTROBUN_VITE_LOG_LEVEL_ENV]: normalizeLogLevel(logLevel) });
var createToolLogger = (logLevel, writer = console) => {
	const configuredLevel = normalizeLogLevel(logLevel);
	const emit = (level, message, options = {}) => {
		if (!options.force && !shouldEmit(configuredLevel, level)) return;
		writeLines((line) => writeToConsole(writer, level, line), formatPrefix(options.scope), message);
	};
	const output = (message, options = {}) => {
		writeLines(writer.log.bind(writer), formatPrefix(options.scope), message);
	};
	const fatal = (message, options = {}) => {
		writeLines(writer.error.bind(writer), formatPrefix(options.scope), message);
	};
	return {
		logLevel: configuredLevel,
		info: (message, options) => emit("info", message, options),
		success: (message, options) => emit("info", colors.green(message), options),
		warn: (message, options) => emit("warn", message, options),
		error: (message, options) => emit("error", message, options),
		output,
		fatal
	};
};
var createViteLogger = (logLevel, writer = console) => {
	const logger = createToolLogger(logLevel, writer);
	const warnedMessages = /* @__PURE__ */ new Set();
	const loggedErrors = /* @__PURE__ */ new WeakSet();
	return {
		hasWarned: false,
		info(message) {
			logger.info(message, { scope: LOG_SCOPE_VITE });
		},
		warn(message) {
			this.hasWarned = true;
			logger.warn(message, { scope: LOG_SCOPE_VITE });
		},
		warnOnce(message) {
			if (warnedMessages.has(message)) return;
			warnedMessages.add(message);
			this.warn(message);
		},
		error(message, options) {
			const error = options?.error;
			if (error && typeof error === "object") loggedErrors.add(error);
			logger.error(message, { scope: LOG_SCOPE_VITE });
		},
		clearScreen() {
			writer.clear?.();
		},
		hasErrorLogged(error) {
			return typeof error === "object" && error !== null ? loggedErrors.has(error) : false;
		}
	};
};
var parseTaggedSubprocessLine = (line, defaultLevel) => {
	const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
	if (!match) return null;
	const rawScope = match[1]?.trim();
	if (!rawScope) return null;
	const message = match[2] ?? "";
	const normalizedScope = normalizeTaggedScope(rawScope);
	const normalizedMessage = message.trim().toLowerCase();
	const normalizedRawScope = normalizeScope(rawScope);
	let level = defaultLevel;
	if (normalizedRawScope.includes("error") || normalizedMessage.startsWith("error:")) level = "error";
	else if (normalizedRawScope.includes("warn") || normalizedMessage.startsWith("warning:")) level = "warn";
	return {
		scope: normalizedScope,
		message,
		level
	};
};
var classifyUnscopedSubprocessLine = (line, context, defaultLevel) => {
	const normalizedLine = line.trim().toLowerCase();
	if (normalizedLine.startsWith("launcher starting") || normalizedLine.startsWith("current directory:") || normalizedLine.startsWith("spawning:") || normalizedLine.startsWith("dev build detected") || normalizedLine.startsWith("child process spawned") || normalizedLine.startsWith("child process exited")) return {
		scope: LOG_SCOPE_LAUNCHER,
		message: line,
		level: defaultLevel
	};
	if (normalizedLine.includes("using config file") || normalizedLine.includes("config file must export") || normalizedLine.includes("failed to load config file") || normalizedLine === "using default config instead") return {
		scope: LOG_SCOPE_CONFIG,
		message: line,
		level: defaultLevel
	};
	if (normalizedLine.includes("watch")) return {
		scope: LOG_SCOPE_WATCH,
		message: line,
		level: defaultLevel
	};
	if (context === "electrobun-build") return {
		scope: LOG_SCOPE_BUILD,
		message: line,
		level: normalizedLine.includes("bundle failed") || normalizedLine.includes("failed to build") || normalizedLine.includes("build failed") || normalizedLine.startsWith("error:") ? "error" : defaultLevel
	};
	return {
		scope: LOG_SCOPE_MAIN,
		message: line,
		level: defaultLevel
	};
};
var classifySubprocessLine = (line, context, defaultLevel) => parseTaggedSubprocessLine(line, defaultLevel) ?? classifyUnscopedSubprocessLine(line, context, defaultLevel);
var writeClassifiedSubprocessLine = (logger, classifiedLine) => {
	if (classifiedLine.level === "error") {
		logger.error(classifiedLine.message, { scope: classifiedLine.scope });
		return;
	}
	if (classifiedLine.level === "warn") {
		logger.warn(classifiedLine.message, { scope: classifiedLine.scope });
		return;
	}
	logger.info(classifiedLine.message, { scope: classifiedLine.scope });
};
var pipeSubprocessLogs = async (child, logger, context) => {
	await Promise.all([readStreamLines(child.stdout, (line) => {
		writeClassifiedSubprocessLine(logger, classifySubprocessLine(line, context, "info"));
	}), readStreamLines(child.stderr, (line) => {
		writeClassifiedSubprocessLine(logger, classifySubprocessLine(line, context, "warn"));
	})]);
};
//#endregion
//#region src/build.ts
var ELECTROBUN_EXTERNALS = [
	"electrobun",
	"electrobun/bun",
	"electrobun/view"
];
var extractBunEntryConfig = (inlineConfig) => {
	const bun = inlineConfig.build?.bun;
	return {
		entrypoint: typeof bun?.entrypoint === "string" ? bun.entrypoint : null,
		externals: Array.isArray(bun?.external) ? bun.external : []
	};
};
var preBundleEntrypoint = async (inlineConfig, cwd, logger) => {
	const { entrypoint, externals } = extractBunEntryConfig(inlineConfig);
	if (!entrypoint) return {
		config: inlineConfig,
		cleanup: async () => {}
	};
	const tmpDir = resolve(cwd, `.electrobun-prebundle-${process.pid}`);
	const absoluteEntrypoint = resolve(cwd, entrypoint);
	logger.info(`pre-bundling ${entrypoint} (bundling ${externals.length} heavy deps, external: ${ELECTROBUN_EXTERNALS.join(", ")})...`, { scope: LOG_SCOPE_BUILD });
	const result = await Bun.build({
		entrypoints: [absoluteEntrypoint],
		outdir: tmpDir,
		target: "bun",
		external: ELECTROBUN_EXTERNALS,
		minify: false
	});
	if (!result.success) {
		const errorLines = result.logs.map((l) => l.message).join("\n");
		throw new Error(`pre-bundle failed for ${entrypoint}:\n${errorLines}`);
	}
	const outputName = basename(entrypoint).replace(/\.(ts|tsx|mts)$/, ".js");
	const bundledPath = `.electrobun-prebundle-${process.pid}/${outputName}`;
	const build = inlineConfig.build;
	const bun = build?.bun;
	const newConfig = {
		...inlineConfig,
		build: {
			...build ?? {},
			bun: {
				...bun ?? {},
				entrypoint: bundledPath
			}
		}
	};
	logger.success(`pre-bundled -> ${bundledPath}`, { scope: LOG_SCOPE_BUILD });
	return {
		config: newConfig,
		cleanup: async () => {
			await rm(tmpDir, {
				recursive: true,
				force: true
			});
		}
	};
};
var withPreBundle = async (resolved, logger) => {
	const inlineConfig = resolved.config.electrobun.config;
	if (!inlineConfig) return {
		resolved,
		cleanup: async () => {}
	};
	const { externals } = extractBunEntryConfig(inlineConfig);
	if (externals.length === 0) return {
		resolved,
		cleanup: async () => {}
	};
	const { config: preBundledConfig, cleanup } = await preBundleEntrypoint(inlineConfig, resolved.cwd, logger);
	return {
		resolved: {
			...resolved,
			config: {
				...resolved.config,
				electrobun: {
					...resolved.config.electrobun,
					config: preBundledConfig
				}
			}
		},
		cleanup
	};
};
async function build$1(inlineConfig = {}) {
	process.env.NODE_ENV_ELECTROBUN_VITE = "production";
	const resolved = await loadUserConfig(inlineConfig, "build", "production");
	const logger = createToolLogger(resolved.logLevel);
	const viteLogger = createViteLogger(resolved.logLevel);
	logger.info("building renderer...", { scope: LOG_SCOPE_VITE });
	await build({
		...resolved.config.renderer.vite,
		configFile: resolved.config.renderer.configFile,
		mode: resolved.mode,
		logLevel: resolved.logLevel,
		clearScreen: resolved.clearScreen,
		customLogger: viteLogger
	});
	logger.success(`renderer built -> ${getRendererOutDir(resolved)}`, { scope: LOG_SCOPE_VITE });
	const { resolved: resolvedForBuild, cleanup: preBundleCleanup } = await withPreBundle(resolved, logger);
	const electrobunConfig = await ensureElectrobunConfigFile(resolvedForBuild);
	logger.info("building electrobun app...", { scope: LOG_SCOPE_BUILD });
	try {
		const child = Bun.spawn([
			"bunx",
			"electrobun",
			"build"
		], {
			cwd: resolved.cwd,
			env: {
				...process.env,
				...loadEnv(resolved.mode, resolved.cwd, ["BUN_VITE_", "VITE_"]),
				ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
				...createLogEnvironment(resolved.logLevel)
			},
			stdin: "inherit",
			stdout: "pipe",
			stderr: "pipe"
		});
		const childLogs = pipeSubprocessLogs(child, logger, "electrobun-build");
		const exitCode = await child.exited;
		await childLogs;
		if (exitCode !== 0) {
			logger.fatal(colors.red(`electrobun build failed (exit ${exitCode})`), { scope: LOG_SCOPE_BUILD });
			logger.info(colors.dim("hint: if the bun entrypoint imports npm packages with native bindings or complex dependency trees, add them to electrobun.config → build.bun.external (e.g. external: [\"grammy\", \"zod\"])"), { scope: LOG_SCOPE_BUILD });
			process.exit(exitCode);
		}
		logger.success("build complete.", { scope: LOG_SCOPE_BUILD });
	} finally {
		await electrobunConfig.cleanup();
		await preBundleCleanup();
	}
}
//#endregion
//#region src/server.ts
var waitForTermination = async (cleanup) => {
	await new Promise((resolve, reject) => {
		const onSignal = async () => {
			try {
				await cleanup();
				resolve();
			} catch (error) {
				reject(error);
			}
		};
		process.once("SIGINT", onSignal);
		process.once("SIGTERM", onSignal);
	});
};
async function createServer$1(inlineConfig = {}, options = {}) {
	process.env.NODE_ENV_ELECTROBUN_VITE = "development";
	const resolved = await loadUserConfig(inlineConfig, "serve", "development");
	const logger = createToolLogger(resolved.logLevel);
	const viteLogger = createViteLogger(resolved.logLevel);
	const server = await createServer({
		...resolved.config.renderer.vite,
		configFile: resolved.config.renderer.configFile,
		mode: resolved.mode,
		logLevel: resolved.logLevel,
		clearScreen: resolved.clearScreen,
		customLogger: viteLogger
	});
	const { resolved: resolvedForDev, cleanup: preBundleCleanup } = await withPreBundle(resolved, logger);
	const electrobunConfig = await ensureElectrobunConfigFile(resolvedForDev);
	try {
		await server.listen();
		const devServerUrl = server.resolvedUrls?.local[0] ?? `http://${resolved.config.renderer.dev.host}:${resolved.config.renderer.dev.port}`;
		if (options.rendererOnly) {
			logger.info(`renderer dev server -> ${devServerUrl}`, { scope: LOG_SCOPE_VITE });
			await waitForTermination(async () => {
				await server.close();
				await electrobunConfig.cleanup();
				await preBundleCleanup();
			});
			return;
		}
		logger.info(`renderer -> ${devServerUrl}`, { scope: LOG_SCOPE_VITE });
		logger.info("starting electrobun dev process...", { scope: LOG_SCOPE_LAUNCHER });
		const child = Bun.spawn([
			"bunx",
			"electrobun",
			"dev",
			...options.watch ? ["--watch"] : []
		], {
			cwd: resolved.cwd,
			env: {
				...process.env,
				...loadEnv(resolved.mode, resolved.cwd, ["BUN_VITE_", "VITE_"]),
				ELECTROBUN_VITE_DEV_SERVER_URL: devServerUrl,
				ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
				...createLogEnvironment(resolved.logLevel)
			},
			stdin: "inherit",
			stdout: "pipe",
			stderr: "pipe"
		});
		const childLogs = pipeSubprocessLogs(child, logger, "electrobun-dev");
		await Promise.race([child.exited.then(async (exitCode) => {
			await childLogs;
			await server.close();
			await electrobunConfig.cleanup();
			await preBundleCleanup();
			if (exitCode !== 0) {
				logger.fatal(colors.red(`electrobun dev failed (exit ${exitCode})`), { scope: LOG_SCOPE_LAUNCHER });
				process.exit(exitCode);
			}
		}), waitForTermination(async () => {
			if (child.exitCode === null) {
				child.kill();
				await child.exited;
			}
			await childLogs;
			await server.close();
			await electrobunConfig.cleanup();
			await preBundleCleanup();
		})]);
	} catch (error) {
		await server.close();
		await electrobunConfig.cleanup();
		await preBundleCleanup();
		throw error;
	}
}
//#endregion
//#region src/preview.ts
async function preview(inlineConfig = {}, options = {}) {
	const resolved = await loadUserConfig(inlineConfig, "preview", "production");
	const logger = createToolLogger(resolved.logLevel);
	if (!options.skipBuild) await build$1(inlineConfig);
	const electrobunConfig = await ensureElectrobunConfigFile(resolved);
	logger.info("starting preview (electrobun dev)...", { scope: LOG_SCOPE_LAUNCHER });
	try {
		const child = Bun.spawn([
			"bunx",
			"electrobun",
			"dev"
		], {
			cwd: resolved.cwd,
			env: {
				...process.env,
				ELECTROBUN_VITE_OUT_DIR: getRendererOutDir(resolved),
				...createLogEnvironment(resolved.logLevel)
			},
			stdin: "inherit",
			stdout: "pipe",
			stderr: "pipe"
		});
		const childLogs = pipeSubprocessLogs(child, logger, "electrobun-preview");
		const exitCode = await child.exited;
		await childLogs;
		if (exitCode !== 0) {
			logger.fatal(colors.red(`preview failed (exit ${exitCode})`), { scope: LOG_SCOPE_LAUNCHER });
			process.exit(exitCode);
		}
	} finally {
		await electrobunConfig.cleanup();
	}
}
//#endregion
//#region src/create.ts
var listTemplates = () => templatePackages;
var resolveTemplate = (name = "react-ts") => {
	if (name !== "react-ts" && !name.endsWith("react-ts")) throw new Error("Only the react-ts template is currently supported.");
	const template = templatePackages[0];
	if (!template) throw new Error(`Unknown template: ${name}`);
	return template;
};
var ignoredDirectories = new Set([
	"node_modules",
	"dist",
	"build"
]);
var findWorkspaceRoot = (startDir) => {
	let currentDir = startDir;
	while (true) {
		if (existsSync(resolve(currentDir, "templates", "react-ts"))) return currentDir;
		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) return null;
		currentDir = parentDir;
	}
};
var require = createRequire(import.meta.url);
var resolveInstalledTemplateDir = (packageName) => {
	try {
		return dirname(require.resolve(`${packageName}/package.json`));
	} catch {
		return null;
	}
};
var findTemplateSourceDir = (templateDir, packageName) => {
	const localWorkspaceRoot = findWorkspaceRoot(import.meta.dir);
	const localTemplateDir = localWorkspaceRoot ? resolve(localWorkspaceRoot, "templates", templateDir) : null;
	if (localTemplateDir && existsSync(localTemplateDir)) return localTemplateDir;
	const installedTemplateDir = resolveInstalledTemplateDir(packageName);
	if (installedTemplateDir && existsSync(installedTemplateDir)) return installedTemplateDir;
	throw new Error(`Could not locate template files for ${templateDir}.`);
};
var isDirectoryEmpty = async (dir) => {
	return (await readdir(dir, { withFileTypes: true })).length === 0;
};
var confirmCurrentDirectoryScaffold = async (targetDir) => {
	if (await isDirectoryEmpty(targetDir)) return true;
	if (!stdin.isTTY || !stdout.isTTY) throw new Error("Current directory is not empty. Run this command in an interactive terminal to confirm scaffolding into .");
	const terminal = createInterface({
		input: stdin,
		output: stdout
	});
	try {
		const answer = await terminal.question("Current directory is not empty. Continue scaffolding here? [y/N] ");
		return /^y(es)?$/i.test(answer.trim());
	} finally {
		terminal.close();
	}
};
var ensureTargetDirectory = async (targetDir, force = false) => {
	if (force) {
		await mkdir(targetDir, { recursive: true });
		return;
	}
	await mkdir(targetDir, { recursive: false });
};
var sanitizePackageName = (value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "electrobun-app";
var toDisplayName = (value) => sanitizePackageName(value).split("-").filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
var toBundleIdentifier = (value) => `dev.electrobun.${sanitizePackageName(value).replace(/-/g, "")}`;
var patchTemplateFiles = async (targetDir, projectName) => {
	const projectSlug = basename(projectName);
	const packageName = sanitizePackageName(projectSlug);
	const displayName = toDisplayName(projectSlug);
	const bundleIdentifier = toBundleIdentifier(projectSlug);
	const packageJsonPath = join(targetDir, "package.json");
	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
	packageJson.name = packageName;
	await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
	const electrobunConfigPath = join(targetDir, "electrobun.vite.config.ts");
	await writeFile(electrobunConfigPath, (await readFile(electrobunConfigPath, "utf8")).replace("name: \"Electrobun React Vite Starter\"", `name: "${displayName}"`).replace("identifier: \"sh.blackboard.examples.electrobun-vite\"", `identifier: "${bundleIdentifier}"`));
	const rpcPath = join(targetDir, "src/shared/rpc.ts");
	await writeFile(rpcPath, (await readFile(rpcPath, "utf8")).replace("export const APP_NAME = \"Electrobun React Vite Starter\";", `export const APP_NAME = "${displayName}";`));
};
var scaffoldProject = async ({ cwd = process.cwd(), projectName, template = "react-ts", force = false }) => {
	const templateDir = getTemplateDirectory(template);
	const templatePackage = resolveTemplate(template);
	const sourceDir = findTemplateSourceDir(templateDir, templatePackage.packageName);
	const targetDir = resolve(cwd, projectName);
	const isCurrentDirectory = projectName === "." || projectName === "";
	const projectSlug = isCurrentDirectory ? basename(cwd) : basename(projectName);
	if (isCurrentDirectory) {
		if (!(force || await confirmCurrentDirectoryScaffold(targetDir))) throw new Error("Aborted.");
	} else await ensureTargetDirectory(targetDir, force);
	await cp(sourceDir, targetDir, {
		recursive: true,
		filter: (source) => !ignoredDirectories.has(basename(source))
	});
	await patchTemplateFiles(targetDir, projectSlug);
	return {
		targetDir,
		template: templatePackage
	};
};
//#endregion
//#region src/update.ts
var managedDependencies = [
	{
		name: "@nova-infra/electrobun-vite",
		version: PACKAGE_VERSION,
		section: "devDependencies"
	},
	{
		name: "electrobun",
		version: starterDependencyVersions.electrobun,
		section: "dependencies"
	},
	{
		name: "react",
		version: starterDependencyVersions.react,
		section: "dependencies"
	},
	{
		name: "react-dom",
		version: starterDependencyVersions["react-dom"],
		section: "dependencies"
	},
	{
		name: "vite",
		version: starterDependencyVersions.vite,
		section: "devDependencies"
	},
	{
		name: "@vitejs/plugin-react",
		version: starterDependencyVersions["@vitejs/plugin-react"],
		section: "devDependencies"
	},
	{
		name: "typescript",
		version: starterDependencyVersions.typescript,
		section: "devDependencies"
	},
	{
		name: "@types/bun",
		version: starterDependencyVersions["@types/bun"],
		section: "devDependencies"
	},
	{
		name: "@types/react",
		version: starterDependencyVersions["@types/react"],
		section: "devDependencies"
	},
	{
		name: "@types/react-dom",
		version: starterDependencyVersions["@types/react-dom"],
		section: "devDependencies"
	}
];
var ensureManagedDependency = (packageJson, { name, version, section }) => {
	const dependencies = packageJson.dependencies ?? {};
	const devDependencies = packageJson.devDependencies ?? {};
	const targetSection = section === "dependencies" ? dependencies : devDependencies;
	const otherSection = section === "dependencies" ? devDependencies : dependencies;
	const currentVersion = targetSection[name] ?? otherSection[name];
	if (currentVersion === version && targetSection[name] === version && !(name in otherSection)) return null;
	delete otherSection[name];
	targetSection[name] = version;
	packageJson.dependencies = dependencies;
	packageJson.devDependencies = devDependencies;
	return currentVersion ? {
		name,
		from: currentVersion,
		to: version
	} : {
		name,
		from: "(missing)",
		to: version
	};
};
var updateDependencySections = (packageJson) => {
	const changed = [];
	for (const dependency of managedDependencies) {
		const change = ensureManagedDependency(packageJson, dependency);
		if (change) changed.push(change);
	}
	return changed;
};
var desiredScripts = {
	dev: "electrobun-vite",
	build: "electrobun-vite build",
	preview: "electrobun-vite preview",
	update: "electrobun-vite update"
};
var updateProject = async ({ cwd = process.cwd() } = {}) => {
	const logger = createToolLogger("info");
	const packageJsonPath = resolve(cwd, "package.json");
	if (!existsSync(packageJsonPath)) throw new Error("Could not find package.json in the current directory.");
	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
	const dependencyChanges = updateDependencySections(packageJson);
	const scripts = packageJson.scripts ?? {};
	const scriptChanges = [];
	for (const [name, command] of Object.entries(desiredScripts)) if (scripts[name] !== command) {
		scriptChanges.push({
			name: `scripts.${name}`,
			from: scripts[name] ?? "(missing)",
			to: command
		});
		scripts[name] = command;
	}
	packageJson.scripts = scripts;
	const gitignorePath = resolve(cwd, ".gitignore");
	const gitignoreEntries = ["electrobun.config.ts", "icon.iconset"];
	const gitignoreChanges = [];
	if (existsSync(gitignorePath)) {
		const gitignoreLines = (await readFile(gitignorePath, "utf8")).split(/\r?\n/);
		const missingEntries = gitignoreEntries.filter((entry) => !gitignoreLines.includes(entry));
		if (missingEntries.length > 0) {
			await writeFile(gitignorePath, [
				...gitignoreLines.filter((line) => line.length > 0),
				...missingEntries,
				""
			].join("\n"));
			for (const entry of missingEntries) gitignoreChanges.push({
				name: `.gitignore`,
				from: "(missing entry)",
				to: entry
			});
		}
	}
	const allChanges = [
		...dependencyChanges,
		...scriptChanges,
		...gitignoreChanges
	];
	if (allChanges.length === 0) {
		logger.info("No template project updates were needed.");
		return {
			changed: false,
			changes: []
		};
	}
	await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
	for (const helperFile of [
		"scripts/dev.ts",
		"scripts/build.ts",
		"scripts/preview.ts",
		"scripts/electrobun-vite.ts"
	]) {
		const helperPath = resolve(cwd, helperFile);
		if (existsSync(helperPath)) await rm(helperPath, { force: true });
	}
	logger.output(colors.cyan("updated template project files:"));
	for (const change of allChanges) logger.output(colors.dim(`  ${change.name}: ${change.from} -> ${change.to}`));
	if (dependencyChanges.length > 0) {
		logger.output(colors.cyan("running bun install to refresh the lockfile..."));
		const exitCode = await Bun.spawn(["bun", "install"], {
			cwd,
			stdin: "inherit",
			stdout: "inherit",
			stderr: "inherit"
		}).exited;
		if (exitCode !== 0) throw new Error(`bun install failed with exit code ${exitCode}`);
	}
	return {
		changed: true,
		changes: allChanges
	};
};
//#endregion
//#region src/cli.ts
var createInlineConfig = (root, options) => ({
	root,
	mode: options.mode,
	configFile: typeof options.config === "string" ? options.config : void 0,
	logLevel: options.logLevel,
	clearScreen: options.clearScreen,
	build: {
		outDir: options.outDir,
		watch: options.watch
	},
	entry: options.entry
});
var handleError = (logLevel, label, error) => {
	const logger = createToolLogger(logLevel);
	const message = error instanceof Error ? error.message : String(error);
	logger.fatal(colors.red(colors.bold(label)));
	logger.fatal(colors.dim(message));
	process.exit(1);
};
var runCLI = async (argv = process.argv) => {
	const cli = cac("electrobun-vite");
	cli.option("-c, --config <file>", "[string] use a specific electrobun.vite.config.ts file").option("-l, --logLevel <level>", "[string] control log verbosity: info | warn | error | silent").option("--clearScreen", "[boolean] clear previous logs between updates when supported").option("-m, --mode <mode>", "[string] set mode for env loading and config resolution").option("-w, --watch", "[boolean] watch files and rebuild or restart when supported").option("--outDir <dir>", "[string] override the generated asset directory (default: dist)").option("--sourcemap", "[boolean] emit source maps when the active command supports them").option("--entry <file>", "[string] reserved for future bun entry overrides");
	cli.command("[root]", "start the Vite dev server and Electrobun app from [root]").alias("serve").alias("dev").option("--rendererOnly", "[boolean] start only the renderer dev server").action(async (root, options) => {
		try {
			await createServer$1(createInlineConfig(root, options), {
				watch: options.watch,
				rendererOnly: options.rendererOnly
			});
		} catch (error) {
			handleError(options.logLevel, "error during start dev server and electrobun app:", error);
		}
	});
	cli.command("build [root]", "build renderer and desktop output for production").action(async (root, options) => {
		try {
			await build$1(createInlineConfig(root, options));
		} catch (error) {
			handleError(options.logLevel, "error during build:", error);
		}
	});
	cli.command("preview [root]", "start the desktop app against the production build").option("--skipBuild", "[boolean] preview the existing build without rebuilding first").action(async (root, options) => {
		try {
			await preview(createInlineConfig(root, options), { skipBuild: options.skipBuild });
		} catch (error) {
			handleError(options.logLevel, "error during preview electrobun app:", error);
		}
	});
	cli.command("info [root]", "print resolved config, versions, and template metadata").action(async (root, options) => {
		const logger = createToolLogger(options.logLevel);
		const out = {
			configFile: (await loadUserConfig(createInlineConfig(root, options), "serve", "development")).configFile,
			defaultTemplate: getDefaultTemplateName(),
			versions: starterVersions,
			modules: workspaceModules,
			templates: templatePackages
		};
		logger.output(colors.cyan("resolved config:"));
		logger.output(JSON.stringify(out, null, 2));
	});
	cli.command("update [root]", "update template-managed dependencies in an existing project to the latest starter versions").action(async (root, options) => {
		try {
			await updateProject({ cwd: root });
		} catch (error) {
			handleError(options.logLevel, "error during update:", error);
		}
	});
	cli.command("create [projectName]", "scaffold a new react-ts project into <projectName> or into the current directory with '.'; use --force to skip confirm prompts").option("-t, --template <template>", "[string] choose scaffold template; currently only react-ts is supported").option("-f, --force", "[boolean] skip confirm prompts and allow scaffolding into existing directories").action(async (projectName, options) => {
		const logger = createToolLogger("info");
		try {
			const targetName = projectName ?? ".";
			const result = await scaffoldProject({
				projectName: targetName,
				template: options.template ?? "react-ts",
				force: options.force
			});
			const isCurrentDirectory = targetName === "." || targetName === "";
			const createdLabel = isCurrentDirectory ? "current directory" : targetName;
			logger.output(`${colors.green(colors.bold("✓"))} created ${createdLabel} from template ${result.template.directory}`);
			logger.output(colors.dim(`  ${result.targetDir}`));
			logger.output("");
			logger.output(colors.dim("next steps:"));
			if (!isCurrentDirectory) logger.output(colors.cyan(`  cd ${targetName}`));
			logger.output(colors.cyan("  bun install"));
			logger.output(colors.cyan("  bun run dev"));
		} catch (error) {
			handleError("error", "error during scaffold:", error);
		}
	});
	cli.help();
	cli.version(PACKAGE_VERSION);
	cli.parse(argv, { run: false });
	await cli.runMatchedCommand();
};
//#endregion
export { loadUserConfig as A, pipeSubprocessLogs as C, getDefaultTemplateName as D, ensureElectrobunConfigFile as E, resolveElectrobunConfigFile as M, getRendererOutDir as O, createViteLogger as S, defineConfig as T, LOG_SCOPE_RENDERER as _, resolveTemplate as a, createLogEnvironment as b, createServer$1 as c, LOG_SCOPE_BUILD as d, LOG_SCOPE_BUN_BUILD as f, LOG_SCOPE_MAIN as g, LOG_SCOPE_LAUNCHER as h, listTemplates as i, resolveConfigFile as j, getTemplateDirectory as k, build$1 as l, LOG_SCOPE_ELECTROBUN as m, runCLI as n, scaffoldProject as o, LOG_SCOPE_CONFIG as p, updateProject as r, preview as s, createInlineConfig as t, ELECTROBUN_VITE_LOG_LEVEL_ENV as u, LOG_SCOPE_VITE as v, loadEnv as w, createToolLogger as x, LOG_SCOPE_WATCH as y };
