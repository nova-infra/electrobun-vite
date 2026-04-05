import { useEffect, useMemo, useState } from "react";
import { starterVersions } from "@nova-infra/electrobun-vite/metadata";

type Locale = "zh" | "en";

type SectionLink = {
  id: string;
  label: string;
  summary: string;
};

type QuickStartStep = {
  title: string;
  description: string;
  code: string;
  note?: string;
};

type CommandCard = {
  title: string;
  command: string;
  description: string;
  details?: string[];
};

type OptionItem = {
  flag: string;
  effect: string;
};

type OptionGroup = {
  title: string;
  intro: string;
  options: OptionItem[];
};

type GuideBlock = {
  title: string;
  body: string;
  bullets?: string[];
  code?: string;
  tone?: "default" | "accent";
};

type FAQItem = {
  question: string;
  answer: string;
};

type DocsCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  sublede: string;
  primaryCta: string;
  secondaryCta: string;
  repoLink: string;
  electrobunRepoLink: string;
  badges: string[];
  sections: SectionLink[];
  quickStartTitle: string;
  quickStartIntro: string;
  quickStartSteps: QuickStartStep[];
  commandsTitle: string;
  commandsIntro: string;
  commands: CommandCard[];
  optionGroups: OptionGroup[];
  configTitle: string;
  configIntro: string;
  configBlocks: GuideBlock[];
  packageTitle: string;
  packageIntro: string;
  packageBlocks: GuideBlock[];
  faqTitle: string;
  faqs: FAQItem[];
};

const localeStorageKey = "electrobun-vite-docs-locale";

const recommendedConfigCode = `export default defineConfig({
  renderer: {
    vite: {
      root: resolve(import.meta.dir, "src/ui"),
      plugins: [react()],
    },
  },
  electrobun: {
    outDir: "dist",
    config: ({ outDir }) => ({
      app: {
        name: "My App",
        identifier: "dev.my.app",
        version: "0.0.1",
      },
      build: {
        bun: { entrypoint: "src/bun/index.ts" },
        copy: {
          [\`${"${outDir}"}/index.html\`]: "views/app/index.html",
        },
      },
    }),
  },
})`;

