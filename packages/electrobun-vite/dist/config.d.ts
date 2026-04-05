import { type LogLevel, type UserConfig as ViteUserConfig } from "vite";
export type Command = "build" | "serve" | "preview";
export type InlineConfig = {
    root?: string;
    configFile?: string | false;
    mode?: string;
    logLevel?: LogLevel;
    clearScreen?: boolean;
    build?: {
        outDir?: string;
        watch?: boolean;
    };
    entry?: string;
};
export type RendererConfig = {
    configFile?: string | false;
    vite?: ViteUserConfig;
    publicDir?: string;
    dev?: {
        host?: string;
        port?: number;
        strictPort?: boolean;
    };
    build?: {
        outDir?: string;
    };
};
export type ElectrobunToolConfig = {
    configFile?: string | false;
    outDir?: string;
    config?: ElectrobunConfigInput;
};
export type ElectrobunViteUserConfig = {
    renderer?: RendererConfig;
    electrobun?: ElectrobunToolConfig;
    site?: {
        title?: string;
        base?: string;
    };
};
export type ConfigEnv = {
    command: Command;
    mode: string;
};
export type ElectrobunSerializableValue = string | number | boolean | null | ElectrobunSerializableValue[] | {
    [key: string]: ElectrobunSerializableValue | undefined;
};
export type ElectrobunConfigContext = {
    cwd: string;
    outDir: string;
    command: Command;
    mode: string;
};
export type ElectrobunConfigInput = {
    [key: string]: ElectrobunSerializableValue | undefined;
} | Promise<{
    [key: string]: ElectrobunSerializableValue | undefined;
}> | ((context: ElectrobunConfigContext) => {
    [key: string]: ElectrobunSerializableValue | undefined;
} | Promise<{
    [key: string]: ElectrobunSerializableValue | undefined;
}>);
export type UserConfigExport = ElectrobunViteUserConfig | Promise<ElectrobunViteUserConfig> | ((env: ConfigEnv) => ElectrobunViteUserConfig | Promise<ElectrobunViteUserConfig>);
export type ResolvedRendererConfig = {
    configFile: string | false;
    vite: ViteUserConfig;
    dev: {
        host: string;
        port: number;
        strictPort: boolean;
    };
    build: {
        outDir: string;
    };
};
export type ResolvedElectrobunToolConfig = {
    configFile: string | false;
    outDir: string;
    config: {
        [key: string]: ElectrobunSerializableValue | undefined;
    } | null;
};
export type ResolvedElectrobunViteConfig = {
    cwd: string;
    command: Command;
    mode: string;
    logLevel: LogLevel;
    clearScreen: boolean;
    configFile: string | null;
    config: Omit<ElectrobunViteUserConfig, "renderer" | "electrobun"> & {
        renderer: ResolvedRendererConfig;
        electrobun: ResolvedElectrobunToolConfig;
    };
};
export declare const defineConfig: (config: UserConfigExport) => UserConfigExport;
export declare const resolveConfigFile: (cwd?: string, configFile?: string | false) => string | null;
export declare const resolveElectrobunConfigFile: (resolved: ResolvedElectrobunViteConfig) => string | null;
export declare const loadUserConfig: (inlineConfig?: InlineConfig, command?: Command, defaultMode?: string) => Promise<ResolvedElectrobunViteConfig>;
export declare const getRendererOutDir: (resolved: ResolvedElectrobunViteConfig) => string;
export declare const getDefaultTemplateName: () => string;
export declare const ensureElectrobunConfigFile: (resolved: ResolvedElectrobunViteConfig) => Promise<{
    path: string;
    cleanup: () => Promise<void>;
}>;
export declare const getTemplateDirectory: (name?: string) => string;
