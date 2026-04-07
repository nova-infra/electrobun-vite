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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <style>{`
        :root {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        
        .font-display {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        
        .font-mono {
          font-family: ui-monospace, "SF Mono", "Helvetica Neue", Monaco, Menlo, monospace;
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
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
          transition: all 0.2s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .btn-primary {
          background: #0071e3;
          color: #ffffff;
          border-radius: 980px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 400;
          transition: all 0.2s ease;
          display: inline-block;
          text-decoration: none;
        }
        
        .btn-primary:hover {
          background: #0077ed;
        }
        
        .btn-secondary {
          background: transparent;
          color: #0066cc;
          border-radius: 980px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 400;
          border: 1px solid #0066cc;
          transition: all 0.2s ease;
          display: inline-block;
          text-decoration: none;
        }
        
        .btn-secondary:hover {
          text-decoration: underline;
        }
        
        .link-blue {
          color: #0066cc;
          text-decoration: none;
        }
        
        .link-blue:hover {
          text-decoration: underline;
        }
        
        .code-block {
          background: #1d1d1f;
          border-radius: 8px;
          color: #f5f5f7;
        }
        
        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #d2d2d7, transparent);
        }
      `}</style>
      
      <div className="mx-auto max-w-[980px] px-4 py-8 md:px-8">
        <header className="text-center py-16 md:py-24">
          <div className="animate-fade-up">
            <span className="text-xs uppercase tracking-[0.1em] text-[#86868b]">
              {activeCopy.eyebrow}
            </span>
          </div>
          
          <h1 className="mt-4 font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.07] tracking-[-0.028em] text-[#1d1d1f] animate-fade-up delay-1">
            electrobun-vite
          </h1>
          
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] max-w-xl mx-auto animate-fade-up delay-2">
            {activeCopy.title}
          </p>
          
          <p className="mt-4 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)] max-w-2xl mx-auto animate-fade-up delay-3">
            {activeCopy.lede}
          </p>
          
          <p className="mt-3 text-[12px] leading-[1.33] tracking-[-0.12px] text-[#86868b] animate-fade-up delay-3">
            {activeCopy.sublede}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-up delay-4">
            {activeCopy.badges.map((badge) => (
              <span
                className="text-[12px] tracking-[-0.12px] text-[rgba(0,0,0,0.6)]"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up delay-5">
            <a className="btn-primary" href="#quickstart">
              {activeCopy.primaryCta}
            </a>
            <a className="btn-secondary" href="#cli">
              {activeCopy.secondaryCta}
            </a>
            <a className="btn-secondary" href="https://github.com/nova-infra/electrobun-vite" target="_blank" rel="noopener noreferrer">
              {activeCopy.repoLink}
            </a>
            <a className="btn-secondary" href="https://github.com/blackboardsh/electrobun" target="_blank" rel="noopener noreferrer">
              {activeCopy.electrobunRepoLink}
            </a>
          </div>
          
          <div className="mt-6 flex justify-center gap-4 animate-fade-up delay-6">
            <button
              className={`text-sm px-4 py-2 rounded-full transition-all ${
                locale === "zh" ? "bg-[#1d1d1f] text-white" : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
              onClick={() => setLocale("zh")}
              type="button"
            >
              中文
            </button>
            <button
              className={`text-sm px-4 py-2 rounded-full transition-all ${
                locale === "en" ? "bg-[#1d1d1f] text-white" : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
              onClick={() => setLocale("en")}
              type="button"
            >
              EN
            </button>
          </div>
        </header>

        <main className="space-y-16">
          <section id="packages">
            <div className="text-center mb-8">
              <h2 className="font-display text-[28px] leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                {activeCopy.packageTitle}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                {activeCopy.packageIntro}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeCopy.packageBlocks.map((block, i) => (
                <article
                  className="bg-white rounded-lg p-6 card-hover animate-scale-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                  key={block.title}
                >
                  <h3 className="font-display text-[17px] leading-[1.19] tracking-[0.231px] text-[#1d1d1f] font-bold">
                    {block.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {block.body}
                  </p>
                  {block.bullets ? (
                    <ul className="mt-4 space-y-2 pl-4 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#1d1d1f]">
                      {block.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          <section id="quickstart">
            <div className="text-center mb-8">
              <h2 className="font-display text-[28px] leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                {activeCopy.quickStartTitle}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                {activeCopy.quickStartIntro}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {activeCopy.quickStartSteps.map((step, i) => (
                <article
                  className="bg-white rounded-lg p-5 card-hover animate-fade-up"
                  style={{ animationDelay: `${0.12 * i}s` }}
                  key={step.title}
                >
                  <h3 className="font-display text-[17px] leading-[1.19] tracking-[0.231px] text-[#1d1d1f] font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {step.description}
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-md bg-[#1d1d1f] p-4 text-[13px] leading-[1.43] text-[#f5f5f7] font-mono"><code>{step.code}</code></pre>
                  {step.note ? (
                    <p className="mt-3 text-[12px] leading-[1.33] tracking-[-0.12px] text-[#86868b]">
                      {step.note}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          <section id="cli">
            <div className="text-center mb-8">
              <h2 className="font-display text-[28px] leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                {activeCopy.commandsTitle}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                {activeCopy.commandsIntro}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeCopy.commands.map((item, i) => (
                <article
                  className="bg-white rounded-lg p-5 card-hover animate-scale-in"
                  style={{ animationDelay: `${0.05 * i}s` }}
                  key={item.command}
                >
                  <p className="text-[12px] uppercase tracking-[0.14em] text-[#0071e3] font-medium">
                    {item.title}
                  </p>
                  <code className="mt-2 block text-[14px] text-[#1d1d1f] font-mono">
                    {item.command}
                  </code>
                  <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {item.description}
                  </p>
                  {item.details ? (
                    <ul className="mt-3 space-y-1 text-[12px] leading-[1.33] tracking-[-0.12px] text-[#86868b]">
                      {item.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {activeCopy.optionGroups.map((group, i) => (
                <article
                  className="bg-white rounded-lg p-5 card-hover animate-fade-up"
                  style={{ animationDelay: `${0.1 * i}s` }}
                  key={group.title}
                >
                  <h3 className="font-display text-[17px] leading-[1.19] tracking-[0.231px] text-[#1d1d1f] font-bold">
                    {group.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {group.intro}
                  </p>
                  <div className="mt-4 space-y-2">
                    {group.options.map((option) => (
                      <div className="rounded-lg bg-[#f5f5f7] px-4 py-3" key={option.flag}>
                        <code className="block text-[13px] text-[#0071e3] font-mono">
                          {option.flag}
                        </code>
                        <p className="mt-1 text-[12px] leading-[1.33] tracking-[-0.12px] text-[rgba(0,0,0,0.6)]">
                          {option.effect}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          <section id="config">
            <div className="text-center mb-8">
              <h2 className="font-display text-[28px] leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                {activeCopy.configTitle}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                {activeCopy.configIntro}
              </p>
            </div>
            <div className="space-y-4">
              {activeCopy.configBlocks.map((block, i) => (
                <article
                  className="bg-white rounded-lg p-5 card-hover animate-fade-up"
                  style={{ animationDelay: `${0.08 * i}s` }}
                  key={block.title}
                >
                  <h3 className="font-display text-[17px] leading-[1.19] tracking-[0.231px] text-[#1d1d1f] font-bold">
                    {block.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {block.body}
                  </p>
                  {block.bullets ? (
                    <ul className="mt-4 space-y-1.5 pl-4 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#1d1d1f]">
                      {block.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {block.code ? (
                    <pre className="mt-4 overflow-x-auto rounded-md bg-[#1d1d1f] p-4 text-[13px] leading-[1.43] text-[#00d992] font-mono"><code>{block.code}</code></pre>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          <section id="faq">
            <div className="text-center mb-8">
              <h2 className="font-display text-[28px] leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                {activeCopy.faqTitle}
              </h2>
            </div>
            <div className="space-y-4">
              {activeCopy.faqs.map((item, i) => (
                <article
                  className="bg-white rounded-lg p-5 card-hover animate-fade-up"
                  style={{ animationDelay: `${0.1 * i}s` }}
                  key={item.question}
                >
                  <strong className="block text-[17px] leading-[1.24] tracking-[-0.374px] text-[#1d1d1f] font-semibold">
                    {item.question}
                  </strong>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[rgba(0,0,0,0.6)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}