export function App() {
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
        eyebrow: "Electrobun + Vite",
        title: "把第一次上手收敛成最短路径。",
        lede: "electrobun-vite 现在更像一份直接上手的桌面开发指南：创建项目、启动 dev、构建预览。不需要先消化一整页背景。",
        sublede: `默认模板 react-ts，基于 electrobun@${starterVersions.electrobun}、react@${starterVersions.react}、vite@${starterVersions.vite}。支持 loadEnv 环境变量加载、多格式配置发现及 publicDir 约定。`,
        primaryCta: "立即上手",
        secondaryCta: "CLI 参考",
        repoLink: "项目仓库",
        electrobunRepoLink: "Electrobun",
        badges: ["Quick Start", "单配置", "react-ts 模板", "CLI 参数", "env 加载"],
        sections: [
          { id: "packages", label: "安装", summary: "npm 一键安装，无需配置。" },
          { id: "quickstart", label: "快速上手", summary: "从创建到构建预览的最短路径。" },
          { id: "cli", label: "CLI", summary: "每个命令及其参数说明。" },
          { id: "config", label: "配置", summary: "围绕一个 electrobun.vite.config.ts 工作。" },
          { id: "faq", label: "FAQ", summary: "常见问题与解答。" },
        ],
        configTitle: "配置",
        configIntro: "项目层围绕一个 `electrobun.vite.config.ts` 工作，把 renderer 和 Electrobun 配置放在同一个入口。",
        configBlocks: [
          {
            title: "推荐结构",
            body: "如果是第一次接入，从这个结构开始，不必急着拆成多份配置。",
            code: recommendedConfigCode,
            tone: "accent",
          },
          {
            title: "重点字段",
            body: "先理解下面几个字段，基本就能覆盖大部分上手场景。",
            bullets: [
              "`renderer.vite`：直接内联 Vite 配置。",
              "`electrobun.outDir`：renderer 和桌面打包共用的产物目录。",
              "`electrobun.config`：集中声明 app / build / copy 信息。",
            ],
          },
          {
            title: "多格式配置发现",
            body: "electrobun-vite 按顺序查找以下文件，找到第一个存在的即停止。",
            bullets: [
              "`electrobun.vite.config.ts`（默认，推荐）",
              "`electrobun.vite.config.mts`",
              "`electrobun.vite.config.js`",
              "`electrobun.vite.config.mjs`",
            ],
          },
          {
            title: "环境变量加载（v0.2.0）",
            body: "dev 和 build 命令会自动从项目根目录读取 `.env` 系列文件，并把匹配前缀的变量注入到 Electrobun 子进程环境中。",
            bullets: [
              "加载顺序：`.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`（后者覆盖前者）。",
              "注入前缀：`BUN_VITE_` 和 `VITE_`。",
              "renderer 中通过 `import.meta.env.VITE_XXX` 访问。",
              "Bun 主进程中通过 `process.env.BUN_VITE_XXX` 访问。",
            ],
          },
          {
            title: "publicDir 默认约定（v0.2.0）",
            body: "Vite 的静态资源目录默认指向项目根目录下的 `resources/`，与 Electrobun 的资源约定对齐。",
            bullets: [
              "把图标、字体等静态资源放到 `resources/` 即可。",
              "可以在 `renderer.vite.publicDir` 里覆盖。",
            ],
          },
          {
            title: "build.bun.external",
            body: "如果 Bun 入口引用了带 native binding 或复杂依赖树的包，把这些包加到 `build.bun.external` 即可跳过打包。",
            code: `electrobun: {\n  config: ({ outDir }) => ({\n    build: {\n      bun: {\n        entrypoint: "src/bun/index.ts",\n        external: ["grammy", "zod", "qrcode"],\n      },\n    },\n  }),\n}`,
            bullets: [
              "被 external 的包不会被打进 bundle，需要在运行时加载。",
              "如果只有 `electrobun/bun` 导入，通常不需要 external。",
            ],
          },
        ],
        packageTitle: "安装",
        packageIntro: "包通过 Trusted Publishers 发布到 npmjs.com，无需额外配置。",
        packageBlocks: [
          {
            title: "一行命令安装",
            body: "直接安装即可，不需要配置 registry 或认证信息。",
            bullets: [
              "npm install @nova-infra/electrobun-vite",
              "bun add @nova-infra/electrobun-vite",
            ],
          },
        ],
        quickStartTitle: "快速上手",
        quickStartIntro: "三步搞定：生成项目、本地开发、构建预览。",
        quickStartSteps: [
          {
            title: "1. 创建项目",
            description: "用 npx/bunx 一键生成，无需克隆仓库。",
            code: `# 推荐方式\nnpx -p @nova-infra/electrobun-vite create-electrobun my-app\ncd my-app\n\n# 在当前目录生成\nbunx -p @nova-infra/electrobun-vite create-electrobun .`,
            note: "`--force` 可跳过确认，直接覆盖已有目录。",
          },
          {
            title: "2. 本地开发",
            description: "安装依赖后直接启动，Vite renderer 和 Electrobun 同时拉起。",
            code: `bun install\nbun run dev`,
            note: "`electrobun-vite --rendererOnly` 可只启动 renderer。",
          },
          {
            title: "3. 构建预览",
            description: "验证生产资源和桌面壳子正常后，再决定是否发布。",
            code: `bun run build\nbun run preview`,
            note: "`--skipBuild` 可跳过构建，直接预览已有产物。",
          },
        ],
        commandsTitle: "CLI",
        commandsIntro: "CLI 只保留日常直接相关的命令。",
        commands: [
          {
            title: "开发",
            command: "electrobun-vite [root]",
            description: "默认命令，等同于 `dev`，同时启动 Vite dev server 和 Electrobun 应用。",
            details: [
              "`[root]` 可选，默认当前目录。",
              "`--rendererOnly` 只启动 renderer。",
            ],
          },
          {
            title: "构建",
            command: "electrobun-vite build [root]",
            description: "构建 renderer 产物并交给 Electrobun 打包。",
            details: [
              "`--outDir` 覆盖输出目录。",
              "`--watch` 持续重建。",
            ],
          },
          {
            title: "预览",
            command: "electrobun-vite preview [root]",
            description: "使用生产资源启动桌面应用。",
            details: [
              "默认先执行 build。",
              "`--skipBuild` 跳过构建。",
            ],
          },
          {
            title: "信息",
            command: "electrobun-vite info [root]",
            description: "输出解析后的配置位置、版本、模板元数据。",
          },
          {
            title: "更新",
            command: "electrobun-vite update [root]",
            description: "刷新模板依赖版本并执行 bun install。",
          },
          {
            title: "脚手架",
            command: "create-electrobun <name>",
            description: "创建新的桌面项目目录。",
            details: [
              "`npx -p @nova-infra/electrobun-vite create-electrobun my-app`",
              "`-f, --force` 跳过确认。",
              "`-t, --template` 目前只支持 `react-ts`。",
            ],
          },
        ],
        optionGroups: [
          {
            title: "位置参数",
            intro: "写在命令名后面，不带 `--`。",
            options: [
              { flag: "[root]", effect: "指定项目根目录，默认当前目录。" },
              { flag: "<projectName>", effect: "脚手架输出目录名，`create` 必填。" },
            ],
          },
          {
            title: "全局参数",
            intro: "可用于 `dev / build / preview / info`。",
            options: [
              { flag: "-c, --config <file>", effect: "指定配置文件路径。" },
              { flag: "-l, --logLevel <level>", effect: "日志级别：`info | warn | error | silent`。" },
              { flag: "-m, --mode <mode>", effect: "设置运行模式，参与 env 加载。" },
              { flag: "-w, --watch", effect: "持续监听文件变化并重建。" },
              { flag: "--outDir <dir>", effect: "覆盖输出目录。" },
              { flag: "--sourcemap", effect: "输出 source map。" },
            ],
          },
          {
            title: "命令专属参数",
            intro: "只在对应命令下生效。",
            options: [
              { flag: "--rendererOnly", effect: "`dev` 专用，只启动 Vite renderer。" },
              { flag: "--skipBuild", effect: "`preview` 专用，跳过预构建。" },
              { flag: "-t, --template", effect: "`create` 专用，当前只支持 `react-ts`。" },
            ],
          },
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            question: "页面里不再放部署、迁移等内容？",
            answer: "首页现在优先承担\"第一次上手\"的职责。和 quick start 无关的内容先收掉，避免用户还没跑通命令就被打断。",
          },
          {
            question: "构建日志里为什么有 electrobun.config.ts？",
            answer: "Electrobun CLI 仍会查找这个文件，electrobun-vite 会在运行时临时生成（写入系统临时目录）并在命令结束后自动清理。",
          },
          {
            question: "Bun 主进程读不到 VITE_ 开头的环境变量？",
            answer: "VITE_ 前缀的变量只注入 Vite renderer 进程；Bun 主进程只接收 BUN_VITE_ 前缀的变量。需要两侧都能访问请用 BUN_VITE_ 前缀。",
          },
          {
            question: "构建报 'Bundle failed' 但没有更多信息？",
            answer: "Electrobun 使用 Bun.build() 打包，如果入口引用了带 native binding 的包会失败。在 config 的 build.bun.external 里声明这些包即可。",
          },
        ],
      },
      en: {
        eyebrow: "Electrobun + Vite",
        title: "Reduce first-run to the commands that matter.",
        lede: "electrobun-vite now reads like a practical getting-started guide: create, dev, build, preview. No background docs to scroll through.",
        sublede: `Default template is react-ts, targeting electrobun@${starterVersions.electrobun}, react@${starterVersions.react}, vite@${starterVersions.vite}. Supports loadEnv, multi-format config discovery, and publicDir convention.`,
        primaryCta: "Get Started",
        secondaryCta: "CLI Reference",
        repoLink: "Repository",
        electrobunRepoLink: "Electrobun",
        badges: ["Quick Start", "Single config", "react-ts template", "CLI reference", "env loading"],
        sections: [
          { id: "packages", label: "Install", summary: "One-command npm install, no config." },
          { id: "quickstart", label: "Quick Start", summary: "Shortest path from scaffold to build." },
          { id: "cli", label: "CLI", summary: "Every command and parameter explained." },
          { id: "config", label: "Config", summary: "Work around one config file." },
          { id: "faq", label: "FAQ", summary: "Common questions answered." },
        ],
        quickStartTitle: "Quick Start",
        quickStartIntro: "Three steps: scaffold, dev, build and preview.",
        quickStartSteps: [
          {
            title: "1. Scaffold",
            description: "Use npx/bunx to create a project in one shot.",
            code: `# Recommended\nnpx -p @nova-infra/electrobun-vite create-electrobun my-app\ncd my-app\n\n# Into current directory\nbunx -p @nova-infra/electrobun-vite create-electrobun .`,
            note: "`--force` skips the confirm prompt.",
          },
          {
            title: "2. Develop",
            description: "Install deps and start the combined Vite + Electrobun dev flow.",
            code: `bun install\nbun run dev`,
            note: "`electrobun-vite --rendererOnly` starts only the renderer.",
          },
          {
            title: "3. Build & Preview",
            description: "Verify production assets before release.",
            code: `bun run build\nbun run preview`,
            note: "`--skipBuild` reuses existing build output.",
          },
        ],
        commandsTitle: "CLI",
        commandsIntro: "Small surface area — only what you need daily.",
        commands: [
          {
            title: "Dev",
            command: "electrobun-vite [root]",
            description: "Default command. Starts Vite dev server and Electrobun together.",
            details: [
              "`[root]` defaults to current directory.",
              "`--rendererOnly` starts only the renderer.",
            ],
          },
          {
            title: "Build",
            command: "electrobun-vite build [root]",
            description: "Build renderer output and hand off to Electrobun packaging.",
            details: [
              "`--outDir` overrides output directory.",
              "`--watch` keeps rebuilding.",
            ],
          },
          {
            title: "Preview",
            command: "electrobun-vite preview [root]",
            description: "Run desktop app against production assets.",
            details: [
              "Builds first by default.",
              "`--skipBuild` skips rebuilding.",
            ],
          },
          {
            title: "Info",
            command: "electrobun-vite info [root]",
            description: "Print resolved config path, versions, template metadata.",
          },
          {
            title: "Update",
            command: "electrobun-vite update [root]",
            description: "Refresh template deps and run bun install.",
          },
          {
            title: "Scaffold",
            command: "create-electrobun <name>",
            description: "Create a new desktop project from template.",
            details: [
              "`npx -p @nova-infra/electrobun-vite create-electrobun my-app`",
              "`-f, --force` skips confirm.",
              "`-t, --template` currently only `react-ts`.",
            ],
          },
        ],
        optionGroups: [
          {
            title: "Positional",
            intro: "After command name, no `--`.",
            options: [
              { flag: "[root]", effect: "Project root. Defaults to cwd." },
              { flag: "<projectName>", effect: "Output dir for `create`." },
            ],
          },
          {
            title: "Global",
            intro: "Work across `dev / build / preview / info`.",
            options: [
              { flag: "-c, --config <file>", effect: "Specific config file path." },
              { flag: "-l, --logLevel <level>", effect: "`info | warn | error | silent`." },
              { flag: "-m, --mode <mode>", effect: "Mode for env loading." },
              { flag: "-w, --watch", effect: "Watch and rebuild." },
              { flag: "--outDir <dir>", effect: "Override output directory." },
              { flag: "--sourcemap", effect: "Emit source maps." },
            ],
          },
          {
            title: "Command-specific",
            intro: "Only on specific commands.",
            options: [
              { flag: "--rendererOnly", effect: "On `dev`. Vite renderer only." },
              { flag: "--skipBuild", effect: "On `preview`. Skip build." },
              { flag: "-t, --template", effect: "On `create`. Only `react-ts`." },
            ],
          },
        ],
        configTitle: "Config",
        configIntro: "One `electrobun.vite.config.ts` for renderer and Electrobun settings.",
        configBlocks: [
          {
            title: "Recommended shape",
            body: "Start here for fresh projects.",
            code: recommendedConfigCode,
            tone: "accent",
          },
          {
            title: "Key fields",
            body: "Understand these first.",
            bullets: [
              "`renderer.vite`: inline Vite config.",
              "`electrobun.outDir`: shared output directory.",
              "`electrobun.config`: app / build / copy details.",
            ],
          },
          {
            title: "Multi-format discovery",
            body: "Searches in order, stops at first match.",
            bullets: [
              "`electrobun.vite.config.ts` (default)",
              "`electrobun.vite.config.mts`",
              "`electrobun.vite.config.js`",
              "`electrobun.vite.config.mjs`",
            ],
          },
          {
            title: "Env file loading (v0.2.0)",
            body: "dev and build load `.env` files and inject prefix-matched vars.",
            bullets: [
              "Order: `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`.",
              "Injected prefixes: `BUN_VITE_` and `VITE_`.",
              "Renderer: `import.meta.env.VITE_XXX`.",
              "Bun main: `process.env.BUN_VITE_XXX`.",
            ],
          },
          {
            title: "publicDir default (v0.2.0)",
            body: "Vite static assets default to `resources/`, aligned with Electrobun conventions.",
            bullets: [
              "Drop icons, fonts into `resources/`.",
              "Override with `renderer.vite.publicDir`.",
            ],
          },
          {
            title: "build.bun.external",
            body: "Skip bundling packages with native bindings.",
            code: `electrobun: {\n  config: ({ outDir }) => ({\n    build: {\n      bun: {\n        entrypoint: "src/bun/index.ts",\n        external: ["grammy", "zod", "qrcode"],\n      },\n    },\n  }),\n}`,
            bullets: [
              "External packages load from node_modules at runtime.",
              "Usually not needed if only `electrobun/bun` is imported.",
            ],
          },
        ],
        packageTitle: "Install",
        packageIntro: "Published to npmjs.com via Trusted Publishers. No config needed.",
        packageBlocks: [
          {
            title: "One-command install",
            body: "Install directly. No registry or auth setup.",
            bullets: [
              "npm install @nova-infra/electrobun-vite",
              "bun add @nova-infra/electrobun-vite",
            ],
          },
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            question: "Why remove deploy, migration content?",
            answer: "The landing page now acts as a first-run guide. Anything not helping run commands was cut.",
          },
          {
            question: "Why does build log mention electrobun.config.ts?",
            answer: "Electrobun CLI still looks for it. electrobun-vite generates it in system temp and cleans up after.",
          },
          {
            question: "Why can't Bun see VITE_ env vars?",
            answer: "VITE_ vars go to Vite renderer only. Bun receives BUN_VITE_ vars. Use BUN_VITE_ for both.",
          },
          {
            question: "Why does build show 'Bundle failed'?",
            answer: "Electrobun uses Bun.build(). Native bindings or complex deps fail. Add them to build.bun.external.",
          },
        ],
      },
    }),
    [],
  );

  const activeCopy = copy[locale];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-stone-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        
        :root {
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        
        .font-display {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
        .delay-5 { animation-delay: 0.40s; }
        .delay-6 { animation-delay: 0.48s; }
        
        .card-hover {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(180, 83, 9, 0.12);
        }
        
        .glow-border {
          box-shadow: inset 0 0 0 1px rgba(180, 83, 9, 0.08), 0 4px 24px rgba(180, 83, 9, 0.06);
        }
      `}</style>
      
      <div className="mx-auto w-[min(1280px,calc(100vw-32px))] px-4 py-6 md:px-8">
        <div className="rounded-[28px] border border-amber-200/60 bg-white/80 p-5 shadow-xl shadow-amber-900/5 backdrop-blur-xl md:p-8">
          <header className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100/80 p-6 md:p-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/30 via-amber-100/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-200/20 via-orange-100/15 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 animate-fade-up">
                <span className="rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-800">
                  {activeCopy.eyebrow}
                </span>
                <div className="inline-flex rounded-full border border-amber-200/60 bg-white/90 shadow-sm p-1 text-sm">
                  <button
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      locale === "zh" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-stone-500 hover:text-stone-900"
                    }`}
                    onClick={() => setLocale("zh")}
                    type="button"
                  >
                    中文
                  </button>
                  <button
                    className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                      locale === "en" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-stone-500 hover:text-stone-900"
                    }`}
                    onClick={() => setLocale("en")}
                    type="button"
                  >
                    EN
                  </button>
                </div>
              </div>

              <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5rem)] leading-[0.95] tracking-[-0.02em] text-stone-900 animate-fade-up delay-1">
                electrobun-vite
              </h1>
              
              <p className="mt-6 text-lg leading-[1.6] text-stone-700 max-w-xl animate-fade-up delay-2">
                {activeCopy.title}
              </p>
              
              <p className="mt-4 text-sm leading-7 text-stone-500 max-w-2xl animate-fade-up delay-3">
                {activeCopy.lede}
              </p>
              
              <p className="mt-3 text-xs leading-6 text-stone-400 animate-fade-up delay-3">
                {activeCopy.sublede}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 animate-fade-up delay-4">
                {activeCopy.badges.map((badge) => (
                  <span
                    className="rounded-full border border-amber-200/60 bg-white/80 px-3 py-1.5 text-xs text-stone-600 shadow-sm"
                    key={badge}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up delay-5">
                <a
                  className="group relative rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-500 hover:bg-right hover:shadow-orange-500/50 hover:scale-105"
                  href="#quickstart"
                >
                  {activeCopy.primaryCta}
                </a>
                <a
                  className="rounded-full border border-amber-200/80 bg-white/90 px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-md"
                  href="#cli"
                >
                  {activeCopy.secondaryCta}
                </a>
                <a
                  className="rounded-full border border-amber-200/80 bg-white/90 px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-md"
                  href="https://github.com/nova-infra/electrobun-vite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeCopy.repoLink}
                </a>
                <a
                  className="rounded-full border border-amber-200/80 bg-white/90 px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-md"
                  href="https://github.com/blackboardsh/electrobun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeCopy.electrobunRepoLink}
                </a>
              </div>
            </div>
          </header>

          <main className="mt-6 space-y-6">
            <section className="rounded-[24px] border border-amber-100/80 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 glow-border" id="packages">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <h2 className="font-display text-2xl md:text-3xl text-stone-900">{activeCopy.packageTitle}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-500">{activeCopy.packageIntro}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activeCopy.packageBlocks.map((block, i) => (
                  <article
                    className={`rounded-[20px] border p-5 card-hover animate-scale-in ${
                      block.tone === "accent"
                        ? "border-amber-300/50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-md"
                        : "border-amber-100/60 bg-white/80 shadow-sm"
                    }`}
                    style={{ animationDelay: `${0.1 * i}s` }}
                    key={block.title}
                  >
                    <h3 className="font-display text-lg text-stone-900">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{block.body}</p>
                    {block.bullets ? (
                      <ul className="mt-4 space-y-2 pl-4 text-sm leading-6 text-stone-600">
                        {block.bullets.map((item) => (
                          <li className="text-stone-700" key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-amber-100/80 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 glow-border" id="quickstart">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <h2 className="font-display text-2xl md:text-3xl text-stone-900">{activeCopy.quickStartTitle}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
              <p className="text-sm leading-7 text-stone-500">{activeCopy.quickStartIntro}</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {activeCopy.quickStartSteps.map((step, i) => (
                  <article
                    className="rounded-[20px] border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5 card-hover animate-fade-up shadow-sm"
                    style={{ animationDelay: `${0.12 * i}s` }}
                    key={step.title}
                  >
                    <h3 className="font-display text-lg text-stone-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                    <pre className="mt-4 overflow-x-auto rounded-[12px] bg-stone-900/90 p-3 text-xs leading-6 text-stone-100 border border-stone-700"><code>{step.code}</code></pre>
                    {step.note ? <p className="mt-3 text-xs leading-5 text-stone-500">{step.note}</p> : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-amber-100/80 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 glow-border" id="cli">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <h2 className="font-display text-2xl md:text-3xl text-stone-900">{activeCopy.commandsTitle}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
              <p className="text-sm leading-7 text-stone-500">{activeCopy.commandsIntro}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeCopy.commands.map((item, i) => (
                  <article className="rounded-[20px] border border-amber-100/60 bg-white/80 p-5 card-hover shadow-sm animate-scale-in" style={{ animationDelay: `${0.05 * i}s` }} key={item.command}>
                    <p className="m-0 text-xs uppercase tracking-[0.14em] text-amber-600 font-medium">{item.title}</p>
                    <code className="mt-3 block text-sm text-stone-800 font-mono">{item.command}</code>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                    {item.details ? (
                      <ul className="mt-4 space-y-1.5 pl-4 text-xs leading-5 text-stone-500">
                        {item.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {activeCopy.optionGroups.map((group, i) => (
                  <article className="rounded-[20px] border border-amber-100/60 bg-white/80 p-5 card-hover shadow-sm animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }} key={group.title}>
                    <h3 className="font-display text-lg text-stone-900">{group.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{group.intro}</p>
                    <div className="mt-4 space-y-2">
                      {group.options.map((option) => (
                        <div className="rounded-[12px] border border-amber-100/60 bg-amber-50/50 px-4 py-3" key={option.flag}>
                          <code className="block text-xs text-amber-700 font-mono">{option.flag}</code>
                          <p className="mt-1.5 text-xs leading-5 text-stone-600">{option.effect}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-amber-100/80 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 glow-border" id="config">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <h2 className="font-display text-2xl md:text-3xl text-stone-900">{activeCopy.configTitle}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
              <p className="text-sm leading-7 text-stone-500">{activeCopy.configIntro}</p>
              <div className="mt-6 space-y-4">
                {activeCopy.configBlocks.map((block, i) => (
                  <article
                    className={`rounded-[20px] border p-5 card-hover ${
                      block.tone === "accent"
                        ? "border-amber-300/50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-md"
                        : "border-amber-100/60 bg-white/80 shadow-sm"
                    }`}
                    style={{ animationDelay: `${0.08 * i}s` }}
                    key={block.title}
                  >
                    <h3 className="font-display text-lg text-stone-900">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{block.body}</p>
                    {block.bullets ? (
                      <ul className="mt-4 space-y-1.5 pl-4 text-sm leading-6 text-stone-600">
                        {block.bullets.map((item) => (
                          <li className="text-stone-700" key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {block.code ? (
                      <pre className="mt-4 overflow-x-auto rounded-[12px] bg-stone-900/90 p-4 text-xs leading-6 text-stone-100 border border-stone-700 font-mono"><code>{block.code}</code></pre>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-amber-100/80 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 glow-border" id="faq">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <h2 className="font-display text-2xl md:text-3xl text-stone-900">{activeCopy.faqTitle}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
              <div className="mt-6 space-y-4">
                {activeCopy.faqs.map((item, i) => (
                  <article className="rounded-[20px] border border-amber-100/60 bg-white/80 p-5 card-hover shadow-sm animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }} key={item.question}>
                    <strong className="block text-base text-stone-900">{item.question}</strong>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
