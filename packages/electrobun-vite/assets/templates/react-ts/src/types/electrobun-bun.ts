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

export class BrowserWindow {
  constructor(_options: {
    title?: string;
    url: string;
    rpc?: unknown;
  }) {}
}

export const ApplicationMenu = {
  setApplicationMenu(_menu: any[]): void {},
};

const Electrobun = {
  events: {
    on(_eventName: string, _handler: () => unknown): void {},
  },
};

export default Electrobun;
