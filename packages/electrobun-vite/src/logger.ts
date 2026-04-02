import colors from "picocolors";
import type { LogLevel, Logger } from "vite";

type ManagedLogLevel = Exclude<LogLevel, "silent">;

type LogOptions = {
  scope?: string;
  force?: boolean;
};

type OutputOptions = {
  scope?: string;
};

type LogWriter = Pick<Console, "log" | "warn" | "error"> &
  Partial<Pick<Console, "clear">>;

type SubprocessWithStreams = {
  stdout: ReadableStream<Uint8Array> | null;
  stderr: ReadableStream<Uint8Array> | null;
};

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
  silent: 3,
};

const normalizeLogLevel = (logLevel: LogLevel | undefined): LogLevel =>
  logLevel ?? "info";

const shouldEmit = (configuredLevel: LogLevel, level: ManagedLogLevel) =>
  configuredLevel !== "silent" &&
  LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[configuredLevel];

export const LOG_SCOPE_ELECTROBUN = "electrobun";
export const LOG_SCOPE_VITE = "vite";
export const LOG_SCOPE_LAUNCHER = "electrobun";
export const LOG_SCOPE_BUILD = "build";
export const LOG_SCOPE_MAIN = "main";
export const LOG_SCOPE_RENDERER = "renderer";
export const LOG_SCOPE_CONFIG = "config";
export const LOG_SCOPE_WATCH = "watch";
export const LOG_SCOPE_BUN_BUILD = "bun.build";

type SubprocessLogContext =
  | "electrobun-build"
  | "electrobun-dev"
  | "electrobun-preview";

type ClassifiedSubprocessLine = {
  scope: string;
  message: string;
  level: ManagedLogLevel;
};

const normalizeScope = (scope: string) => scope.trim().toLowerCase();

const normalizeTaggedScope = (scope: string) => {
  const normalized = normalizeScope(scope);

  if (normalized === LOG_SCOPE_ELECTROBUN) {
    return LOG_SCOPE_LAUNCHER;
  }

  if (normalized.startsWith("launcher")) {
    return LOG_SCOPE_LAUNCHER;
  }

  if (normalized.startsWith("bun.build")) {
    return normalized;
  }

  if (
    normalized === "ui" ||
    normalized === LOG_SCOPE_RENDERER ||
    normalized === "webview"
  ) {
    return LOG_SCOPE_RENDERER;
  }

  if (normalized === "electrobun dev --watch") {
    return LOG_SCOPE_WATCH;
  }

  return normalized;
};

const formatScope = (scope: string) => {
  const normalizedScope = normalizeScope(scope);

  if (
    normalizedScope === LOG_SCOPE_ELECTROBUN ||
    normalizedScope === LOG_SCOPE_LAUNCHER
  ) {
    return colors.bold(colors.yellow(scope));
  }

  if (normalizedScope === LOG_SCOPE_VITE) {
    return colors.bold(colors.cyan(scope));
  }

  if (
    normalizedScope === LOG_SCOPE_BUILD ||
    normalizedScope.startsWith(LOG_SCOPE_BUN_BUILD)
  ) {
    return colors.bold(colors.magenta(scope));
  }

  if (normalizedScope === LOG_SCOPE_MAIN) {
    return colors.bold(colors.green(scope));
  }

  if (normalizedScope === LOG_SCOPE_RENDERER) {
    return colors.bold(colors.magentaBright(scope));
  }

  if (normalizedScope === LOG_SCOPE_CONFIG) {
    return colors.bold(colors.blue(scope));
  }

  if (normalizedScope === LOG_SCOPE_WATCH) {
    return colors.bold(colors.cyan(scope));
  }

  return colors.bold(scope);
};

const formatPrefix = (scope?: string) =>
  scope ? `${formatScope(scope)} ` : "";

const writeLines = (
  writer: (line: string) => void,
  prefix: string,
  message: string,
) => {
  for (const line of message.split(/\r?\n/g)) {
    if (line.length === 0) {
      writer("");
      continue;
    }

    writer(prefix + line);
  }
};

const readStreamLines = async (
  stream: ReadableStream<Uint8Array> | null,
  onLine: (line: string) => void,
) => {
  if (!stream) {
    return;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
        if (line.length > 0) {
          onLine(line);
        }

        buffer = buffer.slice(newlineIndex + 1);
        newlineIndex = buffer.indexOf("\n");
      }
    }

    buffer += decoder.decode();
    const trailingLine = buffer.replace(/\r$/, "");
    if (trailingLine.length > 0) {
      onLine(trailingLine);
    }
  } finally {
    reader.releaseLock();
  }
};

