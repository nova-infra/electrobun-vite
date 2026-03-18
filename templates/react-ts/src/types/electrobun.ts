export type ElectrobunConfig = {
  app: {
    name: string;
    identifier: string;
    version: string;
  };
  runtime?: {
    exitOnLastWindowClosed?: boolean;
  };
  build?: {
    bun?: {
      entrypoint?: string;
      external?: string[];
    };
    copy?: Record<string, string>;
  };
};
