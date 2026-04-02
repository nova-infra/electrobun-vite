export const PACKAGE_VERSION = "0.2.0";

export type WorkspaceModule = {
  name: string;
  description: string;
  descriptionZh: string;
};

export type TemplatePackage = {
  name: string;
  description: string;
  descriptionZh: string;
  directory: string;
  packageName: string;
};

export const starterVersions = {
  electrobun: "1.16.0",
  react: "19.2.4",
  reactDom: "19.2.4",
  vite: "8.0.0",
  tailwindcss: "4.2.1",
} as const;

export const starterDependencyVersions = {
  "@nova-infra/electrobun-vite": PACKAGE_VERSION,
  electrobun: starterVersions.electrobun,
  react: starterVersions.react,
  "react-dom": starterVersions.reactDom,
  vite: starterVersions.vite,
  "@vitejs/plugin-react": "6.0.1",
  typescript: "^5.9.3",
  "@types/bun": "latest",
  "@types/react": "19.2.14",
  "@types/react-dom": "19.2.3",
} as const;

export const workspaceModules: WorkspaceModule[] = [
  {
    name: "config",
    description: "Loads user config and keeps the default project conventions small.",
    descriptionZh: "负责读取用户配置，并保持默认约定足够轻量。",
  },
  {
    name: "cli",
    description: "Exposes a single command surface for info, dev, serve, build, preview, and create.",
    descriptionZh: "提供统一命令入口，覆盖 info、dev、serve、build、preview 与 create。",
  },
  {
    name: "create",
    description: "Scaffolds starter projects from the local template registry.",
    descriptionZh: "基于本地模板注册表生成 starter 项目。",
  },
  {
    name: "metadata",
    description: "Shares versions and docs-facing product metadata in one place.",
    descriptionZh: "统一维护版本信息与官网展示元数据。",
  },
  {
    name: "logger",
    description: "Normalizes CLI logs, subprocess output, and future runtime log handoff in one place.",
    descriptionZh: "统一处理 CLI 日志、子进程输出，以及后续运行时日志接入的公共约定。",
  },
];

export const templatePackages: TemplatePackage[] = [
  {
    name: "react-ts",
    description: "Electrobun + React 19 + Vite 8 starter with local AI skill guidance.",
    descriptionZh: "内置本地 AI skill 指南的 Electrobun + React 19 + Vite 8 模板。",
    directory: "react-ts",
    packageName: "@nova-infra/template-react-ts",
  },
];
