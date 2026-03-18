import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

/** Electrobun 官方要求的 icon.iconset 尺寸与文件名（见 Application Icons 文档） */
const ICONSET_ENTRIES: { size: number; name: string }[] = [
  { size: 16, name: "icon_16x16.png" },
  { size: 32, name: "icon_16x16@2x.png" },
  { size: 32, name: "icon_32x32.png" },
  { size: 64, name: "icon_32x32@2x.png" },
  { size: 128, name: "icon_128x128.png" },
  { size: 256, name: "icon_128x128@2x.png" },
  { size: 256, name: "icon_256x256.png" },
  { size: 512, name: "icon_256x256@2x.png" },
  { size: 512, name: "icon_512x512.png" },
  { size: 1024, name: "icon_512x512@2x.png" },
];

const SOURCE_FILENAME = "logo.png";

/** 包内默认图标路径（当项目根没有 logo.png 时使用） */
const defaultIconPath = join(import.meta.dir, "..", SOURCE_FILENAME);

/**
 * 查找项目根的 logo.png，并返回其路径；否则返回包内默认 logo.png。
 */
export function findLogoSource(cwd: string): string {
  const inCwd = join(cwd, SOURCE_FILENAME);
  if (existsSync(inCwd)) return inCwd;
  return defaultIconPath;
}

/**
 * 检查 appRoot/icon.iconset 是否已存在且包含所需文件。
 */
function hasValidIconIconset(appRoot: string): boolean {
  const dir = join(appRoot, "icon.iconset");
  if (!existsSync(dir)) return false;
  for (const { name } of ICONSET_ENTRIES) {
    if (!existsSync(join(dir, name))) return false;
  }
  return true;
}

/**
 * 使用 macOS sips 从一张 PNG 生成 icon.iconset 中所有尺寸。
 * 仅在 darwin 上执行；其他平台跳过。
 */
async function generateIconIconsetFromPng(
  sourcePngPath: string,
  outDir: string,
): Promise<boolean> {
  if (process.platform !== "darwin") return false;
  await mkdir(outDir, { recursive: true });
  for (const { size, name } of ICONSET_ENTRIES) {
    const outPath = join(outDir, name);
    const proc = Bun.spawn(
      ["sips", "-z", String(size), String(size), sourcePngPath, "--out", outPath],
      { stdout: "ignore", stderr: "pipe" },
    );
    const exit = await proc.exited;
    if (exit !== 0) {
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
export async function ensureIconIconset(appRoot: string): Promise<boolean> {
  if (hasValidIconIconset(appRoot)) return true;

  const sourcePng = findLogoSource(appRoot);
  if (!existsSync(sourcePng)) return false;

  const outDir = join(appRoot, "icon.iconset");
  await generateIconIconsetFromPng(sourcePng, outDir);
  return true;
}
