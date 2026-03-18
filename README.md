# electrobun-vite

`electrobun-vite` is a Bun workspace for shipping desktop apps with `electrobun@1.16.0`, `react@19`, and `vite@8` while keeping project setup intentionally small.

## Workspace Layout

- [packages/electrobun-vite](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/packages/electrobun-vite): integrated tool package for `dev`, `serve`, `build`, `preview`, config loading, and scaffolding
- [apps/demo](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/apps/demo): acceptance app driven by a single `electrobun.vite.config.ts`
- [templates/react-ts](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/templates/react-ts): default starter template, also centered on one `electrobun.vite.config.ts`
- [apps/docs](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/apps/docs): official docs site for GitHub Pages

## Commands

```bash
bun install
bun run dev
bun run dev:demo
bun run dev:template
bun run dev:docs
bun run new -- my-app
bun run build
bun run build:docs
bun run typecheck
```

## Product Shape

- single integrated `electrobun-vite` package
- single-config project model via `electrobun.vite.config.ts`
- current template registry intentionally limited to `react-ts`
- docs and demo both serve as acceptance surfaces for the toolchain
- built-in AI workflow guidance through `AGENTS.md` and local skills

## Docs Deploy

The docs site is built from [apps/docs](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/apps/docs) and deployed to GitHub Pages with GitHub Actions.

- Expected URL: [https://nova-infra.github.io/electrobun-vite/](https://nova-infra.github.io/electrobun-vite/)
- Workflow: [.github/workflows/deploy-docs.yml](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/.github/workflows/deploy-docs.yml)
- Production base path comes from `DOCS_BASE_PATH`, currently set to `/electrobun-vite/`

To publish the docs, enable **GitHub Pages -> Build and deployment -> Source: GitHub Actions** in the repository settings.
