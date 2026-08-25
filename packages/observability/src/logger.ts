/**
 * The one logging interface every package/app uses, instead of calling
 * console.log directly. Deliberately minimal — this is the observability
 * boundary the foundation needs, not a full tracing/metrics platform
 * (which would be premature before there's real production traffic).
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  /** Returns a new logger that merges `fields` into every subsequent call — e.g. request-scoped context. */
  child(fields: LogFields): Logger;
}

interface StructuredLogLine {
  level: LogLevel;
  message: string;
  time: string;
  [key: string]: unknown;
}

export function createLogger(baseFields: LogFields = {}): Logger {
  function write(level: LogLevel, message: string, fields?: LogFields): void {
    const line: StructuredLogLine = {
      level,
      message,
      time: new Date().toISOString(),
      ...baseFields,
      ...fields,
    };
    const target = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    target(JSON.stringify(line));
  }

  return {
    debug: (message, fields) => write("debug", message, fields),
    info: (message, fields) => write("info", message, fields),
    warn: (message, fields) => write("warn", message, fields),
    error: (message, fields) => write("error", message, fields),
    child: (fields) => createLogger({ ...baseFields, ...fields }),
  };
}

export const rootLogger: Logger = createLogger({ service: "zuvre" });
