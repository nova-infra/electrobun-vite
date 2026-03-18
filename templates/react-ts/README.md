# Electrobun + React + Vite Starter

*Desktop shell meets fast front-end iteration — Electrobun + React 19 + Vite 8*

This template is a minimal desktop starter focused on two things:

- letting `Electrobun` stay the thin native shell
- letting `Vite 8` handle the fast front-end feedback loop
- giving the renderer a modern `React 19` default

The project is intentionally small so it is easy to extend with AI-assisted "vibe coding" sessions.

This template is published independently as `@nova-infra/template-react-ts`.

## Why this shape

- Development mode loads the Vite dev server directly in an `Electrobun` window.
- Production mode builds the web app with Vite and copies the output into `views://app/...`.
- A small typed RPC example is included so the React UI can immediately talk to the Bun process.
- A local skill file is bundled in [skills/electrobun-best-practices/SKILL.md](skills/electrobun-best-practices/SKILL.md) and referenced from [AGENTS.md](AGENTS.md).
- The template keeps all top-level runtime configuration inside [electrobun.vite.config.ts](electrobun.vite.config.ts).

## Version constraints

This starter is pinned to:

- `electrobun@1.16.0`
- `react@19.2.4`
- `react-dom@19.2.4`
- `vite@8.0.0`

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
bun run update
bun run typecheck
```

The `package.json` scripts call `electrobun-vite` directly, so no local wrapper script is needed.
`bun run dev` will generate the initial `dist` output once, then keep Electrobun in watch mode with the Vite dev server.
`bun run update` refreshes the template-managed dependency versions and then runs `bun install`.

## Scaffold into the current directory

If you want to generate the starter directly in an empty folder, use either of these equivalent commands:

```bash
bunx -p @nova-infra/electrobun-vite create-electrobun .
bunx -p @nova-infra/electrobun-vite create-electrobun
```

Both forms only work when the current directory is empty, so the starter files can be written safely without overwriting anything.

## Structure

- [src/bun/index.ts](src/bun/index.ts): native app entry
- [src/shared/rpc.ts](src/shared/rpc.ts): shared RPC schema
- [src/ui/index.html](src/ui/index.html): Vite HTML entry
- [src/ui/main.tsx](src/ui/main.tsx): React bootstrap
- [src/ui/App.tsx](src/ui/App.tsx): starter UI
- [electrobun.vite.config.ts](electrobun.vite.config.ts): the only top-level config file
- `package.json` scripts: direct `electrobun-vite` entry points for dev/build/preview/update

## Extending the starter

- Replace the UI in `src/ui`.
- Add new RPC requests/messages in `src/shared/rpc.ts`.
- Keep external content sandboxed and isolated if you introduce embedded web content.
