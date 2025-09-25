declare module "pino" {
  interface LoggerOptions {
    level?: string;
    transport?: {
      target: string;
      options?: {
        colorize?: boolean;
      };
    };
  }

  interface Logger {
    warn: (obj: Record<string, unknown>, msg: string) => void;
  }

  function pino(options?: LoggerOptions): Logger;

  export default pino;
}
