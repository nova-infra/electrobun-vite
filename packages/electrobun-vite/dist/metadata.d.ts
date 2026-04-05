export declare const PACKAGE_VERSION = "0.2.3";
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
export declare const starterVersions: {
    readonly electrobun: "1.16.0";
    readonly react: "19.2.4";
    readonly reactDom: "19.2.4";
    readonly vite: "8.0.0";
    readonly tailwindcss: "4.2.1";
};
export declare const starterDependencyVersions: {
    readonly "@nova-infra/electrobun-vite": "0.2.3";
    readonly electrobun: "1.16.0";
    readonly react: "19.2.4";
    readonly "react-dom": "19.2.4";
    readonly vite: "8.0.0";
    readonly "@vitejs/plugin-react": "6.0.1";
    readonly typescript: "^5.9.3";
    readonly "@types/bun": "latest";
    readonly "@types/react": "19.2.14";
    readonly "@types/react-dom": "19.2.3";
};
export declare const workspaceModules: WorkspaceModule[];
export declare const templatePackages: TemplatePackage[];
