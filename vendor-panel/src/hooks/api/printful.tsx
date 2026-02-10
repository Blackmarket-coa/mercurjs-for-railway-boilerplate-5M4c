import { FetchError } from "@medusajs/js-sdk"
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const PRINTFUL_CATALOG_KEY = "printful_catalog" as const
export const printfulCatalogQueryKeys = queryKeysFactory(PRINTFUL_CATALOG_KEY)

const PRINTFUL_IMPORT_KEY = "printful_import" as const
export const printfulImportQueryKeys = queryKeysFactory(PRINTFUL_IMPORT_KEY)

export const usePrintfulCatalogPreview = (
  params?: { limit?: number; offset?: number },
  options?: Omit<UseQueryOptions<any, FetchError, any>, "queryKey" | "queryFn">
) => {
  const limit = params?.limit || 25
  const offset = params?.offset || 0

  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery(`/vendor/printful/catalog?limit=${limit}&offset=${offset}`, {
        method: "GET",
      }),
    queryKey: printfulCatalogQueryKeys.list({ limit, offset }),
    ...options,
  })

  return { ...data, ...rest }
}

export const usePrintfulImport = (
  options?: UseMutationOptions<
    any,
    FetchError,
    { product_ids: Array<number | string>; import_as_draft?: boolean }
  >
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/vendor/printful/import", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: printfulImportQueryKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
