import type { LogLevel, Logger } from "vite";
type LogOptions = {
    scope?: string;
    force?: boolean;
};
type OutputOptions = {
    scope?: string;
};
type LogWriter = Pick<Console, "log" | "warn" | "error"> & Partial<Pick<Console, "clear">>;
type SubprocessWithStreams = {
    stdout: ReadableStream<Uint8Array> | null;
    stderr: ReadableStream<Uint8Array> | null;
};
export declare const LOG_SCOPE_ELECTROBUN = "electrobun";
export declare const LOG_SCOPE_VITE = "vite";
export declare const LOG_SCOPE_LAUNCHER = "electrobun";
export declare const LOG_SCOPE_BUILD = "build";
export declare const LOG_SCOPE_MAIN = "main";
export declare const LOG_SCOPE_RENDERER = "renderer";
export declare const LOG_SCOPE_CONFIG = "config";
export declare const LOG_SCOPE_WATCH = "watch";
export declare const LOG_SCOPE_BUN_BUILD = "bun.build";
type SubprocessLogContext = "electrobun-build" | "electrobun-dev" | "electrobun-preview";
export declare const ELECTROBUN_VITE_LOG_LEVEL_ENV = "ELECTROBUN_VITE_LOG_LEVEL";
export declare const createLogEnvironment: (logLevel: LogLevel | undefined) => {
    ELECTROBUN_VITE_LOG_LEVEL: LogLevel;
};
export declare const createToolLogger: (logLevel: LogLevel | undefined, writer?: LogWriter) => {
    logLevel: LogLevel;
    info: (message: string, options?: LogOptions) => void;
    success: (message: string, options?: LogOptions) => void;
    warn: (message: string, options?: LogOptions) => void;
    error: (message: string, options?: LogOptions) => void;
    output: (message: string, options?: OutputOptions) => void;
    fatal: (message: string, options?: OutputOptions) => void;
};
export type ToolLogger = ReturnType<typeof createToolLogger>;
export declare const createViteLogger: (logLevel: LogLevel | undefined, writer?: LogWriter) => Logger;
export declare const pipeSubprocessLogs: (child: SubprocessWithStreams, logger: ToolLogger, context: SubprocessLogContext) => Promise<void>;
export {};
