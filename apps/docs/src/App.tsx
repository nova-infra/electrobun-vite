import { useEffect, useMemo, useState } from "react";
import {
  starterVersions,
  templatePackages,
  workspaceModules,
} from "@nova-infra/electrobun-vite/metadata";

type Locale = "zh" | "en";

type SectionLink = {
  id: string;
  label: string;
  summary: string;
};

type CommandCard = {
  title: string;
  command: string;
  description: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

type GuideBlock = {
  title: string;
  body: string;
  bullets?: string[];
  code?: string;
  tone?: "default" | "accent";
};

type GuideSection = {
  id: string;
  title: string;
  intro: string;
  blocks: GuideBlock[];
};

type DocsCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  sublede: string;
  primaryCta: string;
  secondaryCta: string;
  badges: string[];
  sections: SectionLink[];
  overviewTitle: string;
  overviewIntro: string;
  overviewBlocks: GuideBlock[];
  commandsTitle: string;
  commandsIntro: string;
  commands: CommandCard[];
  configTitle: string;
  configIntro: string;
  configBlocks: GuideBlock[];
  templateTitle: string;
  templateIntro: string;
  templateBlocks: GuideBlock[];
  deployTitle: string;
  deployIntro: string;
  deployBlocks: GuideBlock[];
  migrationTitle: string;
  migrationIntro: string;
  migrationBlocks: GuideBlock[];
  faqTitle: string;
  faqs: FAQItem[];
};

const localeStorageKey = "electrobun-vite-docs-locale";

