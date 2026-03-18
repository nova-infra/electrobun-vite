# Demo

*Acceptance app for `@nova-infra/electrobun-vite`*

Multi-tab demo that exercises Electrobun APIs:

- **Runtime** — RPC, app state (Bun version, platform, mode)
- **Window** — minimize, maximize, fullscreen, always on top, set title, get frame
- **Tray & Menu** — system tray (title, menu), application menu (File, Edit, View, Window)
- **Context Menu** — show native context menu from renderer via RPC
- **Events** — last action from application-menu, context-menu, tray, before-quit

Run `bun run dev` / `bun run build` / `bun run preview`.

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
bun run typecheck
```

## Structure

- **src/bun/index.ts** — main process: BrowserWindow, Tray, ContextMenu, ApplicationMenu, Electrobun.events
- **src/shared/rpc.ts** — shared RPC types (requests: getAppState, window*, showContextMenu, traySetTitle, getLastEvent)
- **src/ui/** — Vite + React; tabbed UI in App.tsx
- **electrobun.vite.config.ts** — single config
