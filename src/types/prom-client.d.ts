declare module "prom-client" {
  export class Registry {
    setDefaultLabels(labels: Record<string, string>): void;
  }

  export class Counter<T extends string> {
    constructor(config: { name: string; help: string; labelNames?: T[] });
    inc(labels?: Record<T, string>, value?: number): void;
  }

  export function collectDefaultMetrics(config: { register: Registry }): void;
}
