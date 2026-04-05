# electrobun-vite

把第一次上手需要的命令收敛成最短主路径：单配置、Quick Start、react-ts 模板，基于 **Electrobun 1.16** + **React 19** + **Vite 8**。

**English:** [README.md](README.md)

![Demo 预览](apps/docs/public/app-preview.png)

**官网**：[https://nova-infra.github.io/electrobun-vite/](https://nova-infra.github.io/electrobun-vite/)

---

## npm Registry

`@nova-infra/electrobun-vite` 和 `@nova-infra/template-react-ts` 都通过 [Trusted Publishers](https://docs.npmjs.com/trusted-publishers#supported-cicd-providers) 发布到 [npmjs.com](https://www.npmjs.com/)。发布流程见 [`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml) 和 [`.github/workflows/publish-template-react-ts.yml`](.github/workflows/publish-template-react-ts.yml)，分别在 push `packages/electrobun-vite-v*` 或 `templates/react-ts-v*` tag 时触发。

可用 `bun run release:package:patch` 或 `bun run release:template:patch` 来自动 bump、提交、打 tag 并 push。

### 从 npm 安装

无需配置，直接安装：

```bash
npm install @nova-infra/electrobun-vite
# 或
bun add @nova-infra/electrobun-vite
```

---

## Quick Start

1. **创建项目**

   **一键创建（无需克隆仓库）：**
   ```bash
   npx -p @nova-infra/electrobun-vite create-electrobun my-app
   cd my-app
   ```
   使用 Bun 时：`bunx -p @nova-infra/electrobun-vite create-electrobun my-app`

   **直接生成到当前目录并确认：**
   ```bash
   bunx -p @nova-infra/electrobun-vite create-electrobun .
   bunx -p @nova-infra/electrobun-vite create-electrobun
   bunx -p @nova-infra/electrobun-vite create-electrobun --force
   ```
   前两种写法都会指向当前目录；如果目录不为空，脚手架会先让你确认再继续。加上 `--force` 就会跳过确认，直接执行。

   **从本仓库执行**（monorepo 根目录）：
   ```bash
   bun install
   bun run new -- my-app
   cd my-app
   ```

2. **本地开发**
   ```bash
   bun install
   bun run dev
   ```
   Vite renderer 与 Electrobun 桌面壳会一起启动。

3. **构建与预览**
   ```bash
   bun run build
   bun run preview
   ```
   `preview` 默认会先 build；已有产物时可加 `--skipBuild`。

---

## 本仓库命令（Workspace）

| 命令 | 说明 |
|------|------|
| `bun run dev` / `bun run dev:demo` | 以 demo 为根启动开发 |
| `bun run dev:template` | 以模板项目启动开发 |
| `bun run dev:docs` | 启动文档站点 |
| `bun run new -- <name>` | 脚手架生成新项目（调用 create-electrobun） |
| `bun run update` | 在已有项目里刷新模板管理的依赖版本并迁移旧脚本 |
| `bun run build` | 构建 demo + 模板 |
| `bun run build:docs` | 构建文档站 |
| `bun run typecheck` | 类型检查 |

---

## CLI 概览

- **`electrobun-vite [root]`**（或 `dev` / `serve`）— 启动开发：Vite + Electrobun；`--rendererOnly` 仅启动 renderer。
- **`electrobun-vite build [root]`** — 构建 renderer 并交给 Electrobun 打包。
- **`electrobun-vite preview [root]`** — 用生产资源启动桌面应用；`--skipBuild` 跳过构建。
- **`electrobun-vite info [root]`** — 输出解析后的配置与版本信息。
- **`electrobun-vite update [root]`** — 刷新已有项目里的模板依赖版本、迁移旧脚本，并执行 `bun install`。
- **`create-electrobun <projectName>`** — 创建新项目（当前模板：react-ts，已独立发布为 `@nova-infra/template-react-ts`）。省略 `<projectName>` 或传 `.` 都会在当前目录生成；如果目录不为空，会先确认，除非你加上 `--force`。

常用全局参数：`-c, --config`、`-l, --logLevel`、`--clearScreen`、`-m, --mode`、`-w, --watch`、`--outDir`。

## 仓库结构

| 路径 | 说明 |
|------|------|
| [packages/electrobun-vite](packages/electrobun-vite) | 集成 CLI、配置加载、脚手架、图标与日志 |
| [apps/demo](apps/demo) | 验收应用，多 tab 演示 Electrobun 能力 |
| [templates/react-ts](templates/react-ts) | 默认 starter 模板源码，已独立发布为 `@nova-infra/template-react-ts` |
| [apps/docs](apps/docs) | 官网源码，部署到 GitHub Pages |

项目层围绕 **一个** `electrobun.vite.config.ts`：renderer 与 Electrobun 配置同文件。
