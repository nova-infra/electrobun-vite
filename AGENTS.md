# Agent Notes

This repository is a Bun workspace centered on one main tool package.

Top-level responsibilities:

- `packages/electrobun-vite`: integrated toolchain package for config, CLI, scaffolding, and metadata
- `templates/react-ts`: the default app template
- `apps/docs`: the website and GitHub Pages output

When changing behavior:

- Prefer improving `packages/electrobun-vite` over duplicating logic in templates.
- Keep `templates/react-ts` focused on the generated app experience.
- Keep docs changes in `apps/docs`.
- Preserve the local skill in `templates/react-ts/skills/electrobun-best-practices`.
