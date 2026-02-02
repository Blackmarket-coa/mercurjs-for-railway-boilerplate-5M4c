type LogArgs = Parameters<typeof console.log>

const isDev = import.meta.env.DEV

export const devLogger = {
  log: (...args: LogArgs) => {
    if (isDev) {
      console.log(...args)
    }
  },
  warn: (...args: LogArgs) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  error: (...args: LogArgs) => {
    if (isDev) {
      console.error(...args)
    }
  },
}
