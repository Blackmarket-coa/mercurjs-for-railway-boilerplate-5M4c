export const MEDUSA_STOREFRONT_URL =
  __STOREFRONT_URL__ ??
  (typeof window !== "undefined" ? window.location.origin : "")
