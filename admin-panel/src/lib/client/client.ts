import Medusa from "@medusajs/js-sdk";

const runtimeBackend = typeof window !== "undefined" && (window as any).__MEDUSA_BACKEND_URL__
export const backendUrl = runtimeBackend || __BACKEND_URL__ ?? "/";

export const sdk = new Medusa({
  baseUrl: backendUrl,
});

// useful when you want to call the BE from the console and try things out quickly
// Only expose in development to prevent production security issues
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as any).__sdk = sdk;
}
