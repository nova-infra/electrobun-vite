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

  const copy = useMemo(
    () => ({
      zh: {
        eyebrow: "Electrobun + Vite 8 桌面工具链",
        title: "默认单配置，尽量少约定，更适合桌面端 vibe coding。",
        lede:
          "electrobun-vite 把 dev、build、preview、脚手架和项目配置收敛到一个主包里，同时让 demo、模板和官网围绕同一套约定演进。",
        sublede:
          "当前默认模板锁定为 react-ts，并围绕 electrobun@1.16.0、react@19.2.4、vite@8.0.0 做最少配置体验。",
        primaryCta: "查看单配置",
        secondaryCta: "查看 CLI",
        sections: [
          { id: "overview", label: "总览" },
          { id: "cli", label: "CLI" },
          { id: "config", label: "配置" },
          { id: "template", label: "模板" },
          { id: "deploy", label: "部署" },
          { id: "faq", label: "FAQ" },
        ] satisfies SectionLink[],
        badges: ["默认中文文档", "React 19", "Vite 8", "Electrobun 1.16"],
        overviewTitle: "为什么是 electrobun-vite",
        overviewBody:
          "目标不是再做一个庞杂脚手架，而是提供一条足够稳定的桌面项目默认路径：一个主包、一个默认模板、一个官网、一个 demo 验收面。",
        modulesTitle: "集成主包",
        modulesBody:
          "这些能力不再分散在多个 package，而是由一个 `@nova-infra/electrobun-vite` 主包统一负责。",
        commandsTitle: "CLI 约定",
        commandsBody:
          "命令面尽量向 electron-vite 对齐，同时保留 Electrobun 自己的运行方式。",
        commands: [
          {
            title: "开发",
            command: "electrobun-vite dev",
            description: "启动 Vite dev server，并拉起 Electrobun 应用。",
          },
          {
            title: "构建",
            command: "electrobun-vite build",
            description: "先构建 renderer，再调用 Electrobun 打包桌面产物。",
          },
          {
            title: "预览",
            command: "electrobun-vite preview",
            description: "使用生产资源启动桌面应用，用于验证最终行为。",
          },
          {
            title: "脚手架",
            command: "create-electrobun my-app",
            description: "生成新的桌面项目，目前模板列表仅开放 react-ts。",
          },
        ] satisfies CommandCard[],
        configTitle: "单配置项目模型",
        configBody:
          "项目层默认围绕一个 `electrobun.vite.config.ts`。renderer 和 electrobun 都能在这个文件里声明，工具层会在需要时桥接底层配置。",
        configLabel: "推荐示例",
        configExample: `export default defineConfig({
  template: "react-ts",
  renderer: {
    vite: {
      root: resolve(import.meta.dir, "src/ui"),
      plugins: [react()],
    },
  },
  electrobun: {
    outDir: "dist",
    config: ({ outDir }) => ({
      app: { name: "My App", identifier: "dev.my.app", version: "0.0.1" },
      build: {
        bun: { entrypoint: "src/bun/index.ts" },
        copy: {
          [\`${"${outDir}"}/index.html\`]: "views/app/index.html",
        },
      },
    }),
  },
})`,
        templateTitle: "默认模板",
        templateBody:
          "模板列表现在只保留 react-ts，一方面保持文档和验收面聚焦，另一方面避免在 Electrobun 还很新的阶段过早铺开矩阵。",
        versionsTitle: "锁定基础版本",
        deployTitle: "GitHub Pages 部署",
        deployBody:
          "官网由 `apps/docs` 构建，推荐通过 GitHub Actions 发布到 GitHub Pages。生产环境 base path 会跟仓库路径对齐。",
        deploySteps: [
          "推送到 main 分支后触发 docs workflow。",
          "workflow 会执行 bun install、bun run build:docs，并上传 apps/docs/dist。",
          "在仓库设置里将 GitHub Pages 的 Source 切到 GitHub Actions。",
          "默认发布地址为 https://nova-infra.github.io/electrobun-vite/ 。",
        ],
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
        eyebrow: "Desktop tooling for Electrobun + Vite 8",
        title: "Single config by default, fewer moving parts, better for desktop vibe coding.",
        lede:
          "electrobun-vite keeps dev, build, preview, scaffolding, and project config inside one integrated package while the demo, template, and docs all validate the same workflow.",
        sublede:
          "The current default template is react-ts, pinned to electrobun@1.16.0, react@19.2.4, and vite@8.0.0.",
        primaryCta: "See Config",
        secondaryCta: "See CLI",
        sections: [
          { id: "overview", label: "Overview" },
          { id: "cli", label: "CLI" },
          { id: "config", label: "Config" },
          { id: "template", label: "Template" },
          { id: "deploy", label: "Deploy" },
          { id: "faq", label: "FAQ" },
        ] satisfies SectionLink[],
        badges: ["Chinese-first docs", "React 19", "Vite 8", "Electrobun 1.16"],
        overviewTitle: "Why electrobun-vite",
        overviewBody:
          "The goal is not another sprawling scaffold. The goal is a stable desktop default path: one package, one template, one docs site, and one demo acceptance app.",
        modulesTitle: "Integrated package",
        modulesBody:
          "These capabilities are no longer spread across multiple packages. One `@nova-infra/electrobun-vite` package owns the tool surface.",
        commandsTitle: "CLI surface",
        commandsBody:
          "The command shape stays close to electron-vite where it helps, while still respecting Electrobun’s runtime model.",
        commands: [
          {
            title: "Development",
            command: "electrobun-vite dev",
            description: "Start the Vite dev server and launch the Electrobun app together.",
          },
          {
            title: "Build",
            command: "electrobun-vite build",
            description: "Build the renderer first, then package the desktop app with Electrobun.",
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
        configTitle: "Single-config project model",
        configBody:
          "Projects center on one `electrobun.vite.config.ts`. Both renderer and electrobun settings can live there, while the toolchain bridges lower-level config when needed.",
        configLabel: "Recommended example",
        configExample: `export default defineConfig({
  template: "react-ts",
  renderer: {
    vite: {
      root: resolve(import.meta.dir, "src/ui"),
      plugins: [react()],
    },
  },
  electrobun: {
    outDir: "dist",
    config: ({ outDir }) => ({
      app: { name: "My App", identifier: "dev.my.app", version: "0.0.1" },
      build: {
        bun: { entrypoint: "src/bun/index.ts" },
        copy: {
          [\`${"${outDir}"}/index.html\`]: "views/app/index.html",
        },
      },
    }),
  },
})`,
        templateTitle: "Default template",
        templateBody:
          "The template registry currently stays focused on react-ts so the docs, acceptance app, and toolchain can mature around one reliable path first.",
        versionsTitle: "Pinned baseline",
        deployTitle: "GitHub Pages deployment",
        deployBody:
          "The docs site is built from `apps/docs` and published with GitHub Actions. The production base path is aligned with the repository path.",
        deploySteps: [
          "Push to main to trigger the docs workflow.",
          "The workflow runs bun install, bun run build:docs, and uploads apps/docs/dist.",
          "Set GitHub Pages Source to GitHub Actions in repository settings.",
          "The expected public URL is https://nova-infra.github.io/electrobun-vite/ .",
        ],
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

  return (
    <div className="min-h-screen text-stone-900">
      <div className="mx-auto w-[min(1200px,calc(100vw-28px))] px-3 py-4 md:px-6 md:py-6">
        <div className="rounded-[30px] border border-white/50 bg-[rgba(252,248,241,0.74)] p-4 shadow-[0_28px_90px_rgba(56,36,22,0.16)] backdrop-blur-[18px] md:p-6">
          <header className="grid gap-6 rounded-[26px] bg-[linear-gradient(130deg,rgba(255,255,255,0.9),rgba(249,237,220,0.92)),linear-gradient(140deg,rgba(15,118,110,0.12),rgba(255,138,61,0.14))] p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.88fr)] md:p-8">
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
                  href="#config"
                >
                  {activeCopy.primaryCta}
                </a>
                <a
                  className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
                  href="#cli"
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
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="mt-6 grid gap-5">
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]" id="overview">
              <article className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.overviewTitle}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-600">{activeCopy.overviewBody}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {workspaceModules.map((module) => (
                    <article
                      className="rounded-[18px] border border-stone-900/10 bg-white/78 p-4"
                      key={module.name}
                    >
                      <strong className="block text-lg text-stone-950">{module.name}</strong>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {locale === "zh" ? module.descriptionZh : module.description}
                      </p>
                    </article>
                  ))}
                </div>
              </article>

              <aside className="rounded-[24px] border border-stone-900/10 bg-[linear-gradient(135deg,rgba(221,245,239,0.94),rgba(255,250,242,0.96))] p-6">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.versionsTitle}</h2>
                <ul className="mt-5 space-y-3 text-sm leading-8 text-stone-700">
                  <li><code>electrobun</code>: {starterVersions.electrobun}</li>
                  <li><code>react</code>: {starterVersions.react}</li>
                  <li><code>react-dom</code>: {starterVersions.reactDom}</li>
                  <li><code>vite</code>: {starterVersions.vite}</li>
                  <li><code>tailwindcss</code>: {starterVersions.tailwindcss}</li>
                </ul>
                <p className="mt-5 text-sm leading-7 text-stone-600">{activeCopy.modulesBody}</p>
              </aside>
            </section>

            <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="cli">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.commandsTitle}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-8 text-stone-600">{activeCopy.commandsBody}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {activeCopy.commands.map((item) => (
                  <article className="rounded-[18px] border border-stone-900/10 bg-white/78 p-4" key={item.command}>
                    <p className="m-0 text-xs uppercase tracking-[0.14em] text-stone-500">{item.title}</p>
                    <code className="mt-3 block text-sm text-stone-950">{item.command}</code>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" id="config">
              <article className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.configTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-stone-600">{activeCopy.configBody}</p>
                <div className="mt-5 rounded-[20px] border border-stone-900/10 bg-stone-950 p-4 text-sm text-stone-100 shadow-[0_20px_40px_rgba(17,24,39,0.18)]">
                  <p className="m-0 text-xs uppercase tracking-[0.16em] text-teal-300">{activeCopy.configLabel}</p>
                  <pre className="mt-4 overflow-x-auto leading-7 whitespace-pre-wrap"><code>{activeCopy.configExample}</code></pre>
                </div>
              </article>

              <article className="rounded-[24px] border border-stone-900/10 bg-[linear-gradient(140deg,rgba(255,249,239,0.96),rgba(255,241,225,0.92))] p-6" id="template">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.templateTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-stone-600">{activeCopy.templateBody}</p>
                <div className="mt-5 space-y-4">
                  {templatePackages.map((template) => (
                    <article className="rounded-[18px] border border-stone-900/10 bg-white/82 p-4" key={template.name}>
                      <strong className="block text-lg text-stone-950">{template.name}</strong>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {locale === "zh" ? template.descriptionZh : template.description}
                      </p>
                    </article>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="deploy">
              <article className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.deployTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-stone-600">{activeCopy.deployBody}</p>
                <ol className="mt-5 space-y-3 pl-5 text-sm leading-8 text-stone-700">
                  {activeCopy.deploySteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>

              <article className="rounded-[24px] border border-stone-900/10 bg-[linear-gradient(135deg,rgba(224,244,239,0.94),rgba(255,252,245,0.96))] p-6" id="faq">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.faqTitle}</h2>
                <div className="mt-5 space-y-4">
                  {activeCopy.faqs.map((item) => (
                    <article className="rounded-[18px] border border-stone-900/10 bg-white/82 p-4" key={item.question}>
                      <strong className="block text-base text-stone-950">{item.question}</strong>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{item.answer}</p>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
