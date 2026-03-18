# electrobun-vite

`electrobun-vite` is now organized as a Bun workspace so the toolchain, templates, and docs can evolve separately.

## Workspace Layout

- [packages/core](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/packages/core): config discovery and shared toolchain logic
- [packages/cli](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/packages/cli): `electrobun-vite` CLI entry
- [packages/create](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/packages/create): starter scaffolding helpers
- [packages/shared](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/packages/shared): shared metadata and types
- [templates/react-ts](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/templates/react-ts): default `electrobun@1.16.0 + react@19 + vite@8` starter
- [apps/docs](/Users/Bigo/Desktop/develop/workflow/electrobun-vite/apps/docs): static docs site for GitHub Pages

## Commands

```bash
bun install
bun run dev
bun run dev:docs
bun run new -- my-app
bun run build
bun run typecheck
```

## Current Direction

This repo is no longer just a single starter app. The goal is to grow it into the `electrobun` equivalent of the `electron-vite` ecosystem:

- a reusable CLI and config layer
- curated starter templates
- built-in AI workflow guidance
- a public docs site deployable to GitHub Pages
