/**
 * 查找项目根的 logo.png，并返回其路径；否则返回包内默认 logo.png。
 */
export declare function findLogoSource(cwd: string): string;
/**
 * 确保 appRoot 下存在符合 Electrobun 约定的 icon.iconset。
 * 优先使用项目根目录的 logo.png，否则使用包内默认图标。
 * 返回是否已确保 icon.iconset 可用（可用于决定是否写入 build.mac.icons）。
 */
export declare function ensureIconIconset(appRoot: string): Promise<boolean>;
