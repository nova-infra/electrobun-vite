import type { LogLevel } from "vite";
import { type InlineConfig } from "./config";
type GlobalCLIOptions = {
    config?: string;
    logLevel?: LogLevel;
    clearScreen?: boolean;
    mode?: string;
    watch?: boolean;
    outDir?: string;
    entry?: string;
    sourcemap?: boolean;
};
export declare const createInlineConfig: (root: string | undefined, options: GlobalCLIOptions) => InlineConfig;
export declare const runCLI: (argv?: string[]) => Promise<void>;
export {};
