# Agent Notes

This repository is a Bun workspace, not a single app.

Top-level responsibilities:

- `packages/core`: toolchain logic and config helpers
- `packages/cli`: command routing
- `packages/create`: scaffolding helpers
- `packages/shared`: reusable metadata
- `templates/react-ts`: the default app template
- `apps/docs`: the website and GitHub Pages output

When changing behavior:

- Prefer improving `packages/core` over duplicating logic in templates.
- Keep `templates/react-ts` focused on the generated app experience.
- Keep docs changes in `apps/docs`.
- Preserve the local skill in `templates/react-ts/skills/electrobun-best-practices`.
