# electrobun-vite

Shortest path to first run: single config, Quick Start, and a react-ts template on **Electrobun 1.16** + **React 19** + **Vite 8**.

**中文文档 (Chinese):** [README.zh-CN.md](README.zh-CN.md)

![Demo preview](apps/docs/public/app-preview.png)

**Site:** [https://nova-infra.github.io/electrobun-vite/](https://nova-infra.github.io/electrobun-vite/)

---

## Quick Start

1. **Scaffold a project**

   **One-liner (no clone):**
   ```bash
   npx -p @nova-infra/electrobun-vite create-electrobun my-app
   cd my-app
   ```
   Or with Bun: `bunx -p @nova-infra/electrobun-vite create-electrobun my-app`

   **From this repo** (monorepo root):
   ```bash
   bun install
   bun run new -- my-app
   cd my-app
   ```

2. **Local development**
   ```bash
   bun install
   bun run dev
   ```
   Vite renderer and Electrobun desktop shell start together.

3. **Build and preview**
   ```bash
   bun run build
   bun run preview
   ```
   `preview` runs a build first by default; use `--skipBuild` when you already have output.

---

## Workspace commands

| Command | Description |
|---------|-------------|
| `bun run dev` / `bun run dev:demo` | Start dev from demo app root |
| `bun run dev:template` | Start dev from template project |
| `bun run dev:docs` | Start docs site |
| `bun run new -- <name>` | Scaffold a new project (create-electrobun) |
| `bun run build` | Build demo + template |
| `bun run build:docs` | Build docs site |
| `bun run typecheck` | Type check |

---

## CLI overview

- **`electrobun-vite [root]`** (or `dev` / `serve`) — Start dev: Vite + Electrobun; `--rendererOnly` runs only the renderer.
- **`electrobun-vite build [root]`** — Build renderer and hand off to Electrobun packaging.
- **`electrobun-vite preview [root]`** — Run desktop app with production assets; `--skipBuild` skips build.
- **`electrobun-vite info [root]`** — Print resolved config and version info.
- **`create-electrobun <projectName>`** — Create a new project (current template: react-ts).

Common flags: `-c, --config`, `-l, --logLevel`, `--clearScreen`, `-m, --mode`, `-w, --watch`, `--outDir`.

---

## Repo structure

| Path | Description |
|------|-------------|
| [packages/electrobun-vite](packages/electrobun-vite) | CLI, config loading, scaffolding, icons, logging |
| [apps/demo](apps/demo) | Demo app with multi-tab Electrobun features |
| [templates/react-ts](templates/react-ts) | Default starter template |
| [apps/docs](apps/docs) | Docs site source, deployed to GitHub Pages |

One **`electrobun.vite.config.ts`** per project: renderer and Electrobun config in a single file.

---

## App icon (macOS)

When you run `dev` or `build`, electrobun-vite generates **`icon.iconset`** at the app root (from `AppIcon.appiconset/icon-1024.png` or the package default). Config generation injects `build.mac.icons: "icon.iconset"`.

---

## Docs deployment

Docs are built from [apps/docs](apps/docs) and deployed via [.github/workflows/deploy-docs.yml](.github/workflows/deploy-docs.yml). Enable **GitHub Pages → Source: GitHub Actions** in repo settings. Base path is set by `DOCS_BASE_PATH` (currently `/electrobun-vite/`).
