# Agent Notes

This repository is optimized for fast AI-assisted desktop prototyping.

Before making architecture changes, read:

- [skills/electrobun-best-practices/SKILL.md](skills/electrobun-best-practices/SKILL.md)

Project conventions:

- Keep `Electrobun` focused on app shell, native APIs, lifecycle, and RPC handlers.
- Keep UI iteration inside `src/ui` so Vite remains the fastest feedback loop.
- Put shared protocol types in `src/shared`.
- Prefer typed RPC over ad-hoc global bridges.
- Treat `views://app/index.html` as the production renderer entry.
- Use strict navigation rules and `sandbox: true` for any untrusted web content.
