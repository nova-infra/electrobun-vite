export declare const listTemplates: () => import("./metadata").TemplatePackage[];
export declare const resolveTemplate: (name?: string) => import("./metadata").TemplatePackage;
export type ScaffoldProjectOptions = {
    cwd?: string;
    projectName: string;
    template?: string;
    force?: boolean;
};
export declare const scaffoldProject: ({ cwd, projectName, template, force, }: ScaffoldProjectOptions) => Promise<{
    targetDir: string;
    template: import("./metadata").TemplatePackage;
}>;