export function App() {
  const previewImage = `${import.meta.env.BASE_URL}app-preview.png`;
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "zh";
    }

    const saved = window.localStorage.getItem(localeStorageKey);
    return saved === "en" || saved === "zh" ? saved : "zh";
  });

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const copy = useMemo<Record<Locale, DocsCopy>>(
    () => ({
      zh: {
        eyebrow: "Electrobun + Vite 8 桌面工具链",
        title: "默认单配置，尽量少约定，更适合桌面端 vibe coding。",
        lede:
          "electrobun-vite 把 dev、build、preview、脚手架、项目配置和文档收敛成一条稳定主路径，优先解决 Electrobun 真实桌面项目的开发体验。",
        sublede:
          "当前默认模板锁定为 react-ts，并围绕 electrobun@1.16.0、react@19.2.4、vite@8.0.0 构建最少配置体验。",
        primaryCta: "开始使用",
        secondaryCta: "查看配置",
        badges: ["默认中文文档", "单配置模型", "React 19", "Vite 8", "Electrobun 1.16"],
        sections: [
          { id: "overview", label: "总览", summary: "工具定位、当前产品结构、推荐命令。" },
          { id: "cli", label: "CLI", summary: "dev / build / preview / create 的命令面。" },
          { id: "config", label: "配置", summary: "如何围绕一个 electrobun.vite.config.ts 工作。" },
          { id: "template", label: "模板", summary: "react-ts 默认模板和当前边界。" },
          { id: "deploy", label: "部署", summary: "GitHub Pages 与桌面产物验证路径。" },
          { id: "migration", label: "迁移", summary: "从旧的多包结构迁到单包结构。" },
          { id: "faq", label: "FAQ", summary: "关于单配置、模板数量和运行时桥接。" },
        ] satisfies SectionLink[],
        overviewTitle: "文档总览",
        overviewIntro:
          "electrobun-vite 现在不是一个孤立 starter，而是一个围绕单配置项目模型组织起来的桌面开发工具链。demo、模板和官网都围绕同一套约定验证。",
        overviewBlocks: [
          {
            title: "推荐命令",
            body: "从仓库根目录开始，你只需要记住这几个命令就能覆盖大部分日常工作。",
            code: `bun install\nbun run dev\nbun run new -- my-app\nbun run build\nbun run build:docs`,
            tone: "accent",
          },
          {
            title: "当前产品结构",
            body: "当前阶段先把主路径做扎实，因此产品结构刻意保持克制。",
            bullets: [
              "一个主包：@nova-infra/electrobun-vite",
              "一个默认模板：react-ts",
              "一个验收应用：apps/demo",
              "一个官网：apps/docs",
            ],
          },
        ] satisfies GuideBlock[],
        commandsTitle: "CLI 文档",
        commandsIntro:
          "命令面尽量向 electron-vite 靠近，但不机械复制 Electron 语义；重点是让 Electrobun 项目在最少配置下保持一致体验。",
        commands: [
          {
            title: "开发",
            command: "electrobun-vite dev",
            description: "启动 Vite dev server，并拉起 Electrobun 应用。裸命令 `electrobun-vite` 默认等同于它。",
          },
          {
            title: "构建",
            command: "electrobun-vite build",
            description: "先构建 renderer，再调用 Electrobun 打包桌面产物。",
          },
          {
            title: "预览",
            command: "electrobun-vite preview",
            description: "使用生产资源启动桌面应用，用于最终行为核验。",
          },
          {
            title: "脚手架",
            command: "create-electrobun my-app",
            description: "创建新的桌面项目，目前模板列表刻意只开放 react-ts。",
          },
        ] satisfies CommandCard[],
        configTitle: "配置文档",
        configIntro:
          "项目层默认围绕一个 `electrobun.vite.config.ts`。renderer 和 electrobun 都能在这个文件里声明，工具层负责在需要时桥接底层配置。",
        configBlocks: [
          {
            title: "为什么是单配置",
            body: "Electrobun 还处在快速演进期，项目层如果一开始就拆成太多配置文件，团队很快会失去对入口的整体感。单配置的目标是先把关键决策放在一处。",
          },
          {
            title: "推荐示例",
            body: "下面是当前推荐写法。",
            code: `export default defineConfig({\n  template: "react-ts",\n  renderer: {\n    vite: {\n      root: resolve(import.meta.dir, "src/ui"),\n      plugins: [react()],\n    },\n  },\n  electrobun: {\n    outDir: "dist",\n    config: ({ outDir }) => ({\n      app: { name: "My App", identifier: "dev.my.app", version: "0.0.1" },\n      build: {\n        bun: { entrypoint: "src/bun/index.ts" },\n        copy: {\n          [\`${"${outDir}"}/index.html\`]: "views/app/index.html",\n        },\n      },\n    }),\n  },\n})`,
            tone: "accent",
          },
          {
            title: "字段边界",
            body: "当前工具层重点支持下面这些概念。",
            bullets: [
              "renderer.vite：直接内联 Vite 配置",
              "electrobun.outDir：统一 renderer 与桌面打包产物的连接点",
              "electrobun.config：在一个文件里描述 app/build/copy 信息",
              "template：当前主要用于标记项目属于哪个模板族",
            ],
          },
        ] satisfies GuideBlock[],
        templateTitle: "模板文档",
        templateIntro:
          "模板列表现在只保留 react-ts。一方面保持文档和验收面聚焦，另一方面避免在 Electrobun 还很新的阶段过早铺开矩阵。",
        templateBlocks: [
          {
            title: "为什么先只做 react-ts",
            body: "先把主路径做稳定，比一次性堆很多模板更重要。当前文档、demo 和模板共用相同的单配置模型，所以 react-ts 是最好的收敛点。",
          },
          {
            title: "模板里内置了什么",
            body: "默认模板并不是只有 UI，而是带着可以立刻开始桌面开发的一整套骨架。",
            bullets: [
              "React 19 renderer",
              "Electrobun bun entry",
              "Vite 8 构建链路",
              "typed RPC 示例",
              "AGENTS.md 与本地 skill 指南",
            ],
          },
        ] satisfies GuideBlock[],
        deployTitle: "部署与发布",
        deployIntro:
          "官网由 `apps/docs` 构建，并通过 GitHub Actions 自动部署到 GitHub Pages。桌面端产物则继续由 `electrobun-vite build` 和模板自己的脚本验证。",
        deployBlocks: [
          {
            title: "GitHub Pages",
            body: "本仓库已经启用 Pages workflow 模式，推送到 main 会自动构建并发布 docs。",
            bullets: [
              "工作流文件：.github/workflows/deploy-docs.yml",
              "构建命令：bun run build:docs",
              "产物目录：apps/docs/dist",
              "公开地址：https://nova-infra.github.io/electrobun-vite/",
            ],
            tone: "accent",
          },
          {
            title: "桌面端验收",
            body: "日常更推荐先通过 demo 和模板的本地构建来确认工具链没有退化。",
            code: `bun run build:demo\nbun run --cwd apps/demo preview -- --skipBuild\nbun run --cwd templates/react-ts build`,
          },
        ] satisfies GuideBlock[],
        migrationTitle: "迁移说明",
        migrationIntro:
          "如果你之前跟着仓库早期结构工作，这里是最重要的迁移方向。",
        migrationBlocks: [
          {
            title: "从多包到单包",
            body: "原先拆开的 cli/core/create/shared 现在统一归到 `packages/electrobun-vite`，这样能显著降低维护复杂度。",
            bullets: [
              "主能力统一入口：packages/electrobun-vite",
              "docs 只消费 metadata 子导出，不再把运行时代码卷进来",
              "demo 和模板都围绕同一个单配置模型验证",
            ],
          },
          {
            title: "从多配置到单配置",
            body: "项目层优先只保留 `electrobun.vite.config.ts`。如果底层仍要求额外文件，工具层在运行时桥接，而不是让项目结构继续膨胀。",
          },
        ] satisfies GuideBlock[],
        faqTitle: "常见问题",
        faqs: [
          {
            question: "为什么模板现在只支持 react-ts？",
            answer:
              "因为当前阶段最重要的是把 Electrobun + Vite 8 的主路径打磨稳定。模板先收敛，后面再扩。",
          },
          {
            question: "为什么项目层只保留一个 electrobun.vite.config.ts？",
            answer:
              "这是为了减少心智负担，让 renderer 和 desktop shell 的关键配置能放在同一处查看和修改。",
          },
          {
            question: "为什么构建日志里还会看到 electrobun.config.ts？",
            answer:
              "因为 Electrobun CLI 当前仍会查找这个文件，所以 electrobun-vite 会在运行时临时生成，再在命令结束后清掉。",
          },
        ] satisfies FAQItem[],
      },
      en: {
        eyebrow: "Electrobun + Vite 8 desktop tooling",
        title: "Single config by default, fewer moving parts, better for desktop vibe coding.",
        lede:
          "electrobun-vite keeps dev, build, preview, scaffolding, project config, and docs aligned on one stable path for real Electrobun desktop work.",
        sublede:
          "The current default template stays focused on react-ts, pinned to electrobun@1.16.0, react@19.2.4, and vite@8.0.0.",
        primaryCta: "Get Started",
        secondaryCta: "See Config",
        badges: ["Chinese-first docs", "Single-config model", "React 19", "Vite 8", "Electrobun 1.16"],
        sections: [
          { id: "overview", label: "Overview", summary: "Positioning, product shape, and recommended commands." },
          { id: "cli", label: "CLI", summary: "The surface for dev / build / preview / create." },
          { id: "config", label: "Config", summary: "How everything centers on electrobun.vite.config.ts." },
          { id: "template", label: "Template", summary: "What react-ts includes and why it is the only template today." },
          { id: "deploy", label: "Deploy", summary: "GitHub Pages and desktop verification flow." },
          { id: "migration", label: "Migration", summary: "How the repo moved from split packages to one product package." },
          { id: "faq", label: "FAQ", summary: "Answers about single config, template scope, and runtime bridging." },
        ] satisfies SectionLink[],
        overviewTitle: "Docs overview",
        overviewIntro:
          "electrobun-vite is no longer an isolated starter. It is a desktop toolchain organized around a single-config project model, with the demo, template, and docs validating the same workflow.",
        overviewBlocks: [
          {
            title: "Recommended commands",
            body: "These root commands cover most daily work inside the repository.",
            code: `bun install\nbun run dev\nbun run new -- my-app\nbun run build\nbun run build:docs`,
            tone: "accent",
          },
          {
            title: "Current product shape",
            body: "The product intentionally stays compact at this stage.",
            bullets: [
              "One main package: @nova-infra/electrobun-vite",
              "One default template: react-ts",
              "One acceptance app: apps/demo",
              "One docs site: apps/docs",
            ],
          },
        ] satisfies GuideBlock[],
        commandsTitle: "CLI docs",
        commandsIntro:
          "The CLI shape stays close to electron-vite where that helps, while still respecting Electrobun’s own runtime model.",
        commands: [
          {
            title: "Development",
            command: "electrobun-vite dev",
            description: "Start the Vite dev server and launch the Electrobun app together. The bare `electrobun-vite` command resolves here by default.",
          },
          {
            title: "Build",
            command: "electrobun-vite build",
            description: "Build the renderer first, then package desktop output with Electrobun.",
          },
          {
            title: "Preview",
            command: "electrobun-vite preview",
            description: "Run the desktop app against production assets for final verification.",
          },
          {
            title: "Scaffold",
            command: "create-electrobun my-app",
            description: "Create a new desktop project. The template registry is intentionally react-ts only for now.",
          },
        ] satisfies CommandCard[],
        configTitle: "Config docs",
        configIntro:
          "Projects center on one `electrobun.vite.config.ts`. Both renderer and electrobun settings can live there, while the toolchain bridges lower-level config only when necessary.",
        configBlocks: [
          {
            title: "Why single config",
            body: "Electrobun is still evolving quickly. If project structure starts by spreading intent across too many files, teams lose the shape of the app very quickly. Single config keeps the important decisions visible together.",
          },
          {
            title: "Recommended example",
            body: "This is the current recommended shape.",
            code: `export default defineConfig({\n  template: "react-ts",\n  renderer: {\n    vite: {\n      root: resolve(import.meta.dir, "src/ui"),\n      plugins: [react()],\n    },\n  },\n  electrobun: {\n    outDir: "dist",\n    config: ({ outDir }) => ({\n      app: { name: "My App", identifier: "dev.my.app", version: "0.0.1" },\n      build: {\n        bun: { entrypoint: "src/bun/index.ts" },\n        copy: {\n          [\`${"${outDir}"}/index.html\`]: "views/app/index.html",\n        },\n      },\n    }),\n  },\n})`,
            tone: "accent",
          },
          {
            title: "Field boundaries",
            body: "These are the main concepts the toolchain currently expects.",
            bullets: [
              "renderer.vite: inline Vite configuration",
              "electrobun.outDir: the shared handoff point between renderer and desktop packaging",
              "electrobun.config: app/build/copy information in the same file",
              "template: project family marker used by the toolchain",
            ],
          },
        ] satisfies GuideBlock[],
        templateTitle: "Template docs",
        templateIntro:
          "The template registry currently stays focused on react-ts so the docs, acceptance app, and toolchain can all mature around one reliable path first.",
        templateBlocks: [
          {
            title: "Why react-ts first",
            body: "Stabilizing one main path matters more than expanding a template matrix too early. The docs, demo, and template all validate the same single-config model today.",
          },
          {
            title: "What the template includes",
            body: "The default template ships as a real desktop starter, not just a UI shell.",
            bullets: [
              "React 19 renderer",
              "Electrobun bun entry",
              "Vite 8 build pipeline",
              "typed RPC sample",
              "AGENTS.md and local skill guidance",
            ],
          },
        ] satisfies GuideBlock[],
        deployTitle: "Deploy and release",
        deployIntro:
          "The docs site is built from `apps/docs` and automatically published to GitHub Pages. Desktop output continues to be validated through the demo app and the template build flow.",
        deployBlocks: [
          {
            title: "GitHub Pages",
            body: "This repository already uses Pages in workflow mode, so pushing to main rebuilds and republishes the docs site automatically.",
            bullets: [
              "Workflow file: .github/workflows/deploy-docs.yml",
              "Build command: bun run build:docs",
              "Artifact path: apps/docs/dist",
              "Public URL: https://nova-infra.github.io/electrobun-vite/",
            ],
            tone: "accent",
          },
          {
            title: "Desktop verification",
            body: "For day-to-day development, it is still better to keep validating the demo app and the template locally.",
            code: `bun run build:demo\nbun run --cwd apps/demo preview -- --skipBuild\nbun run --cwd templates/react-ts build`,
          },
        ] satisfies GuideBlock[],
        migrationTitle: "Migration notes",
        migrationIntro:
          "If you worked against the early repo shape, these are the key moves to keep in mind.",
        migrationBlocks: [
          {
            title: "From many packages to one product package",
            body: "The old split between cli/core/create/shared is now flattened into `packages/electrobun-vite`, which sharply reduces maintenance overhead.",
            bullets: [
              "Single tool entry: packages/electrobun-vite",
              "Docs only import the metadata subpath now",
              "Demo and template validate the same single-config model",
            ],
          },
          {
            title: "From many config files to one project config",
            body: "Projects should prefer one `electrobun.vite.config.ts`. If lower layers still expect more files, the toolchain should bridge them at runtime instead of pushing that complexity into every app.",
          },
        ] satisfies GuideBlock[],
        faqTitle: "FAQ",
        faqs: [
          {
            question: "Why is the template list react-ts only right now?",
            answer:
              "Because the current priority is stabilizing the main Electrobun + Vite 8 path before expanding the template matrix.",
          },
          {
            question: "Why keep everything in one electrobun.vite.config.ts?",
            answer:
              "Because it lowers project setup overhead and keeps renderer and desktop-shell decisions visible in one place.",
          },
          {
            question: "Why do build logs still mention electrobun.config.ts?",
            answer:
              "Because the Electrobun CLI still looks for that file today, so electrobun-vite generates it temporarily at runtime and removes it afterward.",
          },
        ] satisfies FAQItem[],
      },
    }),
    [],
  );

  const activeCopy = copy[locale];

  const guideSections = [
    {
      id: "overview",
      title: activeCopy.overviewTitle,
      intro: activeCopy.overviewIntro,
      blocks: activeCopy.overviewBlocks,
    },
    {
      id: "config",
      title: activeCopy.configTitle,
      intro: activeCopy.configIntro,
      blocks: activeCopy.configBlocks,
    },
    {
      id: "template",
      title: activeCopy.templateTitle,
      intro: activeCopy.templateIntro,
      blocks: activeCopy.templateBlocks,
    },
    {
      id: "deploy",
      title: activeCopy.deployTitle,
      intro: activeCopy.deployIntro,
      blocks: activeCopy.deployBlocks,
    },
    {
      id: "migration",
      title: activeCopy.migrationTitle,
      intro: activeCopy.migrationIntro,
      blocks: activeCopy.migrationBlocks,
    },
  ] satisfies GuideSection[];

  return (
    <div className="min-h-screen text-stone-900">
      <div className="mx-auto w-[min(1280px,calc(100vw-28px))] px-3 py-4 md:px-6 md:py-6">
        <div className="rounded-[30px] border border-white/50 bg-[rgba(252,248,241,0.74)] p-4 shadow-[0_28px_90px_rgba(56,36,22,0.16)] backdrop-blur-[18px] md:p-6">
          <header className="grid gap-6 rounded-[26px] bg-[linear-gradient(130deg,rgba(255,255,255,0.9),rgba(249,237,220,0.92)),linear-gradient(140deg,rgba(15,118,110,0.12),rgba(255,138,61,0.14))] p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.88fr)] md:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-stone-900/10 bg-white/75 px-4 py-1 text-xs uppercase tracking-[0.18em] text-teal-700">
                  {activeCopy.eyebrow}
                </span>
                <div className="inline-flex rounded-full border border-stone-900/10 bg-white/80 p-1 text-sm shadow-sm">
                  <button
                    className={`rounded-full px-3 py-1.5 transition ${
                      locale === "zh" ? "bg-teal-700 text-white" : "text-stone-600 hover:text-stone-950"
                    }`}
                    onClick={() => setLocale("zh")}
                    type="button"
                  >
                    中文
                  </button>
                  <button
                    className={`rounded-full px-3 py-1.5 transition ${
                      locale === "en" ? "bg-teal-700 text-white" : "text-stone-600 hover:text-stone-950"
                    }`}
                    onClick={() => setLocale("en")}
                    type="button"
                  >
                    English
                  </button>
                </div>
              </div>

              <h1 className="mt-5 text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.9] tracking-[-0.07em] text-stone-950">
                electrobun-vite
              </h1>
              <p className="mt-5 max-w-4xl text-xl leading-9 text-stone-700 md:text-2xl">
                {activeCopy.title}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
                {activeCopy.lede}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
                {activeCopy.sublede}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5 text-sm text-stone-700">
                {activeCopy.badges.map((badge) => (
                  <span
                    className="rounded-full border border-stone-900/10 bg-white/70 px-4 py-2"
                    key={badge}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-teal-700 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_30px_rgba(15,118,110,0.24)] transition hover:bg-teal-800"
                  href="#overview"
                >
                  {activeCopy.primaryCta}
                </a>
                <a
                  className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
                  href="#config"
                >
                  {activeCopy.secondaryCta}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <img
                alt="electrobun-vite app preview"
                className="w-full rounded-[22px] border border-stone-900/10 bg-white object-cover shadow-[0_24px_50px_rgba(26,32,35,0.18)]"
                src={previewImage}
              />
              <nav className="grid grid-cols-2 gap-3 rounded-[20px] border border-stone-900/10 bg-white/72 p-4 text-sm md:grid-cols-3">
                {activeCopy.sections.map((section) => (
                  <a
                    className="rounded-2xl border border-stone-900/8 bg-[rgba(250,248,244,0.92)] px-4 py-3 text-stone-700 transition hover:-translate-y-0.5 hover:border-teal-700/25 hover:text-stone-950"
                    href={`#${section.id}`}
                    key={section.id}
                  >
                    <strong className="block text-sm">{section.label}</strong>
                    <span className="mt-1 block text-xs leading-6 text-stone-500">{section.summary}</span>
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-5">
                <h2 className="m-0 text-lg text-stone-950">Documentation</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {activeCopy.sections.map((section) => (
                    <a
                      className="block rounded-[18px] border border-stone-900/10 bg-white/78 px-4 py-3 text-stone-700 transition hover:border-teal-700/25 hover:text-stone-950"
                      href={`#${section.id}`}
                      key={section.id}
                    >
                      <strong className="block">{section.label}</strong>
                      <span className="mt-1 block leading-6 text-stone-500">{section.summary}</span>
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              {guideSections.map((section) => (
                <section
                  className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6"
                  id={section.id}
                  key={section.id}
                >
                  <h2 className="m-0 text-2xl md:text-3xl">{section.title}</h2>
                  <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{section.intro}</p>
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {section.blocks.map((block) => (
                      <article
                        className={`rounded-[20px] border p-5 ${
                          block.tone === "accent"
                            ? "border-teal-700/12 bg-[linear-gradient(135deg,rgba(221,245,239,0.92),rgba(255,251,245,0.94))]"
                            : "border-stone-900/10 bg-white/80"
                        }`}
                        key={block.title}
                      >
                        <h3 className="m-0 text-lg text-stone-950">{block.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-stone-600">{block.body}</p>
                        {block.bullets ? (
                          <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-stone-700">
                            {block.bullets.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                        {block.code ? (
                          <pre className="mt-4 overflow-x-auto rounded-[18px] bg-stone-950 p-4 text-sm leading-7 text-stone-100"><code>{block.code}</code></pre>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ))}

              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="cli">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.commandsTitle}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{activeCopy.commandsIntro}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {activeCopy.commands.map((item) => (
                    <article className="rounded-[20px] border border-stone-900/10 bg-white/80 p-5" key={item.command}>
                      <p className="m-0 text-xs uppercase tracking-[0.14em] text-stone-500">{item.title}</p>
                      <code className="mt-3 block text-sm text-stone-950">{item.command}</code>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="faq">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.faqTitle}</h2>
                <div className="mt-6 space-y-4">
                  {activeCopy.faqs.map((item) => (
                    <article className="rounded-[20px] border border-stone-900/10 bg-white/80 p-5" key={item.question}>
                      <strong className="block text-base text-stone-950">{item.question}</strong>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
