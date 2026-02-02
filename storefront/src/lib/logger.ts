type LoggerArgs = Parameters<typeof console.log>

const isProduction = process.env.NODE_ENV === "production"

export const logger = {
  info: (...args: LoggerArgs) => {
    if (!isProduction) {
      console.info(...args)
    }
  },
  warn: (...args: LoggerArgs) => {
    console.warn(...args)
  },
  error: (...args: LoggerArgs) => {
    console.error(...args)
  },
  debug: (...args: LoggerArgs) => {
    if (!isProduction) {
      console.debug(...args)
    }
  },
}
