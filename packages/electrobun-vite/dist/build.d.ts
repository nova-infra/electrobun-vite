import { type InlineConfig, type ResolvedElectrobunViteConfig } from "./config";
import { createToolLogger } from "./logger";
export declare const withPreBundle: (resolved: ResolvedElectrobunViteConfig, logger: ReturnType<typeof createToolLogger>) => Promise<{
    resolved: ResolvedElectrobunViteConfig;
    cleanup: () => Promise<void>;
}>;
export declare function build(inlineConfig?: InlineConfig): Promise<void>;
