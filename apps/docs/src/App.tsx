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
        eyebrow: "Electrobun + Vite",
        title: "把第一次上手需要的命令收敛成最短主路径。",
        lede:
          "electrobun-vite 现在更适合作为一个直接上手的桌面开发入口：先创建项目，再启动 dev，最后 build / preview，不需要先消化一整页背景介绍。",
        sublede: `当前默认模板为 react-ts，文档示例基于 electrobun@${starterVersions.electrobun}、react@${starterVersions.react}、vite@${starterVersions.vite}。v0.2.0 新增 loadEnv 环境变量加载、多格式配置发现（.ts/.mts/.js/.mjs）以及 publicDir 默认约定。`,
        primaryCta: "Quick Start",
        secondaryCta: "查看 CLI",
        repoLink: "项目仓库",
        electrobunRepoLink: "Electrobun",
        badges: ["Quick Start", "单配置", "react-ts 模板", "CLI 参数说明", "v0.2.0 env 加载"],
        sections: [
          { id: "packages", label: "Packages", summary: "GitHub Packages 发布与安装方式。" },
          { id: "quickstart", label: "Quick Start", summary: "从创建项目到 build / preview 的最短路径。" },
          { id: "cli", label: "CLI", summary: "每个命令做什么，以及参数分别影响哪里。" },
          { id: "config", label: "Config", summary: "围绕一个 electrobun.vite.config.ts 工作。" },
          { id: "faq", label: "FAQ", summary: "保留两个最常见的问题，避免页面继续膨胀。" },
        ],
        configTitle: "Config",
        configIntro:
          "项目层继续围绕一个 `electrobun.vite.config.ts` 工作，把 renderer 和 Electrobun 相关配置放在同一个入口里看清楚。",
        configBlocks: [
          {
            title: "推荐结构",
            body: "如果你是第一次接入 electrobun-vite，先从这个结构开始，不必急着拆成多份配置。",
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
            body: "electrobun-vite 会按顺序查找以下文件，找到第一个存在的即停止。不需要手动指定后缀。",
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
              "注入前缀：`BUN_VITE_` 和 `VITE_`，其他变量不会被注入。",
              "在 renderer 中通过 `import.meta.env.VITE_XXX` 访问（Vite 原生支持）。",
              "在 Bun 主进程中通过 `process.env.BUN_VITE_XXX` 访问。",
            ],
          },
          {
            title: "publicDir 默认约定（v0.2.0）",
            body: "Vite 的静态资源目录默认指向项目根目录下的 `resources/`，与 Electrobun 的资源约定对齐，无需额外配置。",
            bullets: [
              "把图标、字体等静态资源放到 `resources/` 即可直接被 Vite 打包。",
              "可以在 `renderer.vite.publicDir` 里覆盖这个路径。",
            ],
          },
        ],
        packageTitle: "Packages",
        packageIntro:
          "包已经关联到这个 GitHub 仓库，并默认发布到 GitHub Packages。下面是安装时需要的最小配置。",
        packageBlocks: [
          {
            title: "全局 registry",
            body: "先把 `@nova-infra` 作用域在这台机器上指向 GitHub Packages。",
            code: `npm config set @nova-infra:registry https://npm.pkg.github.com`,
          },
          {
            title: "项目级 .npmrc",
            body: "再在项目里写入认证信息，确保安装时能通过 GitHub Packages 读取包。",
            code: `@nova-infra:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}`,
            note: "把 `NPM_TOKEN` 设成一个 GitHub classic PAT，至少需要 `read:packages`。本地可以 `export NPM_TOKEN=...`，CI 则放到 secret 里注入。",
          },
          {
            title: "安装命令",
            body: "然后按常规方式安装即可。Bun 和 npm 都可以直接使用同一个包名。",
            bullets: [
              "npm install @nova-infra/electrobun-vite",
              "bun add @nova-infra/electrobun-vite",
            ],
          },
        ],
        quickStartTitle: "Quick Start",
        quickStartIntro:
          "第一次使用时，按下面三步走就够了。先生成项目，再本地联调，最后构建和预览生产产物。",
        quickStartSteps: [
          {
            title: "1. 创建项目",
            description: "用 npx/bunx 一键生成项目（无需克隆本仓库），或在本仓库根目录执行脚手架。",
            code: `# 一键创建（推荐）\nnpx -p @nova-infra/electrobun-vite create-electrobun my-app\ncd my-app\n\n# 或在当前目录生成，并在需要时确认\nbunx -p @nova-infra/electrobun-vite create-electrobun .\nbunx -p @nova-infra/electrobun-vite create-electrobun\nbunx -p @nova-infra/electrobun-vite create-electrobun --force\n\n# 或从本仓库：bun install && bun run new -- my-app && cd my-app`,
            note: "Bun 用户也可以用 `bunx -p @nova-infra/electrobun-vite create-electrobun my-app`。`bunx -p @nova-infra/electrobun-vite create-electrobun .` 和 `bunx -p @nova-infra/electrobun-vite create-electrobun` 都会指向当前目录；如果目录不为空，会先确认再继续。加上 `--force` 就会跳过确认，直接生成。",
          },
          {
            title: "2. 本地开发",
            description: "安装依赖后直接启动开发模式，Vite renderer 和 Electrobun shell 会一起拉起。",
            code: `bun install\nbun run dev`,
            note: "如果你只想调试 renderer，可以在项目里运行 `electrobun-vite --rendererOnly`。",
          },
          {
            title: "3. 构建与预览",
            description: "确认生产资源和桌面壳子都能正常工作，再决定是否继续发布流程。",
            code: `bun run build\nbun run preview`,
            note: "`preview` 默认会先 build；如果你已经构建过，可以加 `--skipBuild`。",
          },
        ],
        commandsTitle: "CLI",
        commandsIntro:
          "CLI 只保留和日常使用直接相关的命令。下面先看命令本身，再看位置参数、全局参数和命令专属参数分别影响什么。",
        commands: [
          {
            title: "开发",
            command: "electrobun-vite [root]",
            description: "默认命令，等同于 `electrobun-vite dev [root]`，会同时启动 Vite dev server 和 Electrobun 应用。",
            details: [
              "`[root]` 可选，默认当前目录。",
              "`serve` 和 `dev` 都是它的别名。",
              "`--rendererOnly` 只启动 renderer，适合纯前端联调。",
            ],
          },
          {
            title: "构建",
            command: "electrobun-vite build [root]",
            description: "构建 renderer 产物，并把结果交给 Electrobun 打包桌面端资源。",
            details: [
              "`[root]` 可选，适合从 monorepo 根目录指定子项目。",
              "`--outDir` 会覆盖默认输出目录。",
              "`--watch` 会在支持的链路里持续重建。",
            ],
          },
          {
            title: "预览",
            command: "electrobun-vite preview [root]",
            description: "使用生产资源启动桌面应用，验证最终行为是否和 build 产物一致。",
            details: [
              "`preview` 默认会先执行一次 build。",
              "`--skipBuild` 会直接复用已有产物。",
              "适合在发布前快速验收窗口行为和资源路径。",
            ],
          },
          {
            title: "信息",
            command: "electrobun-vite info [root]",
            description: "输出解析后的配置文件位置、默认模板、版本信息和模板元数据。",
            details: [
              "适合排查 CLI 实际读到了哪个配置文件。",
              "`[root]` 可选，用来查看指定项目目录的解析结果。",
            ],
          },
          {
            title: "更新",
            command: "electrobun-vite update [root]",
            description: "刷新已有项目里的模板管理依赖版本、迁移旧脚本，然后执行 bun install。",
            details: [
              "适合项目已经创建过、但你想和当前 starter 版本对齐并清理旧脚本入口的时候。",
              "`[root]` 可选，默认当前目录。",
            ],
          },
          {
            title: "脚手架",
            command: "create-electrobun <projectName>",
            description: "创建新的桌面项目目录，并写入当前默认模板。",
            details: [
              "无需克隆仓库即可创建：`npx -p @nova-infra/electrobun-vite create-electrobun my-app`（Bun：`bunx -p @nova-infra/electrobun-vite create-electrobun my-app`）。",
              "`<projectName>` 是目标目录名，也是生成后的项目名。",
              "当前 starter 模板已独立发布为 `@nova-infra/template-react-ts`，脚手架会在生成时解析它。",
              "如果要在当前目录生成，请直接执行 `create-electrobun .` 或 `create-electrobun`；目录不为空时会先确认，或改用 `--force` 跳过确认。",
              "`-t, --template` 目前只接受 `react-ts`。",
              "`-f, --force` 会跳过确认并允许生成到已有目录。",
            ],
          },
        ],
        optionGroups: [
          {
            title: "位置参数",
            intro: "这些参数写在命令名后面，不带 `--`。",
            options: [
              { flag: "[root]", effect: "指定项目根目录；不传时默认使用当前工作目录。" },
              { flag: "<projectName>", effect: "指定脚手架输出目录名，`create` 命令必填。" },
            ],
          },
          {
            title: "全局参数",
            intro: "这些参数可用于 `dev / build / preview / info`，影响配置解析、日志或输出目录。",
            options: [
              { flag: "-c, --config <file>", effect: "指定要读取的配置文件，而不是默认查找 `electrobun.vite.config.ts`。" },
              { flag: "-l, --logLevel <level>", effect: "控制日志级别，可选 `info | warn | error | silent`。" },
              { flag: "--clearScreen", effect: "控制日志刷新时是否清屏，适合调试 watch 场景。" },
              { flag: "-m, --mode <mode>", effect: "设置运行模式，并参与 env 和配置解析。" },
              { flag: "-w, --watch", effect: "在支持 watch 的命令里持续监听文件变化并重建或重启。" },
              { flag: "--outDir <dir>", effect: "覆盖输出目录，影响 renderer 产物和后续打包交接目录。" },
              { flag: "--sourcemap", effect: "在支持 sourcemap 的链路里输出 source map，方便排查问题。" },
              { flag: "--entry <file>", effect: "为未来的 Bun entry 覆盖预留；当前主要是占位参数。" },
            ],
          },
          {
            title: "命令专属参数",
            intro: "只在对应命令下生效。",
            options: [
              { flag: "--rendererOnly", effect: "仅用于 `dev`，只启动 Vite renderer，不拉起 Electrobun shell。" },
              { flag: "--skipBuild", effect: "仅用于 `preview`，跳过预构建，直接使用现有产物。" },
              { flag: "-t, --template <template>", effect: "仅用于 `create`，选择模板；当前只支持 `react-ts`。" },
            ],
          },
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            question: "为什么页面里不再放部署、迁移、模板介绍这些内容？",
            answer:
              "因为首页现在优先承担“第一次上手”的职责。和 quick start 无关的内容先收掉，避免用户还没跑通命令就被背景信息打断。",
          },
          {
            question: "为什么构建日志里还会看到 electrobun.config.ts？",
            answer:
              "因为 Electrobun CLI 目前仍会查找这个文件，electrobun-vite 会在运行时临时生成（写入系统临时目录）并在命令结束后自动清理掉，不会污染项目目录。",
          },
          {
            question: "为什么 Bun 主进程读不到 VITE_ 开头的环境变量？",
            answer:
              "VITE_ 前缀的变量默认只会注入 Vite renderer 进程；Bun 主进程只接收 BUN_VITE_ 前缀的变量。如果你需要在两侧都能访问，改用 BUN_VITE_ 前缀，或在 electrobun.vite.config.ts 里通过 define 显式传入。",
          },
        ],
      },
      en: {
        eyebrow: "Electrobun + Vite",
        title: "Reduce first-run docs to the commands people actually need.",
        lede:
          "electrobun-vite now reads more like a practical getting-started guide: create a project, run dev, then build and preview. The landing page should help people ship, not make them scroll through repo history.",
        sublede: `The default template is still react-ts, and the examples here target electrobun@${starterVersions.electrobun}, react@${starterVersions.react}, and vite@${starterVersions.vite}. v0.2.0 adds loadEnv env-file loading, multi-format config discovery (.ts/.mts/.js/.mjs), and a publicDir default convention.`,
        primaryCta: "Quick Start",
        secondaryCta: "See CLI",
        repoLink: "Repository",
        electrobunRepoLink: "Electrobun",
        badges: ["Quick Start", "Single config", "react-ts template", "CLI parameter notes", "v0.2.0 loadEnv"],
        sections: [
          { id: "quickstart", label: "Quick Start", summary: "The shortest path from scaffold to build / preview." },
          { id: "cli", label: "CLI", summary: "What each command does and what every parameter affects." },
          { id: "config", label: "Config", summary: "Work around one electrobun.vite.config.ts file." },
          { id: "packages", label: "Packages", summary: "How to publish and install from GitHub Packages." },
          { id: "faq", label: "FAQ", summary: "Two common questions, without bringing back unrelated sections." },
        ],
        quickStartTitle: "Quick Start",
        quickStartIntro:
          "For a first run, these three steps are enough: scaffold the project, start local development, then build and preview production assets.",
        quickStartSteps: [
          {
            title: "1. Scaffold a project",
            description: "Use npx/bunx to create a project in one shot (no clone), or run the scaffold from this repo root.",
            code: `# One-liner (recommended)\nnpx -p @nova-infra/electrobun-vite create-electrobun my-app\ncd my-app\n\n# Or generate into the current directory and confirm if needed\nbunx -p @nova-infra/electrobun-vite create-electrobun .\nbunx -p @nova-infra/electrobun-vite create-electrobun\nbunx -p @nova-infra/electrobun-vite create-electrobun --force\n\n# Or from this repo: bun install && bun run new -- my-app && cd my-app`,
            note: "With Bun: `bunx -p @nova-infra/electrobun-vite create-electrobun my-app`. `bunx -p @nova-infra/electrobun-vite create-electrobun .` and `bunx -p @nova-infra/electrobun-vite create-electrobun` both target the current directory; if it is not empty, you will be asked to confirm first. Add `--force` to skip the prompt and scaffold immediately.",
          },
          {
            title: "2. Start local development",
            description: "Install dependencies in the generated app and start the combined Vite renderer + Electrobun development flow.",
            code: `bun install\nbun run dev`,
            note: "If you only need the renderer dev server, run `electrobun-vite --rendererOnly` inside the app.",
          },
          {
            title: "3. Build and preview",
            description: "Confirm that production assets and the desktop shell still behave correctly before moving on to release work.",
            code: `bun run build\nbun run preview`,
            note: "`preview` builds first by default. Add `--skipBuild` when you want to reuse an existing build.",
          },
        ],
        commandsTitle: "CLI",
        commandsIntro:
          "The CLI surface stays intentionally small. Read the commands first, then use the parameter groups below to see exactly what each flag changes.",
        commands: [
          {
            title: "Development",
            command: "electrobun-vite [root]",
            description: "The default command, equivalent to `electrobun-vite dev [root]`, starts the Vite dev server and the Electrobun app together.",
            details: [
              "`[root]` is optional and defaults to the current directory.",
              "`serve` and `dev` are aliases for the same flow.",
              "`--rendererOnly` keeps the run focused on the renderer dev server.",
            ],
          },
          {
            title: "Build",
            command: "electrobun-vite build [root]",
            description: "Build the renderer output, then hand those assets off to Electrobun packaging.",
            details: [
              "`[root]` is useful when you launch from a monorepo root.",
              "`--outDir` overrides the default output directory.",
              "`--watch` keeps rebuilding where the flow supports it.",
            ],
          },
          {
            title: "Preview",
            command: "electrobun-vite preview [root]",
            description: "Run the desktop app against production assets so final behavior matches the build output you intend to ship.",
            details: [
              "`preview` triggers a build first by default.",
              "`--skipBuild` reuses existing output instead of rebuilding.",
              "This is the fast final verification command before release work.",
            ],
          },
          {
            title: "Info",
            command: "electrobun-vite info [root]",
            description: "Print the resolved config path, default template, versions, and template metadata.",
            details: [
              "Useful when you need to confirm which config file the CLI actually resolved.",
              "`[root]` lets you inspect a specific project directory.",
            ],
          },
          {
            title: "Update",
            command: "electrobun-vite update [root]",
            description: "Refresh template-managed dependency versions, migrate old scripts, and then run bun install.",
            details: [
              "Use this when a project was created earlier and you want it aligned with the current starter versions and script layout.",
              "`[root]` is optional and defaults to the current directory.",
            ],
          },
          {
            title: "Scaffold",
            command: "create-electrobun <projectName>",
            description: "Create a new desktop project directory and write the current default starter into it.",
            details: [
              "No clone needed: `npx -p @nova-infra/electrobun-vite create-electrobun my-app` (Bun: `bunx -p @nova-infra/electrobun-vite create-electrobun my-app`).",
              "`<projectName>` becomes the output directory name.",
              "The current starter template is published separately as `@nova-infra/template-react-ts` and resolved by the CLI when scaffolding.",
              "To scaffold into the current directory, run `create-electrobun .` or just `create-electrobun`; if the directory is not empty, the CLI will ask before continuing, or pass `--force` to skip the prompt.",
              "`-t, --template` is currently limited to `react-ts`.",
              "`-f, --force` skips confirm prompts and allows scaffolding into existing directories.",
            ],
          },
        ],
        optionGroups: [
          {
            title: "Positional parameters",
            intro: "These appear directly after the command name, without `--`.",
            options: [
              { flag: "[root]", effect: "Choose the project root directory. Defaults to the current working directory." },
              { flag: "<projectName>", effect: "Choose the scaffold output directory name. Required for `create`." },
            ],
          },
          {
            title: "Global parameters",
            intro: "These work across `dev / build / preview / info` and affect config resolution, logging, or output paths.",
            options: [
              { flag: "-c, --config <file>", effect: "Read a specific config file instead of auto-discovering `electrobun.vite.config.ts`." },
              { flag: "-l, --logLevel <level>", effect: "Control CLI log verbosity: `info | warn | error | silent`." },
              { flag: "--clearScreen", effect: "Control whether previous logs are cleared between updates, especially in watch mode." },
              { flag: "-m, --mode <mode>", effect: "Set the mode used for env loading and config resolution." },
              { flag: "-w, --watch", effect: "Keep watching files and rebuild or restart when the active command supports it." },
              { flag: "--outDir <dir>", effect: "Override the output directory shared between renderer output and packaging handoff." },
              { flag: "--sourcemap", effect: "Emit source maps on commands that support them, which helps during debugging." },
              { flag: "--entry <file>", effect: "Reserved for future Bun entry overrides; currently a placeholder option." },
            ],
          },
          {
            title: "Command-specific parameters",
            intro: "These only apply to one command family.",
            options: [
              { flag: "--rendererOnly", effect: "For `dev` only. Start the Vite renderer dev server without launching the Electrobun shell." },
              { flag: "--skipBuild", effect: "For `preview` only. Reuse the existing build output instead of building first." },
              { flag: "-t, --template <template>", effect: "For `create` only. Pick the scaffold template, currently limited to `react-ts`." },
            ],
          },
        ],
        configTitle: "Config",
        configIntro:
          "Projects still center on one `electrobun.vite.config.ts`, so renderer and Electrobun settings stay visible in the same place.",
        configBlocks: [
          {
            title: "Recommended shape",
            body: "If you are starting fresh, begin with this shape instead of splitting configuration too early.",
            code: recommendedConfigCode,
            tone: "accent",
          },
          {
            title: "Key fields",
            body: "These are the fields worth understanding first.",
            bullets: [
              "`renderer.vite`: inline Vite configuration.",
              "`electrobun.outDir`: shared output directory between renderer output and desktop packaging.",
              "`electrobun.config`: app / build / copy details in one place.",
            ],
          },
          {
            title: "Multi-format config discovery",
            body: "electrobun-vite searches for the config file in this order and stops at the first match. No suffix is required.",
            bullets: [
              "`electrobun.vite.config.ts` (default, recommended)",
              "`electrobun.vite.config.mts`",
              "`electrobun.vite.config.js`",
              "`electrobun.vite.config.mjs`",
            ],
          },
          {
            title: "Env file loading (v0.2.0)",
            body: "The dev and build commands automatically load `.env` files from the project root and inject prefix-matched variables into the Electrobun subprocess environment.",
            bullets: [
              "Load order: `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local` (later files override earlier ones).",
              "Injected prefixes: `BUN_VITE_` and `VITE_`. Other variables are not injected.",
              "In the renderer, access them via `import.meta.env.VITE_XXX` (standard Vite behavior).",
              "In the Bun main process, access them via `process.env.BUN_VITE_XXX`.",
            ],
          },
          {
            title: "publicDir default (v0.2.0)",
            body: "The Vite static assets directory now defaults to `resources/` in the project root, aligned with Electrobun's resource conventions. No extra config needed.",
            bullets: [
              "Drop icons, fonts, and other static assets into `resources/` to have them picked up by Vite automatically.",
              "Override with `renderer.vite.publicDir` if a different path is needed.",
            ],
          },
        ],
        packageTitle: "Packages",
        packageIntro:
          "The package is linked to this GitHub repository and now publishes to GitHub Packages by default. Here is the minimum install setup.",
        packageBlocks: [
          {
            title: "Global registry",
            body: "First point the `@nova-infra` scope at GitHub Packages on this machine.",
            code: `npm config set @nova-infra:registry https://npm.pkg.github.com`,
          },
          {
            title: "Project .npmrc",
            body: "Then add auth in the project so installs can actually read from GitHub Packages.",
            code: `@nova-infra:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}`,
            note: "Set `NPM_TOKEN` to a GitHub classic PAT with at least `read:packages`. Locally you can `export NPM_TOKEN=...`; in CI, inject it from a secret.",
          },
          {
            title: "Install commands",
            body: "Then install the package normally. npm and Bun both use the same package name.",
            bullets: [
              "npm install @nova-infra/electrobun-vite",
              "bun add @nova-infra/electrobun-vite",
            ],
          },
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            question: "Why remove deploy, migration, and template overview content from the landing page?",
            answer:
              "Because the page should now act as a first-run guide. Anything that interrupts quick start without helping someone run their first commands was cut back.",
          },
          {
            question: "Why do build logs still mention electrobun.config.ts?",
            answer:
              "Because the Electrobun CLI still looks for that file today, so electrobun-vite generates it temporarily in the system temp directory and cleans it up automatically when the command exits — your project directory is never touched.",
          },
          {
            question: "Why can't the Bun main process see VITE_-prefixed variables?",
            answer:
              "VITE_ variables are injected into the Vite renderer process only. The Bun main process receives BUN_VITE_-prefixed variables. If you need the same value in both, use the BUN_VITE_ prefix, or pass it explicitly via define in electrobun.vite.config.ts.",
          },
        ],
      },
    }),
    [],
  );

  const activeCopy = copy[locale];

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
                  href="#quickstart"
                >
                  {activeCopy.primaryCta}
                </a>
                <a
                  className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
                  href="#cli"
                >
                  {activeCopy.secondaryCta}
                </a>
                <a
                  className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
                  href="https://github.com/nova-infra/electrobun-vite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeCopy.repoLink}
                </a>
                <a
                  className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
                  href="https://github.com/blackboardsh/electrobun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeCopy.electrobunRepoLink}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <img
                alt="electrobun-vite app preview"
                className="w-full rounded-[22px] border border-stone-900/10 bg-white object-cover shadow-[0_24px_50px_rgba(26,32,35,0.18)]"
                src={previewImage}
              />
              <nav className="grid grid-cols-2 gap-3 rounded-[20px] border border-stone-900/10 bg-white/72 p-4 text-sm md:grid-cols-2">
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
              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="packages">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.packageTitle}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{activeCopy.packageIntro}</p>
                <div className="mt-6 space-y-4">
                  {activeCopy.packageBlocks.map((block) => (
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

              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="quickstart">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.quickStartTitle}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{activeCopy.quickStartIntro}</p>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {activeCopy.quickStartSteps.map((step) => (
                    <article
                      className="rounded-[20px] border border-teal-700/12 bg-[linear-gradient(135deg,rgba(221,245,239,0.92),rgba(255,251,245,0.94))] p-5"
                      key={step.title}
                    >
                      <h3 className="m-0 text-lg text-stone-950">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{step.description}</p>
                      <pre className="mt-4 overflow-x-auto rounded-[18px] bg-stone-950 p-4 text-sm leading-7 text-stone-100"><code>{step.code}</code></pre>
                      {step.note ? <p className="mt-3 text-xs leading-6 text-stone-500">{step.note}</p> : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="cli">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.commandsTitle}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{activeCopy.commandsIntro}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activeCopy.commands.map((item) => (
                    <article className="rounded-[20px] border border-stone-900/10 bg-white/80 p-5" key={item.command}>
                      <p className="m-0 text-xs uppercase tracking-[0.14em] text-stone-500">{item.title}</p>
                      <code className="mt-3 block text-sm text-stone-950">{item.command}</code>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                      {item.details ? (
                        <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-stone-700">
                          {item.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                  {activeCopy.optionGroups.map((group) => (
                    <article className="rounded-[20px] border border-stone-900/10 bg-white/80 p-5" key={group.title}>
                      <h3 className="m-0 text-lg text-stone-950">{group.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{group.intro}</p>
                      <div className="mt-4 space-y-3">
                        {group.options.map((option) => (
                          <div className="rounded-[16px] border border-stone-900/8 bg-[rgba(250,248,244,0.92)] px-4 py-3" key={option.flag}>
                            <code className="block text-sm text-stone-950">{option.flag}</code>
                            <p className="mt-2 text-sm leading-7 text-stone-600">{option.effect}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-900/10 bg-[rgba(255,251,245,0.86)] p-6" id="config">
                <h2 className="m-0 text-2xl md:text-3xl">{activeCopy.configTitle}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-stone-600">{activeCopy.configIntro}</p>
                <div className="mt-6 space-y-4">
                  {activeCopy.configBlocks.map((block) => (
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
