# Electrobun Best Practices

This local skill is adapted for this starter so coding agents can move quickly without re-discovering Electrobun conventions.

## Goals

- preserve a very small amount of project configuration
- keep Bun-side code explicit and typed
- make front-end iteration fast through Vite
- avoid unsafe defaults when loading outside content

## Architecture

- Main process code lives in `src/bun`.
- Front-end code lives in `src/ui`.
- Shared protocol types live in `src/shared`.
- Development loads `http://127.0.0.1:5173`.
- Production loads `views://app/index.html`.

## Recommended patterns

- Define RPC schemas once in `src/shared/rpc.ts`.
- Keep native APIs, menus, lifecycle hooks, and file system work in the Bun process.
- Keep renderer logic and UI state in the Vite app.
- Add new desktop capabilities behind typed RPC requests or messages.

## Security defaults

- Use `sandbox: true` for third-party or untrusted content.
- Use separate `partition` values for isolated sessions.
- Add explicit navigation allowlists when embedding remote pages.
- Do not write to packaged resources at runtime. Use user-data paths instead.

## Lifecycle guidance

- Use `before-quit` for async shutdown work.
- Avoid relying on exit hooks for cleanup logic.
- Keep startup logic deterministic and visible from `src/bun/index.ts`.

## Build guidance

- `bun run dev` should remain the main local entry.
- `bun run build` should always produce the Vite assets before Electrobun packaging.
- Avoid adding heavy build indirection unless there is a clear payoff.

## Template intent

This project is meant to be edited aggressively by humans and agents. Favor directness, readable structure, and a small number of files over clever abstractions.
