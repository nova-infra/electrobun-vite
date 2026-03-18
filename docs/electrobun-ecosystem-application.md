# 关联项目申请 · Electrobun 官方仓库

以下内容可用于在 [blackboardsh/electrobun](https://github.com/blackboardsh/electrobun) 开 **Issue** 或 **PR**，申请将 electrobun-vite 列入生态/工具链或 “Apps Built with Electrobun” 等位置。

---

## 建议 Issue 标题（Title）

```
Ecosystem: electrobun-vite — Vite + React toolchain and CLI for Electrobun
```

或简短版：

```
Add electrobun-vite to ecosystem / Apps Built with Electrobun
```

---

## Issue / PR 正文（Body，英文）

```markdown
### Project

**electrobun-vite** — Integrated toolchain (CLI, config, scaffolding) for building Electrobun desktop apps with **Vite 8** and **React 19**.

- **Repo:** https://github.com/nova-infra/electrobun-vite  
- **Docs / site:** https://nova-infra.github.io/electrobun-vite/

### What it does

- Single config file (`electrobun.vite.config.ts`) for both Vite renderer and Electrobun app/build.
- CLI: `electrobun-vite dev | build | preview | info`, plus `create-electrobun <name>` to scaffold from a react-ts template.
- Dev server + Electrobun launcher in one flow; macOS icon generation from `icon-1024.png` / default assets.
- Monorepo with demo app, default template, and docs deployed to GitHub Pages.

### Why list it

We’d like **electrobun-vite** to be listed as an ecosystem / “Built with Electrobun” project so people can discover a ready-made Vite + React workflow on top of Electrobun.

Happy to add a line to the official README “Apps Built with Electrobun” (or an “Ecosystem / Tooling” subsection) via PR if you prefer that over a manual add. Thanks for Electrobun.
```

---

## 操作步骤

1. 打开：**https://github.com/blackboardsh/electrobun/issues/new**
2. **Title** 粘贴上面的建议标题（任选一个）。
3. **Body** 粘贴上面的英文正文。
4. 提交 Issue。  
   若维护者希望用 PR 形式，可再开 PR 修改其 README，在 “Apps Built with Electrobun” 中加一行，例如：

   ```markdown
   * electrobun-vite \- integrated Vite + React CLI and template for Electrobun ([repo](https://github.com/nova-infra/electrobun-vite) · [docs](https://nova-infra.github.io/electrobun-vite/))
   ```
