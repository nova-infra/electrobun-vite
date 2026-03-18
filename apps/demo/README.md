# Nova Infra Demo

*Acceptance app for `@nova-infra/electrobun-vite`*

This app is the acceptance baseline for the workspace. It proves that the integrated `electrobun-vite` package can drive a real desktop app with:

- `electrobun@1.16.0`
- `react@19.2.4`
- `vite@8.0.0`
- a single `electrobun-vite` CLI surface for `dev`, `build`, and `preview`

The project is intentionally small so we can use it as the repo's day-to-day smoke test while the template and docs continue evolving.

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
bun run typecheck
```

## Structure

- [src/bun/index.ts](src/bun/index.ts): native app entry
- [src/shared/rpc.ts](src/shared/rpc.ts): shared RPC schema
- [src/ui/index.html](src/ui/index.html): Vite HTML entry
- [src/ui/main.tsx](src/ui/main.tsx): React bootstrap
- [src/ui/App.tsx](src/ui/App.tsx): starter UI
- [electrobun.vite.config.ts](electrobun.vite.config.ts): the only top-level project config, covering both renderer and Electrobun settings

## Notes

- The template registry is intentionally locked to `react-ts` for now.
- This app uses the workspace package source directly during development so CLI changes are reflected immediately.
- `electrobun-vite` generates a temporary `electrobun.config.ts` at runtime when a project only declares `electrobun.vite.config.ts`.
