# electrobun-vite

把第一次上手需要的命令收敛成最短主路径：单配置、Quick Start、react-ts 模板，基于 **Electrobun 1.16** + **React 19** + **Vite 8**。

**English:** [README.md](README.md)

![Demo 预览](apps/docs/public/app-preview.png)

**官网**：[https://nova-infra.github.io/electrobun-vite/](https://nova-infra.github.io/electrobun-vite/)

---

## GitHub Packages

`@nova-infra/electrobun-vite` 已通过 `repository` 元数据关联到这个 GitHub 仓库，并且 `publishConfig` 现在默认指向 GitHub Packages。发布流程见 [`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml)，只会在 push `packages/electrobun-vite-v*` tag 时触发。

### 从 GitHub Packages 安装

先执行这条命令，把这台机器上的 `@nova-infra` 作用域切到 GitHub Packages：

```bash
npm config set @nova-infra:registry https://npm.pkg.github.com
```

然后再在项目级 `.npmrc` 里加入认证信息：

```ini
@nova-infra:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

把 `NPM_TOKEN` 设置成一个 GitHub classic personal access token，至少需要 `read:packages` 才能安装。到了 CI 里，也可以直接从 secret 注入这个环境变量，不需要把 token 写死在 `.npmrc` 里。

如果想最快本地试通，可以先在当前 shell 里导出：

```bash
export NPM_TOKEN=ghp_your_token_here
```

然后按常规方式安装即可：

```bash
npm install @nova-infra/electrobun-vite
# 或
bun add @nova-infra/electrobun-vite
```

如果包在你的环境里是公开可用的，token 行有时可以省略，但作用域 registry 映射是关键。把 token 放到环境变量里，也更方便给脚本、CI 或大模型自动补齐配置。

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
