import { QueryClient } from "@tanstack/react-query"

const runtimeBackend = typeof window !== 'undefined' && (window as any).__MEDUSA_BACKEND_URL__
export const MEDUSA_BACKEND_URL = (runtimeBackend || __BACKEND_URL__) ?? "/"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 90000,
      retry: 1,
    },
  },
})
