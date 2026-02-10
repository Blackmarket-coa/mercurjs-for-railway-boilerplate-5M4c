const PRINTFUL_API_KEY_ENV_KEYS = ["PRINTFUL_API_KEY", "PRINTFUL_API_TOKEN", "PRINTFUL_TOKEN"] as const

export const getPrintfulApiKey = (): string | undefined => {
  for (const envKey of PRINTFUL_API_KEY_ENV_KEYS) {
    const value = process.env[envKey]

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

export const getPrintfulStoreId = (): string | undefined => {
  const value = process.env.PRINTFUL_STORE_ID

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
}
