# Agent Notes

This starter is optimized for fast AI-assisted desktop prototyping.

Before making architecture changes, read:

- [skills/electrobun-best-practices/SKILL.md](skills/electrobun-best-practices/SKILL.md)

## File Map

- [package.json](package.json): package name, runtime dependencies, and the direct `electrobun-vite` scripts.
- [electrobun.vite.config.ts](electrobun.vite.config.ts): the single top-level runtime config file for the starter.
- [src/bun](src/bun): main-process code, native APIs, lifecycle hooks, and RPC handlers.
- [src/ui](src/ui): renderer UI and Vite-first iteration surface.
- [src/shared](src/shared): shared protocol types and RPC contracts used by both sides.
- [README.md](README.md): human-facing starter instructions and structure overview.
- [skills/electrobun-best-practices/SKILL.md](skills/electrobun-best-practices/SKILL.md): agent-facing conventions for this starter.

## Change Map

- If you change RPC payloads or event names, update [src/shared/rpc.ts](src/shared/rpc.ts) and the Bun/UI call sites together.
- If you change app shell behavior, keep [src/bun/index.ts](src/bun/index.ts) and [src/shared/rpc.ts](src/shared/rpc.ts) in sync.
- If you change renderer state or UI interactions, keep edits inside [src/ui](src/ui) unless a shared contract needs to move.
- If you change startup or packaging behavior, check [electrobun.vite.config.ts](electrobun.vite.config.ts) and [package.json](package.json) together.

## Project Conventions

- Keep `Electrobun` focused on app shell, native APIs, lifecycle, and RPC handlers.
- Keep UI iteration inside `src/ui` so Vite remains the fastest feedback loop.
- Put shared protocol types in `src/shared`.
- Prefer typed RPC over ad-hoc global bridges.
- Treat `views://app/index.html` as the production renderer entry.
- Use strict navigation rules and `sandbox: true` for any untrusted web content.
