export type WorkspacePackage = {
  name: string;
  description: string;
};

export type TemplatePackage = {
  name: string;
  description: string;
  directory: string;
};

export const starterVersions = {
  electrobun: "1.16.0",
  react: "19.2.4",
  reactDom: "19.2.4",
  vite: "8.0.0",
} as const;

export const workspacePackages: WorkspacePackage[] = [
  {
    name: "@electrobun-vite/core",
    description: "Config discovery and toolchain runtime glue.",
  },
  {
    name: "@electrobun-vite/cli",
    description: "Command entry point for dev, build, and preview flows.",
  },
  {
    name: "@electrobun-vite/create",
    description: "Scaffolding helpers for starter generation.",
  },
  {
    name: "@electrobun-vite/shared",
    description: "Shared metadata, constants, and public types.",
  },
];

export const templatePackages: TemplatePackage[] = [
  {
    name: "@electrobun-vite/template-react-ts",
    description: "Electrobun + React 19 + Vite 8 starter with local AI skill guidance.",
    directory: "react-ts",
  },
];
