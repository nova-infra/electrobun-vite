import { type InlineConfig } from "./config";
export declare function createServer(inlineConfig?: InlineConfig, options?: {
    watch?: boolean;
    rendererOnly?: boolean;
}): Promise<void>;
