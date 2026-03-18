# electrobun-vite

Shortest path to first run: single config, Quick Start, and a react-ts template on **Electrobun 1.16** + **React 19** + **Vite 8**.

**中文文档 (Chinese):** [README.zh-CN.md](README.zh-CN.md)

![Demo preview](apps/docs/public/app-preview.png)

**Site:** [https://nova-infra.github.io/electrobun-vite/](https://nova-infra.github.io/electrobun-vite/)

---

## GitHub Packages

The `@nova-infra/electrobun-vite` package is linked to this GitHub repository through its `repository` metadata. Its `publishConfig` now targets GitHub Packages, and the publish workflow in [`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml) is tag-only: push a `packages/electrobun-vite-v*` tag to publish.

### Install from GitHub Packages

Run this first to point the `@nova-infra` scope at GitHub Packages on this machine:

```bash
npm config set @nova-infra:registry https://npm.pkg.github.com
```

Then add this to your project-level `.npmrc` for auth:

```ini
@nova-infra:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Set `NPM_TOKEN` to a GitHub classic personal access token with `read:packages` for installs. In CI, you can inject the same value from a secret instead of hardcoding it into `.npmrc`.

For a quick local setup, you can export it in the same shell before installing:

```bash
export NPM_TOKEN=ghp_your_token_here
```

Then install the package as usual:

```bash
npm install @nova-infra/electrobun-vite
# or
bun add @nova-infra/electrobun-vite
```

If the package is public in your environment, the token line may still be useful for GitHub rate limits or private repo access, but the scoped registry entry is the important part. Using an environment variable keeps the setup easy to copy, script, and automate.

---

## Quick Start

1. **Scaffold a project**

   **One-liner (no clone):**
   ```bash
   npx -p @nova-infra/electrobun-vite create-electrobun my-app
   cd my-app
   ```
   Or with Bun: `bunx -p @nova-infra/electrobun-vite create-electrobun my-app`

   **Into the current directory with confirm:**
   ```bash
   bunx -p @nova-infra/electrobun-vite create-electrobun .
   bunx -p @nova-infra/electrobun-vite create-electrobun
   bunx -p @nova-infra/electrobun-vite create-electrobun --force
   ```
   The first two forms target the current directory; if it is not empty, you will be asked to confirm before scaffolding continues. Add `--force` to skip the prompt and scaffold immediately.

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
- **`create-electrobun <projectName>`** — Create a new project (current template: react-ts). Omit `<projectName>` or pass `.` to scaffold into the current directory; if it is not empty, you will be asked to confirm unless you pass `--force`.

Common flags: `-c, --config`, `-l, --logLevel`, `--clearScreen`, `-m, --mode`, `-w, --watch`, `--outDir`.

## Repo structure

| Path | Description |
|------|-------------|
| [packages/electrobun-vite](packages/electrobun-vite) | CLI, config loading, scaffolding, icons, logging |
| [apps/demo](apps/demo) | Demo app with multi-tab Electrobun features |
| [templates/react-ts](templates/react-ts) | Default starter template |
| [apps/docs](apps/docs) | Docs site source, deployed to GitHub Pages |

One **`electrobun.vite.config.ts`** per project: renderer and Electrobun config in a single file.