const writeToConsole = (
  writer: LogWriter,
  level: ManagedLogLevel,
  text: string,
) => {
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

export const ELECTROBUN_VITE_LOG_LEVEL_ENV = "ELECTROBUN_VITE_LOG_LEVEL";

export const createLogEnvironment = (logLevel: LogLevel | undefined) => ({
  [ELECTROBUN_VITE_LOG_LEVEL_ENV]: normalizeLogLevel(logLevel),
});

export const createToolLogger = (
  logLevel: LogLevel | undefined,
  writer: LogWriter = console,
) => {
  const configuredLevel = normalizeLogLevel(logLevel);

  const emit = (
    level: ManagedLogLevel,
    message: string,
    options: LogOptions = {},
  ) => {
    if (!options.force && !shouldEmit(configuredLevel, level)) {
      return;
    }

    writeLines(
      (line) => writeToConsole(writer, level, line),
      formatPrefix(options.scope),
      message,
    );
  };

  const output = (message: string, options: OutputOptions = {}) => {
    writeLines(writer.log.bind(writer), formatPrefix(options.scope), message);
  };

  const fatal = (message: string, options: OutputOptions = {}) => {
    writeLines(writer.error.bind(writer), formatPrefix(options.scope), message);
  };

  return {
    logLevel: configuredLevel,
    info: (message: string, options?: LogOptions) =>
      emit("info", message, options),
    success: (message: string, options?: LogOptions) =>
      emit("info", colors.green(message), options),
    warn: (message: string, options?: LogOptions) =>
      emit("warn", message, options),
    error: (message: string, options?: LogOptions) =>
      emit("error", message, options),
    output,
    fatal,
  };
};

export type ToolLogger = ReturnType<typeof createToolLogger>;

export const createViteLogger = (
  logLevel: LogLevel | undefined,
  writer: LogWriter = console,
): Logger => {
  const logger = createToolLogger(logLevel, writer);
  const warnedMessages = new Set<string>();
  const loggedErrors = new WeakSet<object>();

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
      if (warnedMessages.has(message)) {
        return;
      }

      warnedMessages.add(message);
      this.warn(message);
    },
    error(message, options) {
      const error = options?.error;
      if (error && typeof error === "object") {
        loggedErrors.add(error);
      }

      logger.error(message, { scope: LOG_SCOPE_VITE });
    },
    clearScreen() {
      writer.clear?.();
    },
    hasErrorLogged(error) {
      return typeof error === "object" && error !== null
        ? loggedErrors.has(error)
        : false;
    },
  };
};

const parseTaggedSubprocessLine = (
  line: string,
  defaultLevel: ManagedLogLevel,
): ClassifiedSubprocessLine | null => {
  const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (!match) {
    return null;
  }

  const rawScope = match[1]?.trim();
  if (!rawScope) {
    return null;
  }

  const message = match[2] ?? "";
  const normalizedScope = normalizeTaggedScope(rawScope);
  const normalizedMessage = message.trim().toLowerCase();
  const normalizedRawScope = normalizeScope(rawScope);

  let level = defaultLevel;
  if (
    normalizedRawScope.includes("error") ||
    normalizedMessage.startsWith("error:")
  ) {
    level = "error";
  } else if (
    normalizedRawScope.includes("warn") ||
    normalizedMessage.startsWith("warning:")
  ) {
    level = "warn";
  }

  return {
    scope: normalizedScope,
    message,
    level,
  };
};

const classifyUnscopedSubprocessLine = (
  line: string,
  context: SubprocessLogContext,
  defaultLevel: ManagedLogLevel,
): ClassifiedSubprocessLine => {
  const normalizedLine = line.trim().toLowerCase();

  if (
    normalizedLine.startsWith("launcher starting") ||
    normalizedLine.startsWith("current directory:") ||
    normalizedLine.startsWith("spawning:") ||
    normalizedLine.startsWith("dev build detected") ||
    normalizedLine.startsWith("child process spawned") ||
    normalizedLine.startsWith("child process exited")
  ) {
    return {
      scope: LOG_SCOPE_LAUNCHER,
      message: line,
      level: defaultLevel,
    };
  }

  if (
    normalizedLine.includes("using config file") ||
    normalizedLine.includes("config file must export") ||
    normalizedLine.includes("failed to load config file") ||
    normalizedLine === "using default config instead"
  ) {
    return {
      scope: LOG_SCOPE_CONFIG,
      message: line,
      level: defaultLevel,
    };
  }

  if (normalizedLine.includes("watch")) {
    return {
      scope: LOG_SCOPE_WATCH,
      message: line,
      level: defaultLevel,
    };
  }

  if (context === "electrobun-build") {
    const isError =
      normalizedLine.includes("bundle failed") ||
      normalizedLine.includes("failed to build") ||
      normalizedLine.includes("build failed") ||
      normalizedLine.startsWith("error:");
    return {
      scope: LOG_SCOPE_BUILD,
      message: line,
      level: isError ? "error" : defaultLevel,
    };
  }

  return {
    scope: LOG_SCOPE_MAIN,
    message: line,
    level: defaultLevel,
  };
};

const classifySubprocessLine = (
  line: string,
  context: SubprocessLogContext,
  defaultLevel: ManagedLogLevel,
): ClassifiedSubprocessLine =>
  parseTaggedSubprocessLine(line, defaultLevel) ??
  classifyUnscopedSubprocessLine(line, context, defaultLevel);

const writeClassifiedSubprocessLine = (
  logger: ToolLogger,
  classifiedLine: ClassifiedSubprocessLine,
) => {
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

export const pipeSubprocessLogs = async (
  child: SubprocessWithStreams,
  logger: ToolLogger,
  context: SubprocessLogContext,
) => {
  await Promise.all([
    readStreamLines(child.stdout, (line) => {
      writeClassifiedSubprocessLine(
        logger,
        classifySubprocessLine(line, context, "info"),
      );
    }),
    readStreamLines(child.stderr, (line) => {
      writeClassifiedSubprocessLine(
        logger,
        classifySubprocessLine(line, context, "warn"),
      );
    }),
  ]);
};
