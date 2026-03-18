export class Electroview<T = unknown> {
  static defineRPC<T>(config: {
    handlers: {
      requests?: Record<string, (params: any) => any>;
      messages?: Record<string, (params: any) => any>;
    };
  }): T {
    return config as T;
  }

  rpc:
    | {
        request: Record<string, (params: any) => Promise<any>>;
        send: Record<string, (params: any) => void>;
      }
    | undefined;

  constructor(options?: { rpc?: T }) {
    void options;
    this.rpc = undefined;
  }
}
