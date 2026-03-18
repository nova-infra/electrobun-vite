export type RPCSchema<T> = T;

export class BrowserView {
  static defineRPC<T>(config: {
    handlers: {
      requests?: Record<string, (params: any) => any>;
      messages?: Record<string, (params: any) => any>;
    };
  }): T {
    return config as T;
  }
}

export interface BrowserWindowInstance {
  getFrame(): { x: number; y: number; width: number; height: number };
  minimize(): void;
  unminimize(): void;
  maximize(): void;
  unmaximize(): void;
  setFullScreen(value: boolean): void;
  setAlwaysOnTop(value: boolean): void;
  setTitle(title: string): void;
  focus(): void;
  on(event: string, handler: (e: { data: unknown }) => void): void;
}

export class BrowserWindow {
  constructor(_options: {
    title?: string;
    url: string;
    rpc?: unknown;
    frame?: { width: number; height: number };
    titleBarStyle?: "default" | "hidden" | "hiddenInset";
  }) {}
}

export const ApplicationMenu = {
  setApplicationMenu(_menu: unknown[]): void {},
};

export const ContextMenu = {
  showContextMenu(_items: unknown[]): void {},
};

export class Tray {
  constructor(_opts: { title?: string; width?: number; height?: number }) {}
  setMenu(_menu: unknown[]): void {}
  setTitle(_title: string): void {}
  on(_event: string, _handler: (e: { data: unknown }) => void): void {}
}

const Electrobun = {
  events: {
    on(_eventName: string, _handler: (e?: { data?: unknown; response?: unknown }) => unknown): void {},
  },
  Utils: {
    quit(): void {},
  },
};

export default Electrobun;
