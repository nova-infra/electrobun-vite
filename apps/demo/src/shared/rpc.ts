import type { RPCSchema } from "electrobun/bun";

export const APP_NAME = "Nova Infra Demo";

export type AppRPC = {
  bun: RPCSchema<{
    requests: {
      getAppState: {
        params: {};
        response: {
          appName: string;
          bunVersion: string;
          platform: string;
          mode: "development" | "production";
        };
      };
    };
    messages: {
      log: {
        message: string;
      };
    };
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
