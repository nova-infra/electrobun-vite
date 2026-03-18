import type { RPCSchema } from "electrobun/bun";

export const APP_NAME = "Demo";

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
      getWindowFrame: {
        params: {};
        response: { x: number; y: number; width: number; height: number };
      };
      windowMinimize: { params: {}; response: void };
      windowMaximize: { params: {}; response: void };
      windowUnmaximize: { params: {}; response: void };
      windowSetFullScreen: { params: { value: boolean }; response: void };
      windowSetAlwaysOnTop: { params: { value: boolean }; response: void };
      windowSetTitle: { params: { title: string }; response: void };
      showContextMenu: {
        params: { items: ContextMenuItem[] };
        response: void;
      };
      traySetTitle: { params: { title: string }; response: void };
      getLastEvent: {
        params: {};
        response: { kind: string; data: string };
      };
    };
    messages: {
      log: { message: string };
    };
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};

export type ContextMenuItem =
  | { type: "separator" }
  | { type: "divider" }
  | { label: string; action: string; enabled?: boolean; tooltip?: string };
