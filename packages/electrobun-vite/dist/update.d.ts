export type UpdateProjectOptions = {
    cwd?: string;
};
export declare const updateProject: ({ cwd }?: UpdateProjectOptions) => Promise<{
    changed: boolean;
    changes: Array<{
        name: string;
        from: string;
        to: string;
    }>;
}>;
